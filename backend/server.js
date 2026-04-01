// server.js — BudgetTracker API with multi-user auth
// npm install express cors pg dotenv bcryptjs jsonwebtoken google-auth-library

import express        from "express";
import cors           from "cors";
import pg             from "pg";
import dotenv         from "dotenv";
import bcrypt         from "bcryptjs";
import jwt            from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app    = express();

// Required for Neon
const pool   = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { require: true, rejectUnauthorized: false } 
});

const google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Fixed: Replaced wildcard "*" with your actual Vercel URL to prevent CORS crash with credentials
const frontendUrl = process.env.FRONTEND_URL || "https://budget-app-alpha-roan.vercel.app";
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

const JWT_SECRET         = process.env.JWT_SECRET         || "change-me-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-change-me-too";
const currentMonth = () => new Date().getMonth() + 1;
const currentYear  = () => new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const signAccess  = (user) => jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "15m" });
const signRefresh = (user) => jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

const saveRefreshToken = async (userId, token) => {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1,$2,$3)`,
    [userId, token, expires]
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized." });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token expired or invalid." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Register with email + password
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "Name, email, and password are required." });
  if (password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters." });

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: "An account with this email already exists." });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, provider, is_verified)
       VALUES ($1,$2,$3,'email',true) RETURNING id, email, name, avatar_url`,
      [email.toLowerCase(), hash, name.trim()]
    );
    const user         = rows[0];
    const accessToken  = signAccess(user);
    const refreshToken = signRefresh(user);
    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({ user, accessToken, refreshToken });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login with email + password
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND provider='email'",
      [email.toLowerCase()]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid email or password." });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password." });

    const accessToken  = signAccess(user);
    const refreshToken = signRefresh(user);
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      accessToken,
      refreshToken,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth — verify ID token from frontend Google Sign-In
