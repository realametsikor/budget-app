// src/components/BudgetPlanEditor.jsx
import { useEffect, useState } from "react";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const SHORT_MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SECTIONS = [
  {
    key: "income", label: "Income", icon: "↑",
    color: "text-green-400", border: "border-green-800",
    category: "Income",
    items: ["Paycheck 1", "Paycheck 2", "Paycheck 3", "Paycheck 4", "Other Income"],
    hasDate: true,
  },
  {
    key: "savings", label: "Savings & Investments", icon: "★",
    color: "text-yellow-400", border: "border-yellow-800",
    category: "Savings & Investments",
    items: ["Petra Savings Booster", "IC Liquidity Fund", "Trade Stocks"],
    hasDate: false,
  },
  {
    key: "expense", label: "Variable Expenses", icon: "↓",
    color: "text-red-400", border: "border-red-800",
    category: "Expenses",
    items: ["Dining Out/Take Out", "Groceries", "Uber", "Public transport", "Personal Care", "Tithe", "Utilities", "Home Supplies", "Health/Medical", "Travel", "Other"],
    hasDate: true,
  },
  {
    key: "expense", label: "Bills", icon: "📋",
    color: "text-orange-400", border: "border-orange-800",
    category: "Bills",
    items: ["Internet", "Wi-Fi", "Dues", "Airtime"],
    hasDate: true,
  },
  {
    key: "expense", label: "Debts", icon: "💳",
    color: "text-pink-400", border: "border-pink-800",
    category: "Debts",
    items: ["Debt 1"],
    hasDate: true,
  },
];

