// src/components/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import TransactionTable from "./TransactionTable";
import TransactionForm  from "./TransactionForm";
import BudgetPlanEditor from "./BudgetPlanEditor";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS       = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Budget Health Score ───────────────────────────────────────────────────────
function healthScore(s) {
  if (!s) return { score: 0, label: "No data", color: "#6b7280" };
  const income = s.income?.actual || 0;
  if (income === 0) return { score: 0, label: "No income logged", color: "#6b7280" };
  const savingsRate = income > 0 ? (s.savings?.actual || 0) / income : 0;
  const spendRate   = income > 0 ? (s.spent?.actual   || 0) / income : 0;
  const hasBalance  = (s.balance?.actual || 0) >= 0;
  let score = 0;
  if (savingsRate >= 0.2) score += 40;
  else if (savingsRate >= 0.1) score += 20;
  if (spendRate <= 0.6) score += 30;
  else if (spendRate <= 0.8) score += 15;
  if (hasBalance) score += 30;
  if (score >= 80) return { score, label: "Excellent", color: "#4ade80" };
  if (score >= 55) return { score, label: "Good",      color: "#D4AF37" };
  if (score >= 30) return { score, label: "Fair",      color: "#fb923c" };
  return             { score, label: "Needs work",  color: "#f87171" };
}

// ── Greeting ─────────────────────────────────────────────────────────────────
function greeting(name) {
  const h = new Date().getHours();
  const first = name?.split(" ")[0] || "there";
  if (h < 12) return `Good morning, ${first} ☀️`;
  if (h < 17) return `Good afternoon, ${first} 👋`;
  return `Good evening, ${first} 🌙`;
}

