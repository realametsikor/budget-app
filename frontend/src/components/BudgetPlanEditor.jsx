import { useEffect, useState } from "react";

// Hardcoded your live Render backend
const API = "https://budget-app-backend-gn8r.onrender.com/api";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SECTIONS = [
  {
    key: "income", label: "Income", icon: "↑",
    color: "text-green-400", border: "border-green-800",
    items: ["Paycheck 1", "Paycheck 2", "Paycheck 3", "Paycheck 4", "Other Income"],
    category: "Income",
  },
  {
    key: "savings", label: "Savings & Investments", icon: "★",
    color: "text-yellow-400", border: "border-yellow-800",
    items: ["Petra Savings Booster", "IC Liquidity Fund", "Trade Stocks"],
    category: "Savings & Investments",
  },
  {
    key: "expense", label: "Variable Expenses", icon: "↓",
    color: "text-red-400", border: "border-red-800",
    items: ["Dining Out/Take Out", "Groceries", "Uber", "Public Transport", "Personal Care", "Tithe", "Utilities", "Home Supplies", "Health/Medical", "Travel", "Other"],
    category: "Expenses",
  },
  {
    key: "expense", label: "Bills", icon: "📋",
    color: "text-orange-400", border: "border-orange-800",
    items: ["Internet", "Wi-Fi", "Dues", "Airtime"],
    category: "Bills",
  },
  {
    key: "expense", label: "Debts", icon: "💳",
    color: "text-pink-400", border: "border-pink-800",
    items: ["Debt 1"],
    category: "Debts",
  },
];

export default function BudgetPlanEditor({ month, year, onClose }) {
  const [plans, setPlans] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved]   = useState({});

  useEffect(() => {
    fetch(`${API}/budget-plans?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.sub_category] = r.budget_amount; });
        setPlans(map);
      });
  }, [month, year]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);

  const handleBlur = async (section, category, sub_category) => {
    const amount = parseFloat(plans[sub_category] || 0);
    setSaving(s => ({ ...s, [sub_category]: true }));
    await fetch(`${API}/budget-plans`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget_year: year, budget_month: month,
        section, category, sub_category, budget_amount: amount,
      }),
    });
    setSaving(s => ({ ...s, [sub_category]: false }));
    setSaved(s => ({ ...s, [sub_category]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [sub_category]: false })), 1500);
  };

  const sectionTotal = (items) =>
    items.reduce((sum, item) => sum + parseFloat(plans[item] || 0), 0);

  return (
    /* Backdrop - Claude's Fix 2 Applied Here */
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container - Claude's Fix 2 Applied Here */}
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl my-8"
        onClick={e => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Edit Budget Plan</h2>
            <p className="text-xs text-gray-500 mt-0.5">{MONTHS[month]} {year} · Set planned amounts</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {SECTIONS.map(sec => (
            <div key={sec.label}>
              <div className={`flex items-center justify-between mb-2 border-b pb-2 ${sec.border}`}>
                <h3 className={`text-sm font-semibold ${sec.color}`}>
                  {sec.icon} {sec.label}
                </h3>
                <span className="text-xs text-gray-500">Total: {fmt(sectionTotal(sec.items))}</span>
              </div>
              <div className="space-y-2">
                {sec.items.map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-300 truncate">{item}</label>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₵</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={plans[item] ?? ""}
                        placeholder="0"
                        onChange={e => setPlans(p => ({ ...p, [item]: e.target.value }))}
                        onBlur={() => handleBlur(sec.key, sec.category, item)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-2 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                      />
                    </div>
                    <span className="w-5 text-center">
                      {saving[item] && <span className="text-gray-500 text-xs">...</span>}
                      {saved[item]  && <span className="text-green-400 text-xs">✓</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
