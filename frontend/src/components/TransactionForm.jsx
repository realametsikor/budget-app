// src/components/TransactionForm.jsx
import { useState } from “react”;

const API = “https://budget-app-backend-gn8r.onrender.com/api”;

const CATEGORIES = {
income: {
label: “Income”,
items: [“Paycheck 1”, “Paycheck 2”, “Paycheck 3”, “Paycheck 4”, “Other Income”],
},
savings: {
label: “Savings & Investments”,
items: [“Petra Savings Booster”, “IC Liquidity Fund”, “Trade Stocks”],
},
expense: {
label: “Variable Expenses”,
items: [
“Dining Out/Take Out”, “Groceries”, “Uber”, “Public transport”,
“Personal Care”, “Tithe”, “Utilities”, “Home Supplies”,
“Health/Medical”, “Travel”, “Other”,
],
},
bills: {
label: “Bills”,
items: [“Internet”, “Wi-Fi”, “Dues”, “Airtime”],
},
debts: {
label: “Debts”,
items: [“Debt 1”],
},
};

const SECTION_FOR_GROUP = {
income:  “income”,
savings: “savings”,
expense: “expense”,
bills:   “expense”,
debts:   “expense”,
};

const CATEGORY_LABEL_FOR_GROUP = {
income:  “Income”,
savings: “Savings & Investments”,
expense: “Expenses”,
bills:   “Bills”,
debts:   “Debts”,
};

export default function TransactionForm({ month, year, onClose, onSaved, authFetch }) {
const [form, setForm] = useState({
description: “”,
amount: “”,
group: “expense”,
sub_category: CATEGORIES.expense.items[0],
transaction_date: new Date().toISOString().split(“T”)[0],
});
const [saving, setSaving] = useState(false);
const [error,  setError]  = useState(””);

const set = (k, v) => setForm(f => ({ …f, [k]: v }));

const handleGroupChange = (g) => {
set(“group”, g);
set(“sub_category”, CATEGORIES[g].items[0]);
};

const handleSubmit = async () => {
if (!form.description.trim()) return setError(“Description is required.”);
if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
return setError(“Enter a valid amount.”);

setSaving(true);
setError("");

const payload = {
  description:      form.description.trim(),
  amount:           parseFloat(form.amount),
  category:         CATEGORY_LABEL_FOR_GROUP[form.group],
  sub_category:     form.sub_category,
  section:          SECTION_FOR_GROUP[form.group],
  transaction_date: form.transaction_date || null,
  budget_month:     month,
  budget_year:      year,
};

try {
  const res = await authFetch(`${API}/transactions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Save failed.");
  onSaved?.();
  onClose();
} catch (err) {
  setError(err.message);
} finally {
  setSaving(false);
}

};

return (
<div
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
onClick={onClose}
>
<div
className=“bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl”
onClick={e => e.stopPropagation()}
>
{/* Header */}
<div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
<h2 className="text-lg font-semibold text-gray-100">Add Transaction</h2>
<button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
</div>

    <div className="px-6 py-5 space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
        <input
          type="date"
          value={form.transaction_date}
          onChange={e => set("transaction_date", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Type buttons */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleGroupChange(key)}
              className={`py-2 rounded-lg text-xs font-medium border transition ${
                form.group === key
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-category */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Sub-category</label>
        <select
          value={form.sub_category}
          onChange={e => set("sub_category", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {CATEGORIES[form.group].items.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
        <input
          type="text"
          placeholder="e.g. Shoprite groceries run"
          value={form.description}
          onChange={e => set("description", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount (GHS)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₵</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => set("amount", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>

    {/* Footer */}
    <div className="px-6 pb-5 flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition border border-gray-700"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
      >
        {saving ? "Saving…" : "Save Transaction"}
      </button>
    </div>
  </div>
</div>


);
}