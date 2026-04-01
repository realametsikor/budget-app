import { useState } from "react";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const CATEGORIES = {
  income: { label: "Income", items: ["Paycheck 1", "Paycheck 2", "Paycheck 3", "Paycheck 4", "Other Income"] },
  savings: { label: "Savings & Investments", items: ["Petra Savings Booster", "IC Liquidity Fund", "Trade Stocks"] },
  expense: { label: "Variable Expenses", items: ["Dining Out/Take Out", "Groceries", "Uber", "Public transport", "Personal Care", "Tithe", "Utilities", "Home Supplies", "Health/Medical", "Travel", "Other"] },
  bills: { label: "Bills", items: ["Internet", "Wi-Fi", "Dues", "Airtime"] },
  debts: { label: "Debts", items: ["Debt 1"] },
};

export default function TransactionForm({ month, year, onClose, onSaved, authFetch }) {
  const [form, setForm] = useState({
    description: "", amount: "", group: "expense",
    sub_category: CATEGORIES.expense.items[0],
    transaction_date: new Date().toISOString().split("T")[0]
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      ...form,
      category: CATEGORIES[form.group].label,
      section: form.group === "income" ? "income" : (form.group === "savings" ? "savings" : "expense"),
      budget_month: month,
      budget_year: year,
      amount: parseFloat(form.amount)
    };

    try {
      // Use authFetch to include the user_id automatically
      await authFetch(`${API}/transactions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSaved();
      onClose();
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <div className="space-y-4">
          <input type="date" value={form.transaction_date} onChange={e => setForm({...form, transaction_date: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
          <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
          <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 bg-gray-800 rounded-lg">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-indigo-600 rounded-lg">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
