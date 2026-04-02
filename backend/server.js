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
app.use(express.json());

// CORS Setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── SECURITY MIDDLEWARE ──────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// ── AUTHENTICATION ROUTES ────────────────────────────────────────

// 1. Register with Email
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ error: "Email already in use." });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, provider) VALUES ($1, $2, $3, 'email') RETURNING id, name, email, avatar_url",
      [name, email, password_hash]
    );

    const user = newUser.rows[0];
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login with Email
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials." });

    const user = result.rows[0];
    if (user.provider !== 'email') return res.status(400).json({ error: "Please log in with Google." });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Google Login
app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture: avatar_url } = payload;

    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;

    if (result.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO users (name, email, avatar_url, provider, google_id) VALUES ($1, $2, $3, 'google', $4) RETURNING id, name, email, avatar_url",
        [name, email, avatar_url, google_id]
      );
      user = newUser.rows[0];
    } else {
      user = result.rows[0];
      if (!user.google_id) {
        await pool.query("UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3", [google_id, avatar_url, user.id]);
      }
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: "Google verification failed." });
  }
});

// ── DATA ROUTES (Protected by authenticateToken) ─────────────

// GET Summary
app.get("/api/summary", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const sumRes = await pool.query(
      "SELECT start_balance FROM monthly_summaries WHERE user_id = $1 AND budget_year = $2 AND budget_month = $3",
      [req.user.id, year, month]
    );
    const startBalance = sumRes.rows[0]?.start_balance || 0;

    const txRes = await pool.query(
      "SELECT section, amount FROM transactions WHERE user_id = $1 AND budget_year = $2 AND budget_month = $3",
      [req.user.id, year, month]
    );
    
    let actualIncome = 0, actualExpenses = 0, actualSavings = 0;
    txRes.rows.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.section === "income") actualIncome += amt;
      else if (tx.section === "expense") actualExpenses += amt;
      else if (tx.section === "savings") actualSavings += amt;
    });

    res.json({ startBalance, income: { actual: actualIncome }, totalExpenses: { actual: actualExpenses }, savings: { actual: actualSavings }, balance: { actual: startBalance + actualIncome - actualExpenses - actualSavings } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Start Balance
app.put("/api/monthly-summary", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, start_balance } = req.body;
  try {
    await pool.query(
      `INSERT INTO monthly_summaries (user_id, budget_year, budget_month, start_balance) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, budget_year, budget_month) 
       DO UPDATE SET start_balance = EXCLUDED.start_balance`,
      [req.user.id, budget_year, budget_month, start_balance]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Transactions
app.get("/api/transactions", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND budget_year = $2 AND budget_month = $3 ORDER BY transaction_date DESC, id DESC",
      [req.user.id, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Transaction
app.post("/api/transactions", authenticateToken, async (req, res) => {
  const { description, amount, category, sub_category, section, transaction_date, budget_month, budget_year } = req.body;
  try {
    await pool.query(
      "INSERT INTO transactions (user_id, description, amount, category, sub_category, section, transaction_date, budget_month, budget_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [req.user.id, description, amount, category, sub_category, section, transaction_date, budget_month, budget_year]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Transaction
app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Budget Plans
app.get("/api/budget-plans", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM budget_plans WHERE user_id = $1 AND budget_year = $2 AND budget_month = $3",
      [req.user.id, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Budget Plan
app.put("/api/budget-plans", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, section, category, sub_category, budget_amount, expected_date } = req.body;
  try {
    await pool.query(
      `INSERT INTO budget_plans (user_id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (user_id, budget_year, budget_month, section, sub_category) 
       DO UPDATE SET budget_amount = EXCLUDED.budget_amount, expected_date = EXCLUDED.expected_date`,
      [req.user.id, budget_year, budget_month, section, category, sub_category, budget_amount, expected_date]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
