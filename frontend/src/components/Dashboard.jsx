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
import { 
  ArrowLeft, Wallet, FileText, Plus, PieChart, Receipt,
  ArrowUpRight, ArrowDownRight, Star, Scale, Activity, Sun, Moon, LogOut, Target, LayoutDashboard
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS       = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const THEMES = {
  dark: {
    bgClass: "bg-[#050505]", meshClass: "mesh-bg-dark",
    navBg: "rgba(5,5,5,0.7)", text: "#f8fafc", textMuted: "#9ca3af",
    card: "rgba(20,20,20,0.6)", cardBorder: "rgba(255,255,255,0.08)",
    accent: "#D4AF37", accentBg: "rgba(212,175,55,0.1)",
    green: "#34d399", red: "#f87171", warning: "#fbbf24", chartGrid: "rgba(255,255,255,0.05)"
  },
  light: {
    bgClass: "bg-[#f4f4f5]", meshClass: "mesh-bg-light",
    navBg: "rgba(244,244,245,0.7)", text: "#18181b", textMuted: "#71717a",
    card: "rgba(255,255,255,0.7)", cardBorder: "rgba(255,255,255,0.4)",
    accent: "#4f46e5", accentBg: "rgba(79,70,229,0.1)",
    green: "#10b981", red: "#ef4444", warning: "#f59e0b", chartGrid: "rgba(0,0,0,0.05)"
  }
};

function healthScore(s) {
  if (!s) return { score: 0, label: "No data", color: "textMuted" };
  const income = s.income?.actual || 0;
  if (income === 0) return { score: 0, label: "No income", color: "textMuted" };
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

function greeting(name) {
  const h = new Date().getHours();
  const first = name?.split(" ")[0] || "there";
  if (h < 12) return `Good morning, ${first}`;
  if (h < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default function Dashboard() {
  const { user, logout, authFetch, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const currentTheme = theme || "dark";
  const t = THEMES[currentTheme];

  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year,  setYear]        = useState(now.getFullYear());
  const [summary, setSummary]   = useState(null);
  const [transactions, setTx]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showMenu, setMenu]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setTab]     = useState("overview");

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
    } catch (e) { console.error("Fetch error:", e); }
    setLoading(false);
  }, [month, year, authFetch]);

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
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const chartOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { labels: { color: t.textMuted, font: { size: 11, family: "'DM Sans', sans-serif", weight: "bold" } } }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.raw) } } },
    scales: {
      x: { ticks: { color: t.textMuted, font: { family: "'DM Sans', sans-serif" } }, grid: { color: t.chartGrid } },
      y: { ticks: { color: t.textMuted, font: { family: "'DM Sans', sans-serif" } }, grid: { color: t.chartGrid } },
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
      { label: "Planned", data: [s.income?.planned, s.bills?.planned, s.variableExpenses?.planned, s.savings?.planned], backgroundColor: currentTheme==="dark"?"rgba(148,163,184,0.3)":"rgba(148,163,184,0.5)", borderRadius: 6 },
      { label: "Actual",  data: [s.income?.actual,  s.bills?.actual,  s.variableExpenses?.actual,  s.savings?.actual],  backgroundColor: t.accent, borderRadius: 6 },
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
      <div className={`min-h-screen flex items-center justify-center transition-colors ${t.bgClass}`}>
        <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: t.accent }} />
      </div>
    );
  }

  const isEmpty = !s.income?.actual && !s.spent?.actual && transactions.length === 0;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${t.bgClass} ${t.meshClass}`} style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .glass-card { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .mesh-bg-light { background-image: radial-gradient(at 0% 0%, hsla(199,89%,48%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.15) 0px, transparent 50%); }
        .mesh-bg-dark { background-image: radial-gradient(at 0% 0%, hsla(46,65%,52%,0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(253,91%,64%,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,82%,52%,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(43,100%,50%,0.05) 0px, transparent 50%); }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b glass-card transition-colors" style={{ background: t.navBg, borderColor: t.cardBorder }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg transition-colors hover:scale-110" style={{ color: t.textMuted }} onMouseEnter={e=>e.currentTarget.style.color=t.accent} onMouseLeave={e=>e.currentTarget.style.color=t.textMuted}>
              <ArrowLeft size={20} />
            </button>
            <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105" style={{ background: t.accent }}>
                <Wallet size={16} strokeWidth={2.5} />
              </div>
              <span className="hidden sm:block font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: t.text, letterSpacing: "0.5px" }}>BudgetTracker</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none appearance-none transition-colors shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-20 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none text-center transition-colors shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }} />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={toggleTheme} className="hidden sm:flex p-2.5 rounded-full transition-transform hover:scale-110 shadow-sm glass-card" style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}` }}>
              {currentTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowPlan(true)} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-sm glass-card" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text }} onMouseEnter={e => e.currentTarget.style.borderColor = t.accent} onMouseLeave={e => e.currentTarget.style.borderColor = t.cardBorder}>
              <Target size={16} /> Plan
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ background: t.accent, color: currentTheme === "dark" ? "#000" : "#fff" }}>
              <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Transaction</span>
            </button>

            <div className="relative ml-2">
              <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-105 shadow-md" style={{ background: t.accentBg, color: t.accent, border: `2px solid ${t.accent}40` }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-14 w-60 rounded-2xl shadow-2xl overflow-hidden z-50 border glass-card" style={{ background: currentTheme === "dark" ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.85)", borderColor: t.cardBorder }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: t.cardBorder }}>
                    <p className="text-sm font-bold truncate" style={{ color: t.text }}>{user?.name}</p>
                    <p className="text-xs font-semibold truncate mt-1" style={{ color: t.textMuted }}>{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => setShowPlan(true)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors" style={{ color: t.text }} onMouseEnter={e => e.currentTarget.style.background = t.card} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Target size={16} style={{ color: t.textMuted }}/> Edit Budget Plan
                    </button>
                    <button onClick={toggleTheme} className="sm:hidden w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors" style={{ color: t.text }} onMouseEnter={e => e.currentTarget.style.background = t.card} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {currentTheme === "dark" ? <Sun size={16} style={{ color: t.textMuted }} /> : <Moon size={16} style={{ color: t.textMuted }} />} Switch Theme
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors mt-1" style={{ color: t.red }} onMouseEnter={e => e.currentTarget.style.background = `${t.red}15`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
              {greeting(user?.name)}.
            </h2>
            <p className="text-sm mt-2 font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Viewing {SHORT_MONTHS[month]} {year} overview
            </p>
          </div>
          
          <div className="flex items-center gap-5 px-6 py-4 rounded-2xl shadow-sm border transition-colors glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${hColor}15`, color: hColor }}>
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: t.textMuted }}>Health Score</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold leading-none" style={{ color: hColor }}>{healthInfo.score}</span>
                <span className="text-sm font-bold leading-none" style={{ color: hColor }}>({healthInfo.label})</span>
              </div>
            </div>
          </div>
        </div>

        {isEmpty && (
          <div className="rounded-[2rem] p-12 text-center border-2 border-dashed glass-card shadow-lg" style={{ background: t.accentBg, borderColor: `${t.accent}40` }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md" style={{ background: t.card, color: t.accent, border: `1px solid ${t.cardBorder}` }}>
              <PieChart size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-bold mb-4" style={{ color: t.text }}>Begin your {SHORT_MONTHS[month]} budget</h3>
            <p className="text-lg mb-8 max-w-lg mx-auto font-medium leading-relaxed" style={{ color: t.textMuted }}>
              Set your planned income and limits first. Your dashboard will dynamically build itself as you log transactions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => setShowPlan(true)} className="w-full sm:w-auto px-10 py-4 rounded-full text-base font-bold shadow-xl transition-transform hover:scale-105" style={{ background: t.accent, color: currentTheme === "dark" ? "#000" : "#fff" }}>
                Set Budget Plan
              </button>
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Income", v: s.income?.actual, c: t.green, icon: <ArrowDownRight size={20} strokeWidth={3}/> },
              { label: "Spent", v: s.spent?.actual, c: t.red, icon: <ArrowUpRight size={20} strokeWidth={3}/> },
              { label: "Saved", v: s.savings?.actual, c: t.accent, icon: <Target size={20} strokeWidth={3}/> },
              { label: "Balance", v: s.balance?.actual, c: (s.balance?.actual ?? 0) >= 0 ? t.green : t.red, icon: <Wallet size={20} strokeWidth={3}/> }
            ].map((card, i) => (
              <div key={i} className="rounded-3xl p-6 md:p-8 border shadow-lg transition-transform hover:-translate-y-2 relative overflow-hidden glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" style={{ background: card.c }} />
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>{card.label}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: `${card.c}20`, color: card.c }}>{card.icon}</div>
                </div>
                <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: t.text }}>{fmt(card.v)}</p>
              </div>
            ))}
          </div>
        )}

        {!isEmpty && (
          <div className="flex gap-2 border-b" style={{ borderColor: t.cardBorder }}>
            {[
              { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18}/> },
              { id: "transactions", label: "Transactions", icon: <Receipt size={18}/> }
            ].map((tab) => (
              <button
                key={tab.id} onClick={() => setTab(tab.id)}
                className="px-6 py-4 text-sm font-bold flex items-center gap-3 transition-colors relative uppercase tracking-wider"
                style={{ color: activeTab === tab.id ? t.text : t.textMuted }}
              >
                <span style={{ color: activeTab === tab.id ? t.accent : t.textMuted }}>{tab.icon}</span> {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ background: t.accent }} />}
              </button>
            ))}
          </div>
        )}

        {activeTab === "overview" && !isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-[2rem] border shadow-lg overflow-hidden glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
              <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: t.cardBorder, background: currentTheme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                <h3 className="font-bold text-lg flex items-center gap-3" style={{ color: t.text }}><PieChart size={20} color={t.accent} /> Cash Flow Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest" style={{ color: t.textMuted, borderBottom: `1px solid ${t.cardBorder}` }}>
                      <th className="text-left px-8 py-5 font-bold">Category</th>
                      <th className="text-right px-8 py-5 font-bold">Planned</th>
                      <th className="text-right px-8 py-5 font-bold">Actual</th>
                      <th className="text-right px-8 py-5 font-bold hidden sm:table-cell">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: t.cardBorder }}>
                    {cashFlowRows.map((row, i) => {
                      const diff = (row.actual ?? 0) - (row.planned ?? 0);
                      const isOver = row.negative ? diff > 0 : diff < 0;
                      return (
                        <tr key={i} className="hover:opacity-80 transition-opacity" style={{ background: row.balance ? (currentTheme==="dark"?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)") : "transparent" }}>
                          <td className="px-8 py-5 font-bold flex items-center gap-3" style={{ paddingLeft: row.indent ? "3.5rem" : "2rem", color: row.indent ? t.textMuted : t.text }}>
                            {row.indent && <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }}/>} {row.label}
                          </td>
                          <td className="text-right px-8 py-5 font-bold" style={{ color: t.textMuted }}>{fmt(row.planned)}</td>
                          <td className="text-right px-8 py-5 font-bold text-base" style={{ color: row.positive ? t.green : row.negative ? t.red : row.savings ? t.accent : t.text }}>{fmt(row.actual)}</td>
                          <td className="text-right px-8 py-5 hidden sm:table-cell font-bold" style={{ color: diff === 0 ? t.textMuted : (isOver && !row.neutral && !row.balance ? t.red : t.green) }}>
                            {diff > 0 ? "+" : ""}{fmt(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border p-8 shadow-lg glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-lg mb-8" style={{ color: t.text }}>Spending Breakdown</h3>
                <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: "75%" }} />
              </div>
              <div className="rounded-[2rem] border p-8 shadow-lg glass-card" style={{ background: t.card, borderColor: t.cardBorder }}>
                <h3 className="font-bold text-lg mb-8" style={{ color: t.text }}>Plan vs Actual</h3>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
           <TransactionTable transactions={transactions} onDelete={fetchData} month={MONTHS[month]} year={year} authFetch={authFetch} />
        )}
      </main>

      {showForm && <TransactionForm month={month} year={year} onClose={() => setShowForm(false)} onSaved={fetchData} authFetch={authFetch} />}
      {showPlan  && <BudgetPlanEditor month={month} year={year} onClose={() => { setShowPlan(false); fetchData(); }} authFetch={authFetch} />}
    </div>
  );
}
