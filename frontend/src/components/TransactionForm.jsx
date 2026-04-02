// src/components/TransactionForm.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const SECTIONS = {
  "Income": ["Paycheck 1", "Paycheck 2", "Paycheck 3", "Paycheck 4", "Other Income"],
  "Savings & Investments": ["Petra Savings Booster", "IC Liquidity Fund", "Trade Stocks"],
  "Variable Expenses": ["Dining Out/Take Out", "Groceries", "Uber", "Public transport", "Personal Care", "Tithe", "Utilities", "Home Supplies", "Health/Medical", "Travel", "Other"],
  "Bills": ["Internet", "Wi-Fi", "Dues", "Airtime"],
  "Debts": ["Debt 1", "Debt 2", "Debt 3"]
};

const THEMES = {
  dark: { overlay: "rgba(0,0,0,0.7)", card: "#0a0a0a", border: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "#9ca3af", accent: "#D4AF37", inputBg: "rgba(255,255,255,0.05)" },
  light: { overlay: "rgba(0,0,0,0.4)", card: "#ffffff", border: "rgba(0,0,0,0.1)", text: "#000", textMuted: "#64748b", accent: "#4f46e5", inputBg: "rgba(0,0,0,0.03)" }
};

export default function TransactionForm({ month, year, onClose, onSaved, authFetch }) {
  const { theme } = useAuth();
  const t = THEMES[theme || "dark"];

  const [date, setDate] = useState(`${year}-${String(month).padStart(2, "0")}-01`);
  const [section, setSection] = useState("Variable Expenses");
  const [subCategory, setSub] = useState(SECTIONS["Variable Expenses"][0]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSectionChange = (sec) => {
    setSection(sec);
    setSub(SECTIONS[sec][0]);
  };

  const handleSave = async () => {
    setError("");
    if (!amount || isNaN(amount) || amount <= 0) return setError("Please enter a valid amount.");
    setLoading(true);
    try {
      await authFetch(`${API}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          description: desc || "Unnamed transaction",
          amount: parseFloat(amount),
          category: section,
          sub_category: subCategory,
          section: section,
          transaction_date: date,
          budget_month: month,
          budget_year: year,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors" style={{ background: t.overlay }}>
      <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]" style={{ background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full transition-colors" style={{ color: t.textMuted }} onMouseEnter={e=>e.currentTarget.style.background=t.inputBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-6">Add Transaction</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none font-medium transition-colors" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SECTIONS).map(sec => (
                <button key={sec} onClick={() => handleSectionChange(sec)} className="px-3 py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: section === sec ? t.accent : t.inputBg, color: section === sec ? (theme === "dark" ? "#000" : "#fff") : t.textMuted, border: `1px solid ${section === sec ? t.accent : t.border}` }}>
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Sub-category</label>
            <select value={subCategory} onChange={e => setSub(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none font-medium transition-colors appearance-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
              {SECTIONS[section].map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Shoprite groceries run" className="w-full px-4 py-3 rounded-xl outline-none font-medium transition-colors" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Amount (GHS)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: t.textMuted }}>₵</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-xl outline-none font-bold transition-colors text-lg" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
            </div>
          </div>

          {error && <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-500">{error}</div>}

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: t.border }}>
            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold transition-colors" style={{ background: t.inputBg, color: t.textMuted }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} className="flex-[2] py-3.5 rounded-xl font-bold transition-transform hover:scale-[1.02]" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
              {loading ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
