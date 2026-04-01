// src/components/Dashboard.jsx — auth-aware version
// Uses authFetch from AuthContext (auto-refreshes JWT, handles 401)

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useAuth } from "../context/AuthContext";
import TransactionTable from "./TransactionTable";
import TransactionForm  from "./TransactionForm";
import BudgetPlanEditor from "./BudgetPlanEditor";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS       = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Dashboard() {
  const { user, logout, authFetch } = useAuth();
  const now = new Date();

  const [month, setMonth]         = useState(now.getMonth() + 1);
  const [year,  setYear]          = useState(now.getFullYear());
  const [summary, setSummary]     = useState(null);
  const [transactions, setTx]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [showPlan, setShowPlan]   = useState(false);
  const [showUserMenu, setMenu]   = useState(false);
  const [loading, setLoading]     = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        authFetch(`${API}/summary?year=${year}&month=${month}`),
        authFetch(`${API}/transactions?year=${year}&month=${month}`),
      ]);
      const sumData = await sumRes.json();
      const txData  = await txRes.json();
      if (sumData.error) console.error("Summary error:", sumData.error);
      if (txData.error)  console.error("Tx error:",      txData.error);
      setSummary(sumData.error ? null : sumData);
      setTx(Array.isArray(txData) ? txData : []);
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const fmt = (n) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);
  const fmtShort = (n) => {
    const v = n ?? 0;
    return Math.abs(v) >= 1000 ? "₵" + (v / 1000).toFixed(1) + "k" : "₵" + v.toFixed(2);
  };
  const pct = (actual, planned) => planned === 0 ? 0 : Math.min(100, Math.round((actual / planned) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-indigo-400 animate-pulse text-lg font-medium">Loading budget...</div>
      </div>
    );
  }

  const s = summary || {};

  const cashFlowRows = [
    { label: "Start Balance", planned: s.startBalance,              actual: s.startBalance,             neutral: true },
    { label: "Income",        planned: s.income?.planned,           actual: s.income?.actual,           positive: true },
    { label: "Expenses",      planned: s.totalExpenses?.planned,    actual: s.totalExpenses?.actual,    negative: true },
    { label: "↳ Bills",       planned: s.bills?.planned,            actual: s.bills?.actual,            negative: true, indent: true },
    { label: "↳ Debts",       planned: s.debts?.planned,            actual: s.debts?.actual,            negative: true, indent: true },
    { label: "↳ Variable",    planned: s.variableExpenses?.planned, actual: s.variableExpenses?.actual, negative: true, indent: true },
    { label: "Savings",       planned: s.savings?.planned,          actual: s.savings?.actual,          savings: true },
    { label: "Balance",       planned: s.balance?.planned,          actual: s.balance?.actual,          balance: true },
    { label: "Spent",         planned: s.spent?.planned,            actual: s.spent?.actual,            negative: true },
  ];

  const chartData = {
    labels: ["Income", "Bills", "Debts", "Var. Exp.", "Savings"],
    datasets: [
      { label: "Planned", data: [s.income?.planned, s.bills?.planned, s.debts?.planned, s.variableExpenses?.planned, s.savings?.planned], backgroundColor: "rgba(99,102,241,0.75)", borderRadius: 5 },
      { label: "Actual",  data: [s.income?.actual,  s.bills?.actual,  s.debts?.actual,  s.variableExpenses?.actual,  s.savings?.actual],  backgroundColor: "rgba(34,197,94,0.75)",  borderRadius: 5 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: "#d1d5db", font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => " ₵" + (ctx.raw ?? 0).toLocaleString() } },
    },
    scales: {
      x: { ticks: { color: "#9ca3af", font: { size: 10 } }, grid: { color: "#1f2937" } },
      y: { ticks: { color: "#9ca3af", font: { size: 10 } }, grid: { color: "#1f2937" } },
    },
  };

  const kpiCards = [
    { label: "Income",  value: fmt(s.income?.actual),  short: fmtShort(s.income?.actual),  color: "text-green-400",  bg: "from-green-900/20"  },
    { label: "Spent",   value: fmt(s.spent?.actual),   short: fmtShort(s.spent?.actual),   color: "text-red-400",    bg: "from-red-900/20"    },
    { label: "Savings", value: fmt(s.savings?.actual), short: fmtShort(s.savings?.actual), color: "text-yellow-400", bg: "from-yellow-900/20" },
    { label: "Balance", value: fmt(s.balance?.actual), short: fmtShort(s.balance?.actual),
      color: (s.balance?.actual ?? 0) >= 0 ? "text-green-400" : "text-red-400",
      bg:    (s.balance?.actual ?? 0) >= 0 ? "from-green-900/20" : "from-red-900/20" },
  ];

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">💰</span>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-indigo-400 tracking-tight leading-tight">Budget Tracker</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Expected vs. Actual · Monthly View</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <button onClick={() => setShowPlan(true)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition border border-gray-600">
              <span className="hidden sm:inline">📋 Edit Plan</span>
              <span className="sm:hidden">📋</span>
            </button>
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition">
              <span className="hidden sm:inline">+ Add Transaction</span>
              <span className="sm:hidden">+ Add</span>
            </button>

            <div className="relative">
              <button onClick={() => setMenu(m => !m)} className="flex items-center gap-2 pl-1">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-700">
                    {initials}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-11 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenu(false); logout(); }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
            className="w-20 md:w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-5 md:py-8 space-y-5 md:space-y-8">
        <section className="grid grid-cols-2 gap-3">
          {kpiCards.map(card => (
            <div key={card.label} className={`bg-gradient-to-br ${card.bg} to-gray-900 rounded-xl border border-gray-800 p-4`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{card.label}</p>
              <p className={`text-xl md:text-2xl font-bold mt-1 ${card.color} md:hidden`}>{card.short}</p>
              <p className={`text-xl md:text-2xl font-bold mt-1 ${card.color} hidden md:block`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-200 text-sm md:text-base">📊 Cash Flow — {SHORT_MONTHS[month]} {year}</h2>
            <span className="text-xs text-gray-500">Start: <span className="text-gray-300">{fmt(s.startBalance)}</span></span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-800">
                  <th className="text-left px-6 py-3">Category</th>
                  <th className="text-right px-6 py-3">Planned</th>
                  <th className="text-right px-6 py-3">Actual</th>
                  <th className="text-right px-6 py-3">Difference</th>
                  <th className="px-6 py-3 w-40">Progress</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowRows.map((row, i) => {
                  const diff = (row.actual ?? 0) - (row.planned ?? 0);
                  const progress = pct(row.actual, row.planned);
                  return (
                    <tr key={i} className={`border-b border-gray-800 last:border-0 ${row.balance ? "bg-gray-800/60 font-semibold" : "hover:bg-gray-800/30"}`}>
                      <td className={`px-6 py-3 ${row.indent ? "pl-8 text-gray-400 text-xs" : "text-gray-200"}`}>{row.label}</td>
                      <td className="text-right px-6 py-3 text-gray-400">{fmt(row.planned)}</td>
                      <td className={`text-right px-6 py-3 font-medium ${row.positive ? "text-green-400" : row.negative ? "text-red-300" : row.savings ? "text-yellow-400" : row.balance ? ((row.actual ?? 0) >= 0 ? "text-green-400" : "text-red-400") : "text-gray-200"}`}>
                        {fmt(row.actual)}
                      </td>
                      <td className={`text-right px-6 py-3 text-xs ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-500"}`}>
                        {diff >= 0 ? "+" : ""}{fmt(diff)}
                      </td>
                      <td className="px-6 py-3">
                        {!row.neutral && !row.balance && (row.planned ?? 0) > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${progress >= 100 ? "bg-red-500" : progress >= 75 ? "bg-yellow-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{progress}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-800">
            {cashFlowRows.map((row, i) => {
              const diff = (row.actual ?? 0) - (row.planned ?? 0);
              const progress = pct(row.actual, row.planned);
              return (
                <div key={i} className={`px-4 py-3 ${row.balance ? "bg-gray-800/60" : ""} ${row.indent ? "pl-7 bg-gray-950/50" : ""}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm ${row.indent ? "text-gray-400 text-xs" : row.balance ? "text-gray-100 font-semibold" : "text-gray-200 font-medium"}`}>{row.label}</span>
                    <span className={`text-sm font-semibold ${row.positive ? "text-green-400" : row.negative ? "text-red-300" : row.savings ? "text-yellow-400" : row.balance ? ((row.actual ?? 0) >= 0 ? "text-green-400" : "text-red-400") : "text-gray-200"}`}>
                      {fmt(row.actual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Budget: {fmt(row.planned)}</span>
                    <span className={`text-xs ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-600"}`}>{diff >= 0 ? "+" : ""}{fmt(diff)}</span>
                  </div>
                  {!row.neutral && !row.balance && (row.planned ?? 0) > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-gray-700 rounded-full h-1">
                        <div className={`h-1 rounded-full ${progress >= 100 ? "bg-red-500" : progress >= 75 ? "bg-yellow-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 w-7 text-right">{progress}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {s.savingsBreakdown?.length > 0 && (
          <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-gray-200 text-sm md:text-base">⭐ Savings & Investments</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {s.savingsBreakdown.map((item, i) => (
                <div key={i} className="px-4 md:px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-300">{item.sub_category}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Budget: {fmt(item.planned)}</span>
                    <span className="text-yellow-400 font-medium">{fmt(item.actual)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
          <h2 className="font-semibold text-gray-200 text-sm md:text-base mb-4">📈 Planned vs. Actual</h2>
          <Bar data={chartData} options={chartOptions} />
        </section>

        <TransactionTable transactions={transactions} onDelete={fetchData} month={MONTHS[month]} year={year} authFetch={authFetch} />
      </main>

      {showForm && <TransactionForm month={month} year={year} onClose={() => setShowForm(false)} onSaved={fetchData} authFetch={authFetch} />}
      {showPlan  && <BudgetPlanEditor month={month} year={year} onClose={() => { setShowPlan(false); fetchData(); }} authFetch={authFetch} />}
    </div>
  );
}
