import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const { Pool } = pkg;
const app = express();

// CORS Setup - Must come before routes
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    if (!process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// ── REGISTER ─────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, provider)
       VALUES ($1, $2, $3, 'email')
       RETURNING id, name, email, avatar_url`,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = newUser.rows[0];
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    if (user.provider !== "email") {
      return res.status(400).json({ error: "This account uses Google sign-in. Please use the Google button." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── GOOGLE LOGIN ──────────────────────────────────────────────────
app.post("/api/auth/google", async (req, res) => {
  const idToken = req.body.credential || req.body.token;
  if (!idToken) {
    return res.status(400).json({ error: "Missing Google token." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture: avatar_url } = payload;

    let result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    let user;

    if (result.rows.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO users (name, email, avatar_url, provider, google_id)
         VALUES ($1, $2, $3, 'google', $4)
         RETURNING id, name, email, avatar_url`,
        [name, email.toLowerCase(), avatar_url, google_id]
      );
      user = newUser.rows[0];
    } else {
      user = result.rows[0];
      if (!user.google_id) {
        await pool.query(
          "UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3",
          [google_id, avatar_url, user.id]
        );
      }
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(500).json({ error: "Google sign-in failed. Please try again." });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── SUMMARY ───────────────────────────────────────────────────────
app.get("/api/summary", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const [sumRes, txRes, planRes] = await Promise.all([
      pool.query(
        "SELECT start_balance FROM monthly_summaries WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3",
        [req.user.id, year, month]
      ),
      pool.query(
        "SELECT section, sub_category, SUM(amount) AS actual FROM transactions WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3 GROUP BY section, sub_category",
        [req.user.id, year, month]
      ),
      pool.query(
        "SELECT section, sub_category, budget_amount FROM budget_plans WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3",
        [req.user.id, year, month]
      ),
    ]);

    const startBalance = parseFloat(sumRes.rows[0]?.start_balance) || 0;
    const planned = {};
    planRes.rows.forEach(r => { planned[r.sub_category] = parseFloat(r.budget_amount) || 0; });
    const actuals = {};
    txRes.rows.forEach(r => { actuals[r.sub_category] = parseFloat(r.actual) || 0; });

    const incomePlanned = ["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"]
      .reduce((s, k) => s + (planned[k] || 0), 0);
    
    if (planned["Tithe"] != null && planned["Tithe"] <= 1 && planned["Tithe"] > 0) {
      planned["Tithe"] = incomePlanned * planned["Tithe"];
    }

    const sumKeys = (keys) => keys.reduce(
      (acc, k) => ({ planned: acc.planned + (planned[k] || 0), actual: acc.actual + (actuals[k] || 0) }),
      { planned: 0, actual: 0 }
    );

    const income = sumKeys(["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"]);
    const savings = sumKeys(["Petra Savings Booster","IC Liquidity Fund","Trade Stocks"]);
    const bills = sumKeys(["Internet","Wi-Fi","Dues","Airtime"]);
    
    const variableKeys = ["Dining Out/Take Out","Groceries","Uber","Public transport","Personal Care","Tithe","Utilities","Home Supplies","Health/Medical","Travel","Other"];
    const variableExpenses = sumKeys(variableKeys);

    const totalExpenses = {
      planned: bills.planned + variableExpenses.planned,
      actual:  bills.actual  + variableExpenses.actual,
    };

    const balance = {
      planned: startBalance + income.planned - totalExpenses.planned - savings.planned,
      actual:  startBalance + income.actual  - totalExpenses.actual  - savings.actual,
    };

    const savingsBreakdown = ["Petra Savings Booster","IC Liquidity Fund","Trade Stocks"].map(k => ({
      sub_category: k, planned: planned[k] || 0, actual: actuals[k] || 0,
    }));

    res.json({ year, month, startBalance, income, savings, bills, variableExpenses, totalExpenses, balance, savingsBreakdown });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── OTHER ROUTES ──────────────────────────────────────────────────
app.put("/api/monthly-summary", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, start_balance } = req.body;
  try {
    await pool.query(
      `INSERT INTO monthly_summaries (user_id, budget_year, budget_month, start_balance) 
       VALUES ($1,$2,$3,$4) 
       ON CONFLICT (user_id, budget_year, budget_month) 
       DO UPDATE SET start_balance = EXCLUDED.start_balance`,
      [req.user.id, budget_year, budget_month, start_balance]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/transactions", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3 ORDER BY transaction_date DESC, id DESC",
      [req.user.id, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", authenticateToken, async (req, res) => {
  const { description, amount, category, sub_category, section, transaction_date, budget_month, budget_year } = req.body;
  try {
    await pool.query(
      `INSERT INTO transactions (user_id, description, amount, category, sub_category, section, transaction_date, budget_month, budget_year) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [req.user.id, description, amount, category, sub_category, section, transaction_date, budget_month, budget_year]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/budget-plans", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM budget_plans WHERE user_id=$1 AND budget_year=$2 AND budget_month=$3",
      [req.user.id, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/budget-plans", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, section, category, sub_category, budget_amount, expected_date } = req.body;
  try {
    await pool.query(
      `INSERT INTO budget_plans (user_id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
       ON CONFLICT (user_id, budget_year, budget_month, section, sub_category) 
       DO UPDATE SET budget_amount=EXCLUDED.budget_amount, expected_date=EXCLUDED.expected_date`,
      [req.user.id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`BudgetTracker API running on port ${PORT}`));
