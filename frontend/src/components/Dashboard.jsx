import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from "chart.js";
import TransactionTable from "./TransactionTable";
import TransactionForm  from "./TransactionForm";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Fixed: Hardcoded your live Render backend so Vercel never breaks!
const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [summary, setSummary]   = useState(null);
  const [transactions, setTx]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [sumRes, txRes] = await Promise.all([
      fetch(`${API}/summary?year=${year}&month=${month}`),
      fetch(`${API}/transactions?year=${year}&month=${month}`),
    ]);
    setSummary(await sumRes.json());
    setTx(await txRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);

  const pct = (actual, planned) =>
    planned === 0 ? 0 : Math.min(100, Math.round((actual / planned) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-indigo-400 animate-pulse text-lg font-medium">Loading budget…</div>
      </div>
    );
  }

  const s = summary || {};
  const cashFlowRows = [
    { label: "Start Balance", planned: s.startBalance,              actual: s.startBalance,             neutral: true },
    { label: "Income",        planned: s.income?.planned,           actual: s.income?.actual,           positive: true },
    { label: "Expenses",      planned: s.totalExpenses?.planned,    actual: s.totalExpenses?.actual,    negative: true },
    { label: "Bills",         planned: s.bills?.planned,            actual: s.bills?.actual,            negative: true, indent: true },
    { label: "Debts",         planned: s.debts?.planned,            actual: s.debts?.actual,            negative: true, indent: true },
    { label: "Variable",      planned: s.variableExpenses?.planned, actual: s.variableExpenses?.actual, negative: true, indent: true },
    { label: "Savings",       planned: s.savings?.planned,          actual: s.savings?.actual,          neutral: true },
    { label: "Balance",       planned: s.balance?.planned,          actual: s.balance?.actual,          balance: true },
    { label: "Total Spent",   planned: s.spent?.planned,            actual: s.spent?.actual,            negative: true },
  ];

  const chartData = {
    labels: ["Income", "Bills", "Debts", "Variable Exp.", "Savings"],
    datasets: [
      {
        label: "Planned",
        data: [
          s.income?.planned, s.bills?.planned, s.debts?.planned,
          s.variableExpenses?.planned, s.savings?.planned,
        ],
        backgroundColor: "rgba(99,102,241,0.7)",
        borderRadius: 6,
      },
      {
        label: "Actual",
        data: [
          s.income?.actual, s.bills?.actual, s.debts?.actual,
          s.variableExpenses?.actual, s.savings?.actual,
        ],
        backgroundColor: "rgba(34,197,94,0.7)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "#d1d5db" } } },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#1f2937" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "#1f2937" } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* ── Header ── */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-tight">💰 Budget Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Expected vs. Actual · Monthly View</p>
        </div>

        {/* Month / Year picker */}
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Transaction
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ── KPI Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Income (Actual)",   value: fmt(s.income?.actual),         color: "text-green-400" },
            { label: "Total Spent",       value: fmt(s.spent?.actual),           color: "text-red-400" },
            { label: "Savings (Planned)", value: fmt(s.savings?.planned),        color: "text-yellow-400" },
            { label: "Balance",           value: fmt(s.balance?.actual),         color: (s.balance?.actual ?? 0) >= 0 ? "text-green-400" : "text-red-400" },
          ].map(card => (
            <div key={card.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </section>

        {/* ── Cash Flow Summary Table ── */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-gray-200 text-base">
              📊 Cash Flow Summary — {MONTHS[month]} {year}
            </h2>
          </div>
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
                const isBalance = row.balance;
                const isIndent  = row.indent;
                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-800 last:border-0 ${
                      isBalance ? "bg-gray-800/60 font-semibold" : "hover:bg-gray-800/30"
                    }`}
                  >
                    <td className={`px-6 py-3 ${isIndent ? "pl-10 text-gray-400 text-xs" : "text-gray-200"}`}>
                      {row.label}
                    </td>
                    <td className="text-right px-6 py-3 text-gray-400">{fmt(row.planned)}</td>
                    <td className={`text-right px-6 py-3 font-medium ${
                      row.positive ? "text-green-400"
                      : row.negative ? "text-red-300"
                      : isBalance
                        ? ((row.actual ?? 0) >= 0 ? "text-green-400" : "text-red-400")
                      : "text-gray-200"
                    }`}>
                      {fmt(row.actual)}
                    </td>
                    <td className={`text-right px-6 py-3 text-xs ${
                      diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-500"
                    }`}>
                      {diff >= 0 ? "+" : ""}{fmt(diff)}
                    </td>
                    <td className="px-6 py-3">
                      {!row.neutral && !row.balance && row.planned > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                progress >= 100 ? "bg-red-500"
                                : progress >= 75  ? "bg-yellow-500"
                                : "bg-indigo-500"
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
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
        </section>

        {/* ── Chart ── */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-gray-200 text-base mb-6">📈 Planned vs. Actual</h2>
          <Bar data={chartData} options={chartOptions} height={90} />
        </section>

        {/* ── Transactions Table ── */}
        <TransactionTable
          transactions={transactions}
          onDelete={fetchData}
          month={MONTHS[month]}
          year={year}
        />
      </main>

      {/* ── Add Transaction Modal ── */}
      {showForm && (
        <TransactionForm
          month={month}
          year={year}
          onClose={() => setShowForm(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