export default function BudgetPlanEditor({ month, year, onClose, authFetch }) {
  const [plans,       setPlans]     = useState({});
  const [dates,       setDates]     = useState({});
  const [startBal,    setStartBal]  = useState("");
  const [titheMode,   setTitheMode] = useState("pct"); // "pct" | "fixed"
  const [tithePct,    setTithePct]  = useState(10);
  const [saving,      setSaving]    = useState({});
  const [saved,       setSaved]     = useState({});
  const [savingBal,   setSavingBal] = useState(false);
  const [savedBal,    setSavedBal]  = useState(false);

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/budget-plans?year=${year}&month=${month}`).then(r => r.json()),
      authFetch(`${API}/summary?year=${year}&month=${month}`).then(r => r.json()),
    ]).then(([rows, sum]) => {
      const amtMap  = {};
      const dateMap = {};
      rows.forEach(r => {
        amtMap[r.sub_category] = r.budget_amount;
        if (r.expected_date) dateMap[r.sub_category] = r.expected_date.split("T")[0];
      });
      setPlans(amtMap);
      setDates(dateMap);
      if (sum.startBalance != null) setStartBal(sum.startBalance);

      if (amtMap["Tithe"] != null && amtMap["Tithe"] > 0 && amtMap["Tithe"] <= 1) {
        setTitheMode("pct");
        setTithePct(Math.round(amtMap["Tithe"] * 100));
      } else if (amtMap["Tithe"] > 1) {
        setTitheMode("fixed");
      }
    });
  }, [month, year, authFetch]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);

  const sectionTotal = (sec) =>
    sec.items.reduce((sum, item) => {
      if (item === "Tithe" && titheMode === "pct") {
        const incomePlanned = SECTIONS.find(s => s.key === "income")
          ?.items.reduce((s, k) => s + parseFloat(plans[k] || 0), 0) || 0;
        return sum + (incomePlanned * tithePct / 100);
      }
      return sum + parseFloat(plans[item] || 0);
    }, 0);

  const saveLine = async (sectionKey, category, sub_category) => {
    let amount = parseFloat(plans[sub_category] || 0);
    if (sub_category === "Tithe" && titheMode === "pct") {
      amount = tithePct / 100;
    }
    setSaving(s => ({ ...s, [sub_category]: true }));
    await authFetch(`${API}/budget-plans`, {
      method: "PUT",
      body: JSON.stringify({
        budget_year:   year,
        budget_month:  month,
        section:       sectionKey,
        category,
        sub_category,
        budget_amount: amount,
        expected_date: dates[sub_category] || null,
      }),
    });
    setSaving(s => ({ ...s, [sub_category]: false }));
    setSaved(s  => ({ ...s, [sub_category]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [sub_category]: false })), 1500);
  };

  const saveStartBalance = async () => {
    setSavingBal(true);
    await authFetch(`${API}/monthly-summary`, {
      method: "PUT",
      body: JSON.stringify({
        budget_year:   year,
        budget_month:  month,
        start_balance: parseFloat(startBal || 0),
      }),
    });
    setSavingBal(false);
    setSavedBal(true);
    setTimeout(() => setSavedBal(false), 1500);
  };

  const liveIncomePlanned = SECTIONS.find(s => s.key === "income")
    ?.items.reduce((s, k) => s + parseFloat(plans[k] || 0), 0) || 0;
  const liveTitheValue = titheMode === "pct"
    ? liveIncomePlanned * tithePct / 100
    : parseFloat(plans["Tithe"] || 0);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">📋 Budget Plan</h2>
            <p className="text-xs text-gray-500 mt-0.5">{SHORT_MONTHS[month]} {year} · Set planned amounts & dates</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* ── Start Balance ── */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-200">🏦 Start Balance</label>
              <span className="text-xs text-gray-500">Opening balance for {SHORT_MONTHS[month]}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₵</span>
                <input
                  type="number"
                  step="0.01"
                  value={startBal}
                  onChange={e => setStartBal(e.target.value)}
                  onBlur={saveStartBalance}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-7 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="w-6 text-center text-xs">
                {savingBal && <span className="text-gray-500">...</span>}
                {savedBal  && <span className="text-green-400">✓</span>}
              </span>
            </div>
          </div>

          {SECTIONS.map(sec => (
            <div key={sec.label}>
              <div className={`flex items-center justify-between mb-3 border-b pb-2 ${sec.border}`}>
                <h3 className={`text-sm font-semibold ${sec.color}`}>{sec.icon} {sec.label}</h3>
                <span className="text-xs text-gray-500">Total: {fmt(sectionTotal(sec))}</span>
              </div>

              <div className="space-y-3">
                {sec.items.map(item => {
                  const isTithe = item === "Tithe";
                  return (
                    <div key={item}>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="flex-1 text-sm text-gray-300 truncate">{item}</label>

                        {isTithe && (
                          <button
                            type="button"
                            onClick={() => setTitheMode(m => m === "pct" ? "fixed" : "pct")}
                            className="text-xs px-2 py-0.5 rounded border border-gray-600 text-gray-400 hover:text-gray-200 transition flex-shrink-0"
                          >
                            {titheMode === "pct" ? "% mode" : "₵ mode"}
                          </button>
                        )}

                        {isTithe && titheMode === "pct" ? (
                          <div className="relative w-28 flex-shrink-0">
                            <input
                              type="number"
                              min="0" max="100" step="1"
                              value={tithePct}
                              onChange={e => setTithePct(Number(e.target.value))}
                              onBlur={() => saveLine(sec.key, sec.category, item)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-7 py-1.5 text-sm text-gray-200 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                          </div>
                        ) : (
                          <div className="relative w-28 flex-shrink-0">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₵</span>
                            <input
                              type="number"
                              min="0" step="0.01"
                              value={plans[item] ?? ""}
                              placeholder="0"
                              onChange={e => setPlans(p => ({ ...p, [item]: e.target.value }))}
                              onBlur={() => saveLine(sec.key, sec.category, item)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-2 py-1.5 text-sm text-gray-200 text-right placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}

                        <span className="w-5 text-center flex-shrink-0 text-xs">
                          {saving[item] && <span className="text-gray-500">...</span>}
                          {saved[item]  && <span className="text-green-400">✓</span>}
                        </span>
                      </div>

                      {isTithe && titheMode === "pct" && (
                        <p className="text-xs text-gray-600 text-right pr-8 -mt-0.5">
                          = {fmt(liveTitheValue)} on {fmt(liveIncomePlanned)} income
                        </p>
                      )}

                      {sec.hasDate && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 w-24 flex-shrink-0">
                            {sec.key === "income" ? "Expected date" : "Due date"}
                          </span>
                          <input
                            type="date"
                            value={dates[item] || ""}
                            onChange={e => setDates(d => ({ ...d, [item]: e.target.value }))}
                            onBlur={() => saveLine(sec.key, sec.category, item)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-gray-800">
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
