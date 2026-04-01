import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Database ────────────────────────────────────────────────────────────────
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { require: true, rejectUnauthorized: false } // Required for Neon
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const currentMonth = () => new Date().getMonth() + 1;
const currentYear  = () => new Date().getFullYear();

// ── TRANSACTIONS ─────────────────────────────────────────────────────────────

/** GET /api/transactions?year=2026&month=4 */
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
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/transactions */
app.post("/api/transactions", async (req, res) => {
    const {
        description,
        amount,
        category,
        sub_category,
        section = "expense",
        transaction_date,
        budget_month = currentMonth(),
        budget_year  = currentYear(),
        expected_amount = 0,
    } = req.body;

    if (!description || amount == null || !category) {
        return res.status(400).json({ error: "description, amount, and category are required." });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO transactions (description, amount, category, sub_category, section, transaction_date, budget_month, budget_year, expected_amount, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [
                description, amount, category, sub_category, section,
                transaction_date || new Date().toISOString().split('T')[0], budget_month, budget_year,
                expected_amount, section === "income" ? "income" : "expense",
            ]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/** PATCH /api/transactions/:id  –  update actual amount or date */
app.patch("/api/transactions/:id", async (req, res) => {
    const { id } = req.params;
    const { description, amount, category, sub_category, section, transaction_date } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE transactions SET description      = COALESCE($1, description), amount           = COALESCE($2, amount), category         = COALESCE($3, category), sub_category     = COALESCE($4, sub_category), section          = COALESCE($5, section), transaction_date = COALESCE($6, transaction_date) WHERE id = $7 RETURNING *`,
            [description, amount, category, sub_category, section, transaction_date, id]
        );
        if (!rows.length) return res.status(404).json({ error: "Transaction not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** DELETE /api/transactions/:id */
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM transactions WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── BUDGET PLANS ─────────────────────────────────────────────────────────────

/** GET /api/budget-plans?year=2026&month=4 */
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

/** PUT /api/budget-plans  –  upsert a single plan line */
app.put("/api/budget-plans", async (req, res) => {
    const { budget_year, budget_month, section, category, sub_category, budget_amount } = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO budget_plans (budget_year, budget_month, section, category, sub_category, budget_amount) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (budget_year, budget_month, section, sub_category) DO UPDATE SET budget_amount = EXCLUDED.budget_amount RETURNING *`,
            [budget_year, budget_month, section, category, sub_category, budget_amount]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SUMMARY ───────────────────────────────────────────────────────────────────

app.get("/api/summary", async (req, res) => {
    const year  = parseInt(req.query.year  || currentYear());
    const month = parseInt(req.query.month || currentMonth());

    try {
        // ── Planned amounts from budget_plans
        const plansRes = await pool.query(
            `SELECT section, category, sub_category, SUM(budget_amount) AS planned FROM budget_plans WHERE budget_year = $1 AND budget_month = $2 GROUP BY section, category, sub_category`,
            [year, month]
        );

        // ── Actual amounts from transactions
        const actualRes = await pool.query(
            `SELECT section, category, sub_category,
                    SUM(amount) AS actual
             FROM transactions
             WHERE budget_year = $1 AND budget_month = $2
             GROUP BY section, category, sub_category`,
            [year, month]
        );

        // ── Monthly summary baseline (start_balance, headline budgets)
        const summaryRes = await pool.query(
            `SELECT * FROM monthly_summaries
             WHERE budget_year = $1 AND budget_month = $2`,
            [year, month]
        );
        const baseline = summaryRes.rows[0] || {};

        // ── Build lookup maps
        const planned = {};
        plansRes.rows.forEach(r => {
            const key = `${r.section}::${r.category}::${r.sub_category}`;
            planned[key] = parseFloat(r.planned) || 0;
        });

        const actuals = {};
        actualRes.rows.forEach(r => {
            const key = `${r.section}::${r.category}::${r.sub_category}`;
            actuals[key] = parseFloat(r.actual) || 0;
        });

        // ── Aggregate by top-level section
        const sumSection = (section) => {
            let p = 0, a = 0;
            [...new Set([...Object.keys(planned), ...Object.keys(actuals)])]
                .filter(k => k.startsWith(`${section}::`))
                .forEach(k => { p += planned[k] || 0; a += actuals[k] || 0; });
            return { planned: p, actual: a };
        };

        const income  = sumSection("income");
        const savings = sumSection("savings");

        // Bills
        const billKeys = [...new Set([...Object.keys(planned), ...Object.keys(actuals)])]
            .filter(k => k.includes("::Bills::"));
        const bills = billKeys.reduce((acc, k) => ({
            planned: acc.planned + (planned[k] || 0),
            actual:  acc.actual  + (actuals[k]  || 0),
        }), { planned: 0, actual: 0 });

        // Debts
        const debtKeys = [...new Set([...Object.keys(planned), ...Object.keys(actuals)])]
            .filter(k => k.includes("::Debts::"));
        const debts = debtKeys.reduce((acc, k) => ({
            planned: acc.planned + (planned[k] || 0),
            actual:  acc.actual  + (actuals[k]  || 0),
        }), { planned: 0, actual: 0 });

        // Variable expenses
        const varExpKeys = [...new Set([...Object.keys(planned), ...Object.keys(actuals)])]
            .filter(k => k.startsWith("expense::") && !k.includes("::Bills::") && !k.includes("::Debts::"));
        const varExp = varExpKeys.reduce((acc, k) => ({
            planned: acc.planned + (planned[k] || 0),
            actual:  acc.actual  + (actuals[k]  || 0),
        }), { planned: 0, actual: 0 });

        const totalExpenses = {
            planned: bills.planned + debts.planned + varExp.planned,
            actual:  bills.actual  + debts.actual  + varExp.actual,
        };

        const startBalance = parseFloat(baseline.start_balance) || 0;

        const balance = {
            planned: startBalance + income.planned - totalExpenses.planned - savings.planned,
            actual:  startBalance + income.actual  - totalExpenses.actual  - savings.actual,
        };

        const spent = {
            planned: totalExpenses.planned,
            actual:  totalExpenses.actual,
        };

        // ── Per-line detail for the table components
        const allKeys = [...new Set([...Object.keys(planned), ...Object.keys(actuals)])];
        const lineItems = allKeys.map(key => {
            const [section, category, sub_category] = key.split("::");
            return {
                section,
                category,
                sub_category,
                planned:    planned[key] || 0,
                actual:     actuals[key] || 0,
                difference: (actuals[key] || 0) - (planned[key] || 0),
            };
        });

        res.json({
            year,
            month,
            startBalance,
            income,
            savings,
            bills,
            debts,
            variableExpenses: varExp,
            totalExpenses,
            balance,
            spent,
            lineItems,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Budget API running on port ${PORT}`));
