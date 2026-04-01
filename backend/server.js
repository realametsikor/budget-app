// server.js — Budget Tracker API
// Matches April 2026 spreadsheet exactly

import express from "express";
import cors    from "cors";
import pg      from "pg";
import dotenv  from "dotenv";

dotenv.config();

const app  = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }, // Required for Neon
});

const currentMonth = () => new Date().getMonth() + 1;
const currentYear  = () => new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/transactions", async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());
  try {
    const { rows } = await pool.query(
      `SELECT * FROM transactions WHERE budget_year = $1 AND budget_month = $2 ORDER BY transaction_date DESC NULLS LAST, id DESC`,
      [year, month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
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
      `INSERT INTO transactions (description, amount, category, sub_category, section, transaction_date, budget_month, budget_year, expected_amount, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [description, amount, category, sub_category, section,
      transaction_date || null, budget_month, budget_year,
      expected_amount, section === "income" ? "income" : "expense"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/transactions/:id", async (req, res) => {
  const { description, amount, category, sub_category, section, transaction_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE transactions SET description      = COALESCE($1, description), amount           = COALESCE($2, amount), category         = COALESCE($3, category), sub_category     = COALESCE($4, sub_category), section          = COALESCE($5, section), transaction_date = COALESCE($6, transaction_date) WHERE id = $7 RETURNING *`,
      [description, amount, category, sub_category, section, transaction_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET PLANS  (now with expected_date column)
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/budget-plans", async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());
  try {
    const { rows } = await pool.query(
      `SELECT * FROM budget_plans WHERE budget_year = $1 AND budget_month = $2 ORDER BY section, category, sub_category`,
      [year, month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/budget-plans", async (req, res) => {
  const { budget_year, budget_month, section, category, sub_category, budget_amount, expected_date } = req.body;
  try {
    // Ensure expected_date column exists (safe migration)
    await pool.query(
      `ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS expected_date DATE`
    ).catch(() => {});

    const { rows } = await pool.query(
      `INSERT INTO budget_plans
         (budget_year, budget_month, section, category, sub_category, budget_amount, expected_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (budget_year, budget_month, section, sub_category)
       DO UPDATE SET
         budget_amount = EXCLUDED.budget_amount,
         expected_date = EXCLUDED.expected_date
       RETURNING *`,
      [budget_year, budget_month, section, category, sub_category, budget_amount, expected_date || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY SUMMARY  (start balance upsert)
// ─────────────────────────────────────────────────────────────────────────────

app.put("/api/monthly-summary", async (req, res) => {
  const { budget_year, budget_month, start_balance } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO monthly_summaries (budget_year, budget_month, start_balance) VALUES ($1, $2, $3) ON CONFLICT (budget_year, budget_month) DO UPDATE SET start_balance = EXCLUDED.start_balance RETURNING *`,
      [budget_year, budget_month, start_balance]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY  —  replicates the spreadsheet Cash Flow section exactly
//
//  Balance = StartBalance + Income - Bills - Debts - VariableExpenses - Savings
//  Spent   = Bills + Debts + VariableExpenses   (savings NOT included)
//
//  Tithe: if budget_amount <= 1, it is treated as a percentage of income budget.
//  The computed GHS value is included in variableExpenses.
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/summary", async (req, res) => {
  const year  = parseInt(req.query.year  || currentYear());
  const month = parseInt(req.query.month || currentMonth());

  try {
    const [plansRes, actualRes, summaryRes] = await Promise.all([
      pool.query(
        `SELECT section, category, sub_category, budget_amount, expected_date FROM budget_plans WHERE budget_year=$1 AND budget_month=$2`,
        [year, month]
      ),
      pool.query(
        `SELECT section, category, sub_category, SUM(amount) AS actual FROM transactions WHERE budget_year=$1 AND budget_month=$2 GROUP BY section, category, sub_category`,
        [year, month]
      ),
      pool.query(
        `SELECT * FROM monthly_summaries WHERE budget_year=$1 AND budget_month=$2`,
        [year, month]
      ),
    ]);

    const baseline     = summaryRes.rows[0] || {};
    const startBalance = parseFloat(baseline.start_balance) || 0;

    // Build maps keyed by sub_category
    const planned = {};
    const planMeta = {};
    plansRes.rows.forEach(r => {
      planned[r.sub_category]  = parseFloat(r.budget_amount) || 0;
      planMeta[r.sub_category] = r;
    });

    const actuals = {};
    actualRes.rows.forEach(r => {
      actuals[r.sub_category] = parseFloat(r.actual) || 0;
    });

    // ── Resolve Tithe: if stored as decimal <= 1, compute from income budget ──
    const incomePlannedRaw = ["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"]
      .reduce((s, k) => s + (planned[k] || 0), 0);

    if (planned["Tithe"] != null && planned["Tithe"] <= 1 && planned["Tithe"] > 0) {
      planned["Tithe"] = incomePlannedRaw * planned["Tithe"];
    }

    // ── Aggregate helpers ────────────────────────────────────────────────────
    const sumKeys = (keys) => keys.reduce(
      (acc, k) => ({ planned: acc.planned + (planned[k] || 0), actual: acc.actual + (actuals[k] || 0) }),
      { planned: 0, actual: 0 }
    );

    const incomeKeys   = ["Paycheck 1","Paycheck 2","Paycheck 3","Paycheck 4","Other Income"];
    const savingsKeys  = ["Petra Savings Booster","IC Liquidity Fund","Trade Stocks"];
    const billsKeys    = ["Internet","Wi-Fi","Dues","Airtime"];
    const debtsKeys    = (plansRes.rows.filter(r => r.category === "Debts").map(r => r.sub_category));
    const varExpKeys   = ["Dining Out/Take Out","Groceries","Uber","Public transport",
                          "Personal Care","Tithe","Utilities","Home Supplies",
                          "Health/Medical","Travel","Other"];

    const income          = sumKeys(incomeKeys);
    const savings         = sumKeys(savingsKeys);
    const bills           = sumKeys(billsKeys);
    const debts           = sumKeys(debtsKeys.length ? debtsKeys : ["Debt 1"]);
    const variableExpenses = sumKeys(varExpKeys);

    const totalExpenses = {
      planned: bills.planned + debts.planned + variableExpenses.planned,
      actual:  bills.actual  + debts.actual  + variableExpenses.actual,
    };

    // Spreadsheet formula: Balance = StartBalance + Income - Expenses - Savings
    const balance = {
      planned: startBalance + income.planned - totalExpenses.planned - savings.planned,
      actual:  startBalance + income.actual  - totalExpenses.actual  - savings.actual,
    };

    // Spent = Expenses only (savings excluded, matching spreadsheet row 12)
    const spent = {
      planned: totalExpenses.planned,
      actual:  totalExpenses.actual,
    };

    // ── Per-line detail for the Savings breakdown panel ──────────────────────
    const savingsBreakdown = savingsKeys.map(k => ({
      sub_category: k,
      planned: planned[k] || 0,
      actual:  actuals[k]  || 0,
    }));

    // ── All line items for any future drill-down use ─────────────────────────
    const allKeys = [...new Set([...Object.keys(planned), ...Object.keys(actuals)])];
    const lineItems = allKeys.map(k => ({
      sub_category: k,
      section:      planMeta[k]?.section  || "",
      category:     planMeta[k]?.category || "",
      planned:      planned[k] || 0,
      actual:       actuals[k] || 0,
      difference:   (actuals[k] || 0) - (planned[k] || 0),
      expected_date: planMeta[k]?.expected_date || null,
    }));

    res.json({
      year, month, startBalance,
      income, savings, bills, debts, variableExpenses,
      totalExpenses, balance, spent,
      savingsBreakdown, lineItems,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Budget API running on port ${PORT}`));
