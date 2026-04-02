// src/components/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import TransactionTable from "./TransactionTable";
import TransactionForm  from "./TransactionForm";
import BudgetPlanEditor from "./BudgetPlanEditor";
import { 
  LayoutDashboard, ReceiptText, Plus, LogOut, Sun, Moon, 
  TrendingUp, TrendingDown, Wallet, Target, Activity, Settings, ArrowUpRight, ArrowDownRight 
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS       = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function healthScore(s) {
  if (!s) return { score: 0, label: "No data", color: "muted" };
  const income = s.income?.actual || 0;
  if (income === 0) return { score: 0, label: "No income logged", color: "muted" };
  const savingsRate = income > 0 ? (s.savings?.actual || 0) / income : 0;
  const spendRate   = income > 0 ? (s.spent?.actual   || 0) / income : 0;
  const hasBalance  = (s.balance?.actual || 0) >= 0;
  
  let score = 0;
  if (savingsRate >= 0.2) score += 40; else if (savingsRate >= 0.1) score += 20;
  if (spendRate <= 0.6) score += 30; else if (spendRate <= 0.8) score += 15;
  if (hasBalance) score += 30;
  
  if (score >= 80) return { score, label: "Excellent", color: "green" };
  if (score >= 55) return { score, label: "Good",      color: "accent" };
  if (score >= 30) return { score, label: "Fair",      color: "warning" };
  return { score, label: "Needs work", color: "red" };
}

export default function Dashboard() {
  const { user, logout, authFetch } = useAuth();
  const now = new Date();

  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year,  setYear]        = useState(now.getFullYear());
  const [summary, setSummary]   = useState(null);
  const [transactions, setTx]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showMenu, setMenu]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setTab]     = useState("overview");

  // Global Theme Sync
  const [theme, setTheme] = useState(localStorage.getItem("budget_theme") || "dark");
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("budget_theme", newTheme);
  };

  const THEMES = {
    dark: {
      bg: "#030712", navBg: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8",
      card: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.08)",
      accent: "#D4AF37", accentBg: "rgba(212,175,55,0.1)",
      green: "#34d399", red: "#f87171", warning: "#fbbf24",
      chartGrid: "rgba(255,255,255,0.05)"
    },
    light: {
      bg: "#f1f5f9", navBg: "#ffffff", text: "#0f172a", textMuted: "#64748b",
      card: "#ffffff", cardBorder: "rgba(0,0,0,0.06)",
      accent: "#0284c7", accentBg: "rgba(2,132,199,0.1)",
      green: "#16a34a", red: "#dc2626", warning: "#d97706",
      chartGrid: "rgba(0,0,0,0.05)"
    }
  };
  const t = THEMES[theme];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        authFetch(`${API}/summary?year=${year}&month=${month}`),
        authFetch(`${API}/transactions?year=${year}&month=${month}`),
      ]);
      const sumData = await sumRes.json();
      const txData  = await txRes.json();
      setSummary(sumData.error ? null : sumData);
      setTx(Array.isArray(txData) ? txData : []);
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setMenu(false);
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  const fmt = (n) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);
  const pct = (actual, planned) => planned === 0 ? 0 : Math.min(100, Math.round((actual / planned) * 100));

  const s = summary || {};
  const healthInfo = healthScore(s);
  const hColor = t[healthInfo.color] || t.textMuted;
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "USR";

  const chartOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { labels: { color: t.textMuted, font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: t.textMuted }, grid: { color: t.chartGrid } },
      y: { ticks: { color: t.textMuted }, grid: { color: t.chartGrid } },
    },
  };

  const doughnutData = {
    labels: ["Bills", "Variable", "Savings", "Balance"],
    datasets: [{
      data: [ s.bills?.actual || 0, s.variableExpenses?.actual || 0, s.savings?.actual || 0, Math.max(0, (s.balance?.actual || 0)) ],
      backgroundColor: [t.red, t.warning, t.accent, t.green], borderWidth: 0, hoverOffset: 4,
    }],
  };

  const barData = {
    labels: ["Income","Bills","Variable","Savings"],
    datasets: [
      { label: "Planned", data: [s.income?.planned, s.bills?.planned, s.variableExpenses?.planned, s.savings?.planned], backgroundColor: theme==="dark"?"rgba(148,163,184,0.3)":"rgba(148,163,184,0.5)", borderRadius: 4 },
      { label: "Actual",  data: [s.income?.actual,  s.bills?.actual,  s.variableExpenses?.actual,  s.savings?.actual],  backgroundColor: t.accent, borderRadius: 4 },
    ],
  };

  const cashFlowRows = [
    { label: "Start Balance", planned: s.startBalance, actual: s.startBalance, neutral: true },
    { label: "Income", planned: s.income?.planned, actual: s.income?.actual, positive: true },
    { label: "Expenses", planned: s.totalExpenses?.planned, actual: s.totalExpenses?.actual, negative: true },
    { label: "↳ Bills", planned: s.bills?.planned, actual: s.bills?.actual, negative: true, indent: true },
    { label: "↳ Variable", planned: s.variableExpenses?.planned, actual: s.variableExpenses?.actual, negative: true, indent: true },
    { label: "Savings", planned: s.savings?.planned, actual: s.savings?.actual, savings: true },
    { label: "Balance", planned: s.balance?.planned, actual: s.balance?.actual, balance: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors" style={{ background: t.bg }}>
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: t.accent }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b shadow-sm transition-colors" style={{ background: t.navBg, borderColor: t.cardBorder }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: t.accent }}>
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <span className="hidden sm:block font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>BudgetTracker</span>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="flex-1 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none appearance-none" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-20 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none text-center" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }} />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-full transition-all hover:opacity-70" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowPlan(true)} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              <Target size={16} /> Plan
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              <Plus size={16} /> <span className="hidden sm:inline">Transaction</span>
            </button>

            <div className="relative ml-2">
              <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-105" style={{ background: t.accentBg, color: t.accent, border: `2px solid ${t.accent}40` }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-50 border" style={{ background: t.navBg, borderColor: t.cardBorder }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: t.cardBorder }}>
                    <p className="text-sm font-bold truncate" style={{ color: t.text }}>{user?.name}</p>
                    <p className="text-xs truncate mt-1" style={{ color: t.textMuted }}>{user?.email}</p>
                  </div>
                  <button onClick={() => setShowPlan(true)} className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:opacity-70" style={{ color: t.text }}><Target size={14}/> Edit Plan</button>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:opacity-70" style={{ color: t.red }}><LogOut size={14}/> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: t.text }}>Overview</h2>
            <p className="text-sm mt-1" style={{ color: t.textMuted }}>{transactions.length} transactions in {SHORT_MONTHS[month]} {year}</p>
          </div>
          
          <div className="flex items-center gap-4 px-5 py-3 rounded-xl shadow-sm border" style={{ background: t.card, borderColor: t.cardBorder }}>
            <Activity size={24} color={hColor} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: t.textMuted }}>Health Score</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold" style={{ color: hColor }}>{healthInfo.score}</span>
                <span className="text-sm font-medium" style={{ color: hColor }}>({healthInfo.label})</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Income", v: s.income?.actual, c: t.green, icon: <ArrowDownRight size={20}/> },
            { label: "Spent", v: s.spent?.actual, c: t.red, icon: <ArrowUpRight size={20}/> },
            { label: "Saved", v: s.savings?.actual, c: t.accent, icon: <Target size={20}/> },
            { label: "Balance", v: s.balance?.actual, c: (s.balance?.actual ?? 0) >= 0 ? t.green : t.red, icon: <Wallet size={20}/> }
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-5 border shadow-sm transition-transform hover:-translate-y-1" style={{ background: t.card, borderColor: t.cardBorder }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.textMuted }}>{card.label}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${card.c}15`, color: card.c }}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold" style={{ color: t.text }}>{fmt(card.v)}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 border-b" style={{ borderColor: t.cardBorder }}>
          {[
            { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={16}/> },
            { id: "transactions", label: "Transactions", icon: <ReceiptText size={16}/> }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setTab(tab.id)}
              className="px-5 py-3 text-sm font-medium flex items-center gap-2 transition-colors relative"
              style={{ color: activeTab === tab.id ? t.accent : t.textMuted }}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: t.accent }} />}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
              <div className="px-6 py-5 border-b" style={{ borderColor: t.cardBorder }}>
                <h3 className="font-bold text-base" style={{ color: t.text }}>Cash Flow Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider" style={{ color: t.textMuted, borderBottom: `1px solid ${t.cardBorder}`, background: t.bg }}>
                      <th className="text-left px-6 py-4 font-medium">Category</th>
                      <th className="text-right px-6 py-4 font-medium">Planned</th>
                      <th className="text-right px-6 py-4 font-medium">Actual</th>
                      <th className="text-right px-6 py-4 font-medium hidden sm:table-cell">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: t.cardBorder }}>
                    {cashFlowRows.map((row, i) => {
                      const diff = (row.actual ?? 0) - (row.planned ?? 0);
                      const isOver = row.negative ? diff > 0 : diff < 0;
                      return (
                        <tr key={i} className="hover:opacity-80 transition-opacity" style={{ background: row.balance ? t.bg : "transparent" }}>
                          <td className="px-6 py-4 font-medium" style={{ paddingLeft: row.indent ? "2.5rem" : "", color: row.indent ? t.textMuted : t.text }}>{row.label}</td>
                          <td className="text-right px-6 py-4" style={{ color: t.textMuted }}>{fmt(row.planned)}</td>
                          <td className="text-right px-6 py-4 font-bold" style={{ color: row.positive ? t.green : row.negative ? t.red : row.savings ? t.accent : t.text }}>{fmt(row.actual)}</td>
                          <td className="text-right px-6 py-4 hidden sm:table-cell font-medium" style={{ color: diff === 0 ? t.textMuted : (isOver && !row.neutral && !row.balance ? t.red : t.green) }}>
                            {diff > 0 ? "+" : ""}{fmt(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Column */}
            <div className="space-y-6">
              <div className="rounded-2xl border p-6 shadow-sm" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-base mb-6" style={{ color: t.text }}>Spending Breakdown</h3>
                <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: "75%" }} />
              </div>
              <div className="rounded-2xl border p-6 shadow-sm" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-base mb-6" style={{ color: t.text }}>Plan vs Actual</h3>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Ensure child tables inherit context nicely if needed */}
        {activeTab === "transactions" && (
           <TransactionTable transactions={transactions} onDelete={fetchData} month={MONTHS[month]} year={year} authFetch={authFetch} />
        )}
      </main>

      {showForm && <TransactionForm month={month} year={year} onClose={() => setShowForm(false)} onSaved={fetchData} authFetch={authFetch} />}
      {showPlan  && <BudgetPlanEditor month={month} year={year} onClose={() => { setShowPlan(false); fetchData(); }} authFetch={authFetch} />}
    </div>
  );
}