app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing Google credential." });

  try {
    const ticket  = await google.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Upsert user
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, avatar_url, provider, google_id, is_verified)
       VALUES ($1,$2,$3,'google',$4,true)
       ON CONFLICT (email) DO UPDATE
         SET name=EXCLUDED.name, avatar_url=EXCLUDED.avatar_url,
             google_id=EXCLUDED.google_id, updated_at=NOW()
       RETURNING id, email, name, avatar_url`,
      [email.toLowerCase(), name, picture, googleId]
    );
    const user         = rows[0];
    const accessToken  = signAccess(user);
    const refreshToken = signRefresh(user);
    await saveRefreshToken(user.id, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      accessToken,
      refreshToken,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh access token
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Missing refresh token." });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const session = await pool.query(
      "SELECT * FROM sessions WHERE refresh_token=$1 AND expires_at > NOW()",
      [refreshToken]
    );
    if (!session.rows.length) return res.status(401).json({ error: "Session expired. Please log in again." });

    const { rows } = await pool.query("SELECT id, email, name, avatar_url FROM users WHERE id=$1", [payload.id]);
    if (!rows.length) return res.status(401).json({ error: "User not found." });

    res.json({ accessToken: signAccess(rows[0]) });

  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token." });
  }
});

// Logout — revoke refresh token
app.post("/api/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await pool.query("DELETE FROM sessions WHERE refresh_token=$1", [refreshToken]);
  res.json({ success: true });
});

// Get current user
app.get("/api/auth/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, name, avatar_url, created_at FROM users WHERE id=$1",
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: "User not found." });
  res.json(rows[0]);
});

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS  (all scoped to req.user.id)
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/transactions", requireAuth, async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());
  try {
    const { rows } = await pool.query(
      `SELECT * FROM transactions WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3 ORDER BY transaction_date DESC NULLS LAST, id DESC`,
      [req.user.id, year, month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", requireAuth, async (req, res) => {
  const {
    description, amount, category, sub_category,
    section = "expense", transaction_date,
    budget_month = currentMonth(), budget_year = currentYear(),
    expected_amount = 0,
  } = req.body;

  if (!description || amount == null || !category)
    return res.status(400).json({ error: "description, amount, and category are required." });

  try {
    const { rows } = await pool.query(
      `INSERT INTO transactions (user_id, description, amount, category, sub_category, section, transaction_date, budget_month, budget_year, expected_amount, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, description, amount, category, sub_category, section,
      transaction_date || null, budget_month, budget_year, expected_amount,
      section === "income" ? "income" : "expense"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/transactions/:id", requireAuth, async (req, res) => {
  const { description, amount, category, sub_category, section, transaction_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE transactions SET description=COALESCE($1,description), amount=COALESCE($2,amount), category=COALESCE($3,category), sub_category=COALESCE($4,sub_category), section=COALESCE($5,section), transaction_date=COALESCE($6,transaction_date) WHERE id=$7 AND user_id=$8 RETURNING *`,
      [description, amount, category, sub_category, section, transaction_date, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET PLANS
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/budget-plans", requireAuth, async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());
  try {
    const { rows } = await pool.query(
      `SELECT * FROM budget_plans WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3 ORDER BY section, category, sub_category`,
      [req.user.id, year, month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/budget-plans", requireAuth, async (req, res) => {
  const { budget_year, budget_month, section, category, sub_category, budget_amount, expected_date } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO budget_plans (user_id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (user_id, budget_year, budget_month, section, sub_category) DO UPDATE SET budget_amount=EXCLUDED.budget_amount, expected_date=EXCLUDED.expected_date RETURNING *`,
      [req.user.id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

app.put("/api/monthly-summary", requireAuth, async (req, res) => {
  const { budget_year, budget_month, start_balance } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO monthly_summaries (user_id, budget_year, budget_month, start_balance) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, budget_year, budget_month) DO UPDATE SET start_balance=EXCLUDED.start_balance, updated_at=NOW() RETURNING *`,
      [req.user.id, budget_year, budget_month, start_balance]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/summary", requireAuth, async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());

  try {
    const [plansRes, actualRes, summaryRes] = await Promise.all([
      pool.query(
        `SELECT section, category, sub_category, budget_amount, expected_date FROM budget_plans WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3`,
        [req.user.id, year, month]
      ),
      pool.query(
        `SELECT section, category, sub_category, SUM(amount) AS actual FROM transactions WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3 GROUP BY section, category, sub_category`,
        [req.user.id, year, month]
      ),
      pool.query(
        `SELECT * FROM monthly_summaries WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3`,
        [req.user.id, year, month]
      ),
    ]);

    const baseline     = summaryRes.rows[0] || {};
    const startBalance = parseFloat(baseline.start_balance) || 0;

    const planned  = {};
    const planMeta = {};
    plansRes.rows.forEach(r => {
      planned[r.sub_category]  = parseFloat(r.budget_amount) || 0;
      planMeta[r.sub_category] = r;
    });

    const actuals = {};
    actualRes.rows.forEach(r => { actuals[r.sub_category] = parseFloat(r.actual) || 0; });

    // Resolve Tithe percentage
    const incomePlannedRaw = ["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"]
      .reduce((s, k) => s + (planned[k] || 0), 0);
    if (planned["Tithe"] != null && planned["Tithe"] <= 1 && planned["Tithe"] > 0) {
      planned["Tithe"] = incomePlannedRaw * planned["Tithe"];
    }

    const sumKeys = (keys) => keys.reduce(
      (acc, k) => ({ planned: acc.planned + (planned[k] || 0), actual: acc.actual + (actuals[k] || 0) }),
      { planned: 0, actual: 0 }
    );

    const incomeKeys  = ["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"];
    const savingsKeys = ["Petra Savings Booster","IC Liquidity Fund","Trade Stocks"];
    const billsKeys   = ["Internet","Wi-Fi","Dues","Airtime"];
    const debtsKeys   = plansRes.rows.filter(r => r.category === "Debts").map(r => r.sub_category);
    const varExpKeys  = ["Dining Out/Take Out","Groceries","Uber","Public transport",
                         "Personal Care","Tithe","Utilities","Home Supplies","Health/Medical","Travel","Other"];

    const income           = sumKeys(incomeKeys);
    const savings          = sumKeys(savingsKeys);
    const bills            = sumKeys(billsKeys);
    const debts            = sumKeys(debtsKeys.length ? debtsKeys : ["Debt 1"]);
    const variableExpenses = sumKeys(varExpKeys);

    const totalExpenses = {
      planned: bills.planned + debts.planned + variableExpenses.planned,
      actual:  bills.actual  + debts.actual  + variableExpenses.actual,
    };
    const balance = {
      planned: startBalance + income.planned - totalExpenses.planned - savings.planned,
      actual:  startBalance + income.actual  - totalExpenses.actual  - savings.actual,
    };
    const spent = { planned: totalExpenses.planned, actual: totalExpenses.actual };

    const savingsBreakdown = savingsKeys.map(k => ({
      sub_category: k, planned: planned[k] || 0, actual: actuals[k] || 0,
    }));

    res.json({ year, month, startBalance, income, savings, bills, debts,
               variableExpenses, totalExpenses, balance, spent, savingsBreakdown });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BudgetTracker API on port ${PORT}`));
