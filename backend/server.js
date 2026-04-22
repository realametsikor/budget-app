import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// CORS Setup
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

// Initialize Supabase with Service Role Key for backend admin bypass
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ error: "Invalid or expired token." });
  
  req.user = user;
  next();
};

// ── SUMMARY (DYNAMIC CALCULATION) ─────────────────────────────────
app.get("/api/summary", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const [ { data: sumData }, { data: txData }, { data: planData } ] = await Promise.all([
      supabase.from('monthly_summaries').select('start_balance').eq('user_id', req.user.id).eq('budget_year', year).eq('budget_month', month).single(),
      supabase.from('transactions').select('section, amount, sub_category').eq('user_id', req.user.id).eq('budget_year', year).eq('budget_month', month),
      supabase.from('budget_plans').select('section, budget_amount, sub_category').eq('user_id', req.user.id).eq('budget_year', year).eq('budget_month', month)
    ]);

    const startBalance = sumData ? parseFloat(sumData.start_balance) || 0 : 0;

    const planned = { income: 0, savings: 0, bills: 0, variable: 0, debts: 0, spent: 0 };
    (planData || []).forEach(r => {
      const amt = Math.abs(parseFloat(r.budget_amount) || 0);
      const sec = (r.section || '').toLowerCase();
      if (sec.includes('income')) planned.income += amt;
      else if (sec.includes('saving')) planned.savings += amt;
      else if (sec.includes('bill')) { planned.bills += amt; planned.spent += amt; }
      else if (sec.includes('debt')) { planned.debts += amt; planned.spent += amt; }
      else { planned.variable += amt; planned.spent += amt; }
    });

    const actual = { income: 0, savings: 0, bills: 0, variable: 0, debts: 0, spent: 0 };
    (txData || []).forEach(r => {
      const amt = Math.abs(parseFloat(r.amount) || 0);
      const sec = (r.section || '').toLowerCase();
      if (sec.includes('income')) actual.income += amt;
      else if (sec.includes('saving')) actual.savings += amt;
      else if (sec.includes('bill')) { actual.bills += amt; actual.spent += amt; }
      else if (sec.includes('debt')) { actual.debts += amt; actual.spent += amt; }
      else { actual.variable += amt; actual.spent += amt; }
    });

    const sbMap = {};
    (planData || []).filter(r => (r.section || '').toLowerCase().includes('saving')).forEach(r => {
       sbMap[r.sub_category || 'Other'] = { planned: parseFloat(r.budget_amount) || 0, actual: 0 };
    });
    (txData || []).filter(r => (r.section || '').toLowerCase().includes('saving')).forEach(r => {
       const sub = r.sub_category || 'Other';
       if (!sbMap[sub]) sbMap[sub] = { planned: 0, actual: 0 };
       sbMap[sub].actual += Math.abs(parseFloat(r.amount) || 0);
    });
    const savingsBreakdown = Object.keys(sbMap).map(k => ({ sub_category: k, planned: sbMap[k].planned, actual: sbMap[k].actual }));

    res.json({
      year, month, startBalance,
      income: { planned: planned.income, actual: actual.income },
      savings: { planned: planned.savings, actual: actual.savings },
      bills: { planned: planned.bills, actual: actual.bills },
      debts: { planned: planned.debts, actual: actual.debts },
      variableExpenses: { planned: planned.variable, actual: actual.variable },
      totalExpenses: { planned: planned.spent, actual: actual.spent },
      spent: { planned: planned.spent, actual: actual.spent },
      balance: {
        planned: startBalance + planned.income - planned.spent - planned.savings,
        actual: startBalance + actual.income - actual.spent - actual.savings
      },
      savingsBreakdown
    });

  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── MONTHLY SUMMARIES ─────────────────────────────────────────────
app.put("/api/monthly-summary", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, start_balance } = req.body;
  try {
    const { error } = await supabase.from('monthly_summaries').upsert({
      user_id: req.user.id,
      budget_year,
      budget_month,
      start_balance
    }, { onConflict: 'user_id, budget_year, budget_month' });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TRANSACTIONS ──────────────────────────────────────────────────
app.get("/api/transactions", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('budget_year', year)
      .eq('budget_month', month)
      .order('transaction_date', { ascending: false })
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/transactions", authenticateToken, async (req, res) => {
  const { description, amount, category, sub_category, section, transaction_date, budget_month, budget_year } = req.body;
  try {
    const isIncome = (section || '').toLowerCase().includes('income');
    const dbType = isIncome ? 'income' : 'expense';

    const { error } = await supabase.from('transactions').insert([{
      user_id: req.user.id,
      description,
      amount,
      category,
      sub_category,
      section,
      type: dbType,
      transaction_date,
      budget_month,
      budget_year
    }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BUDGET PLANS ──────────────────────────────────────────────────
app.get("/api/budget-plans", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const { data, error } = await supabase
      .from('budget_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('budget_year', year)
      .eq('budget_month', month);

    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/budget-plans", authenticateToken, async (req, res) => {
  const { budget_year, budget_month, section, category, sub_category, budget_amount, expected_date } = req.body;
  try {
    const { error } = await supabase.from('budget_plans').upsert({
      user_id: req.user.id,
      budget_year,
      budget_month,
      section,
      category,
      sub_category,
      budget_amount,
      expected_date: expected_date || null
    }, { onConflict: 'user_id, budget_year, budget_month, section, sub_category' });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── HEALTH CHECK ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`BudgetTracker API running on port ${PORT}`));