export default function Dashboard() {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year,  setYear]        = useState(now.getFullYear());
  const [summary, setSummary]   = useState(null);
  const [transactions, setTx]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showMenu, setMenu]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setTab]     = useState("overview"); // "overview" | "transactions"

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

  // Close user menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setMenu(false);
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  const fmt = (n) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);
  const fmtShort = (n) => {
    const v = n ?? 0;
    return Math.abs(v) >= 1000 ? "₵" + (v / 1000).toFixed(1) + "k" : "₵" + Math.abs(v).toFixed(0);
  };
  const pct = (actual, planned) => planned === 0 ? 0 : Math.min(100, Math.round((actual / planned) * 100));

  const s      = summary || {};
  const health = healthScore(s);
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  // Doughnut chart data
  const doughnutData = {
    labels: ["Bills", "Variable Expenses", "Savings", "Remaining"],
    datasets: [{
      data: [
        s.bills?.actual || 0,
        s.variableExpenses?.actual || 0,
        s.savings?.actual || 0,
        Math.max(0, (s.balance?.actual || 0)),
      ],
      backgroundColor: ["#f87171","#fb923c","#D4AF37","#4ade80"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const barData = {
    labels: ["Income","Bills","Variable","Savings"],
    datasets: [
      { label: "Planned", data: [s.income?.planned, s.bills?.planned, s.variableExpenses?.planned, s.savings?.planned], backgroundColor: "rgba(99,102,241,0.7)", borderRadius: 4 },
      { label: "Actual",  data: [s.income?.actual,  s.bills?.actual,  s.variableExpenses?.actual,  s.savings?.actual],  backgroundColor: "rgba(212,175,55,0.7)",  borderRadius: 4 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { labels: { color: "#9ca3af", font: { size: 11 } } }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.raw) } } },
    scales: {
      x: { ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "#111827" } },
      y: { ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "#111827" } },
    },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: true, cutout: "72%",
    plugins: { legend: { position: "bottom", labels: { color: "#9ca3af", font: { size: 11 }, padding: 12 } }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.raw) } } },
  };

  const cashFlowRows = [
    { label: "Start Balance", planned: s.startBalance,              actual: s.startBalance,             neutral: true },
    { label: "Income",        planned: s.income?.planned,           actual: s.income?.actual,           positive: true },
    { label: "Expenses",      planned: s.totalExpenses?.planned,    actual: s.totalExpenses?.actual,    negative: true },
    { label: "↳ Bills",       planned: s.bills?.planned,            actual: s.bills?.actual,            negative: true, indent: true },
    { label: "↳ Variable",    planned: s.variableExpenses?.planned, actual: s.variableExpenses?.actual, negative: true, indent: true },
    { label: "Savings",       planned: s.savings?.planned,          actual: s.savings?.actual,          savings: true },
    { label: "Balance",       planned: s.balance?.planned,          actual: s.balance?.actual,          balance: true },
    { label: "Spent",         planned: s.spent?.planned,            actual: s.spent?.actual,            negative: true },
  ];

  const kpiCards = [
    { label: "Income",  value: fmt(s.income?.actual),  short: fmtShort(s.income?.actual),  color: "#4ade80", bg: "rgba(74,222,128,0.08)",   icon: "↑" },
    { label: "Spent",   value: fmt(s.spent?.actual),   short: fmtShort(s.spent?.actual),   color: "#f87171", bg: "rgba(248,113,113,0.08)",  icon: "↓" },
    { label: "Savings", value: fmt(s.savings?.actual), short: fmtShort(s.savings?.actual), color: "#D4AF37", bg: "rgba(212,175,55,0.08)",   icon: "★" },
    {
      label: "Balance", value: fmt(s.balance?.actual), short: fmtShort(s.balance?.actual),
      color: (s.balance?.actual ?? 0) >= 0 ? "#4ade80" : "#f87171",
      bg:    (s.balance?.actual ?? 0) >= 0 ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
      icon: "⚖",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#030712" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin mx-auto mb-4" style={{ borderTopColor: "#D4AF37" }} />
          <p className="text-sm" style={{ color: "#6b7280" }}>Loading your budget...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !s.income?.actual && !s.spent?.actual && transactions.length === 0;

  return (
    <div className="min-h-screen text-gray-100" style={{ background: "#030712", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ background: "rgba(3,7,18,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Logo (Clickable to return Home) */}
          <div 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">💰</span>
            <span className="hidden sm:block font-bold" style={{ color: "#D4AF37", fontSize: "1rem" }}>BudgetTracker</span>
          </div>

          {/* Month / Year */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}
            >
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-20 rounded-lg px-3 py-2 text-sm focus:outline-none text-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPlan(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.1)"; e.currentTarget.style.color = "#D4AF37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              📋 <span>Budget Plan</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all"
              style={{ background: "#D4AF37", color: "#030712" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e8c84a"}
              onMouseLeave={e => e.currentTarget.style.background = "#D4AF37"}
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Avatar */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "2px solid rgba(212,175,55,0.3)" }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  : initials}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-11 w-56 rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#6b7280" }}>{user?.email}</p>
                  </div>
                  <button onClick={() => setShowPlan(true)} className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "#9ca3af" }}>
                    📋 Edit Budget Plan
                  </button>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "#f87171" }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── GREETING + HEALTH SCORE ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{greeting(user?.name)}</h2>
            <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
              {SHORT_MONTHS[month]} {year} budget · {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} logged
            </p>
          </div>
          {/* Health score pill */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl self-start" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="text-xs" style={{ color: "#6b7280" }}>Budget Health</p>
              <p className="text-sm font-bold" style={{ color: health.color }}>{health.label}</p>
            </div>
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={health.color} strokeWidth="3"
                  strokeDasharray={`${(health.score / 100) * 94.2} 94.2`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: health.color }}>{health.score}</span>
            </div>
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {isEmpty && (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(212,175,55,0.04)", border: "2px dashed rgba(212,175,55,0.2)" }}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Start your {SHORT_MONTHS[month]} budget</h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Set your planned amounts first, then log transactions as you spend. Your cash flow will update automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowPlan(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#D4AF37", color: "#030712" }}
              >
                📋 Set Budget Plan first
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}
              >
                + Log a transaction
              </button>
            </div>
          </div>
        )}

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map(card => (
            <div key={card.label} className="rounded-xl p-4" style={{ background: card.bg, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wide" style={{ color: "#6b7280" }}>{card.label}</p>
                <span className="text-xs" style={{ color: card.color }}>{card.icon}</span>
              </div>
              <p className="font-bold md:hidden" style={{ color: card.color, fontSize: "1.25rem" }}>{card.short}</p>
              <p className="font-bold hidden md:block" style={{ color: card.color, fontSize: "1.35rem" }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[["overview","📊 Overview"],["transactions","🧾 Transactions"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all"
              style={{
                background: activeTab === id ? "rgba(212,175,55,0.15)" : "transparent",
                color:      activeTab === id ? "#D4AF37" : "#6b7280",
                border:     activeTab === id ? "1px solid rgba(212,175,55,0.25)" : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* ── CASH FLOW TABLE ── */}
            <section className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="font-semibold text-white text-sm">📊 Cash Flow — {SHORT_MONTHS[month]} {year}</h2>
                <span className="text-xs" style={{ color: "#6b7280" }}>Start: <span style={{ color: "#9ca3af" }}>{fmt(s.startBalance)}</span></span>
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase" style={{ color: "#4b5563", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="text-left px-5 py-3">Category</th>
                      <th className="text-right px-5 py-3">Planned</th>
                      <th className="text-right px-5 py-3">Actual</th>
                      <th className="text-right px-5 py-3">Diff</th>
                      <th className="px-5 py-3 w-36">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowRows.map((row, i) => {
                      const diff = (row.actual ?? 0) - (row.planned ?? 0);
                      const p    = pct(row.actual, row.planned);
                      return (
                        <tr key={i} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: row.balance ? "rgba(255,255,255,0.03)" : "transparent" }}>
                          <td className="px-5 py-3" style={{ color: row.indent ? "#6b7280" : "#e5e7eb", fontSize: row.indent ? "0.75rem" : "0.875rem", paddingLeft: row.indent ? "2.5rem" : "" }}>
                            {row.label}
                          </td>
                          <td className="text-right px-5 py-3 text-sm" style={{ color: "#4b5563" }}>{fmt(row.planned)}</td>
                          <td className="text-right px-5 py-3 text-sm font-medium" style={{ color: row.positive ? "#4ade80" : row.negative ? "#f87171" : row.savings ? "#D4AF37" : row.balance ? ((row.actual ?? 0) >= 0 ? "#4ade80" : "#f87171") : "#e5e7eb" }}>
                            {fmt(row.actual)}
                          </td>
                          <td className="text-right px-5 py-3 text-xs" style={{ color: diff > 0 ? "#4ade80" : diff < 0 ? "#f87171" : "#4b5563" }}>
                            {diff >= 0 ? "+" : ""}{fmt(diff)}
                          </td>
                          <td className="px-5 py-3">
                            {!row.neutral && !row.balance && (row.planned ?? 0) > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(p, 100)}%`, background: p >= 100 ? "#f87171" : p >= 75 ? "#fb923c" : "#6366f1" }} />
                                </div>
                                <span className="text-xs w-8 text-right" style={{ color: "#4b5563" }}>{p}%</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {cashFlowRows.map((row, i) => {
                  const diff = (row.actual ?? 0) - (row.planned ?? 0);
                  const p    = pct(row.actual, row.planned);
                  return (
                    <div key={i} className="px-4 py-3" style={{ background: row.balance ? "rgba(255,255,255,0.03)" : "transparent", paddingLeft: row.indent ? "2rem" : "" }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: row.indent ? "#6b7280" : row.balance ? "#fff" : "#e5e7eb", fontWeight: row.balance ? 600 : 400, fontSize: row.indent ? "0.75rem" : "" }}>
                          {row.label}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: row.positive ? "#4ade80" : row.negative ? "#f87171" : row.savings ? "#D4AF37" : row.balance ? ((row.actual ?? 0) >= 0 ? "#4ade80" : "#f87171") : "#e5e7eb" }}>
                          {fmt(row.actual)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-xs" style={{ color: "#4b5563" }}>Budget: {fmt(row.planned)}</span>
                        <span className="text-xs" style={{ color: diff >= 0 ? "#4ade80" : "#f87171" }}>{diff >= 0 ? "+" : ""}{fmt(diff)}</span>
                      </div>
                      {!row.neutral && !row.balance && (row.planned ?? 0) > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-1 rounded-full" style={{ width: `${Math.min(p,100)}%`, background: p >= 100 ? "#f87171" : p >= 75 ? "#fb923c" : "#6366f1" }} />
                          </div>
                          <span className="text-xs w-7" style={{ color: "#4b5563" }}>{p}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── CHARTS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-sm font-semibold text-white mb-4">📈 Planned vs. Actual</h3>
                <Bar data={barData} options={chartOptions} />
              </div>
              <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-sm font-semibold text-white mb-4">🥧 Spending breakdown</h3>
                {(s.spent?.actual || 0) > 0
                  ? <Doughnut data={doughnutData} options={doughnutOptions} />
                  : <div className="flex items-center justify-center h-40 text-sm" style={{ color: "#4b5563" }}>No spending logged yet</div>
                }
              </div>
            </div>

            {/* ── SAVINGS BREAKDOWN ── */}
            {s.savingsBreakdown?.some(b => b.planned > 0 || b.actual > 0) && (
              <section className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h2 className="font-semibold text-white text-sm">⭐ Savings & Investments</h2>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {s.savingsBreakdown.map((item, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm" style={{ color: "#e5e7eb" }}>{item.sub_category}</span>
                      <div className="flex items-center gap-6 text-sm">
                        <span style={{ color: "#4b5563" }}>Budget: {fmt(item.planned)}</span>
                        <span className="font-semibold" style={{ color: "#D4AF37" }}>{fmt(item.actual)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {activeTab === "transactions" && (
          <TransactionTable transactions={transactions} onDelete={fetchData} month={MONTHS[month]} year={year} authFetch={authFetch} />
        )}

        {/* Show recent transactions on overview tab too */}
        {activeTab === "overview" && transactions.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">🧾 Recent Transactions</h2>
              <button onClick={() => setTab("transactions")} className="text-xs transition-colors" style={{ color: "#D4AF37" }}>
                View all →
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{
                    background: tx.section === "income" ? "rgba(74,222,128,0.15)" : tx.section === "savings" ? "rgba(212,175,55,0.15)" : "rgba(248,113,113,0.15)",
                    color:      tx.section === "income" ? "#4ade80" : tx.section === "savings" ? "#D4AF37" : "#f87171",
                  }}>
                    {tx.section === "income" ? "↑" : tx.section === "savings" ? "★" : "↓"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{tx.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{tx.sub_category || tx.category}</p>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0" style={{ color: tx.section === "income" ? "#4ade80" : "#e5e7eb" }}>
                    {tx.section === "income" ? "+" : "-"}{new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {showForm && <TransactionForm month={month} year={year} onClose={() => setShowForm(false)} onSaved={fetchData} authFetch={authFetch} />}
      {showPlan  && <BudgetPlanEditor month={month} year={year} onClose={() => { setShowPlan(false); fetchData(); }} authFetch={authFetch} />}
    </div>
  );
}
