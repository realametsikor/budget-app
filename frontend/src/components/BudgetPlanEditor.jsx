// src/components/BudgetPlanEditor.jsx
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const SECTIONS = {
  "Income": ["Paycheck 1", "Paycheck 2", "Paycheck 3", "Paycheck 4", "Other Income"],
  "Savings & Investments": ["Petra Savings Booster", "IC Liquidity Fund", "Trade Stocks"],
  "Bills": ["Internet", "Wi-Fi", "Dues", "Airtime"],
  "Variable Expenses": ["Dining Out/Take Out", "Groceries", "Uber", "Public transport", "Personal Care", "Tithe", "Utilities", "Home Supplies", "Health/Medical", "Travel", "Other"],
  "Debts": ["Debt 1", "Debt 2", "Debt 3"]
};

const THEMES = {
  dark: { overlay: "rgba(0,0,0,0.7)", card: "#0a0a0a", border: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "#9ca3af", accent: "#D4AF37", inputBg: "rgba(255,255,255,0.05)", green: "#4ade80" },
  light: { overlay: "rgba(0,0,0,0.4)", card: "#ffffff", border: "rgba(0,0,0,0.1)", text: "#000", textMuted: "#64748b", accent: "#4f46e5", inputBg: "rgba(0,0,0,0.03)", green: "#16a34a" }
};

export default function BudgetPlanEditor({ month, year, onClose, authFetch }) {
  const { theme } = useAuth();
  const t = THEMES[theme || "dark"];
  
  const [plans, setPlans] = useState({});
  const [startBalance, setStartBalance] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, planRes] = await Promise.all([
          authFetch(`${API}/summary?year=${year}&month=${month}`),
          authFetch(`${API}/budget-plans?year=${year}&month=${month}`)
        ]);
        const sumData = await sumRes.json();
        setStartBalance(sumData.startBalance || "0");
        
        const data = await planRes.json();
        const map = {};
        if (Array.isArray(data)) {
          data.forEach(p => { map[p.sub_category] = p; });
        }
        setPlans(map);
      } catch (err) { console.error(err); }
    }
    load();
  }, [month, year, authFetch]);

  const handleChange = (subCat, field, val) => {
    setPlans(prev => ({
      ...prev,
      [subCat]: { ...prev[subCat], [field]: val }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch(`${API}/monthly-summary`, {
        method: "PUT", body: JSON.stringify({ budget_year: year, budget_month: month, start_balance: parseFloat(startBalance) || 0 })
      });
      for (const [sec, subs] of Object.entries(SECTIONS)) {
        for (const sub of subs) {
          const p = plans[sub];
          if (p && p.budget_amount) {
            await authFetch(`${API}/budget-plans`, {
              method: "PUT", body: JSON.stringify({ budget_year: year, budget_month: month, section: sec, category: sec, sub_category: sub, budget_amount: parseFloat(p.budget_amount) || 0, expected_date: p.expected_date })
            });
          }
        }
      }
      onClose();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const sectionTotal = (subs) => subs.reduce((sum, sub) => sum + (parseFloat(plans[sub]?.budget_amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors" style={{ background: t.overlay }}>
      <div className="w-full max-w-lg h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex-shrink-0 flex items-center justify-between" style={{ borderColor: t.border }}>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Target size={20} color={t.accent} /> Budget Plan</h3>
            <p className="text-xs font-semibold mt-1" style={{ color: t.textMuted }}>Set planned amounts & dates</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-white/10" style={{ color: t.textMuted }}><X size={20} /></button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="p-5 rounded-2xl border" style={{ background: t.inputBg, borderColor: t.border }}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold flex items-center gap-2"><Wallet size={16} color={t.accent} /> Start Balance</label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: t.textMuted }}>₵</span>
              <input type="number" value={startBalance} onChange={e => setStartBalance(e.target.value)} className="w-full pl-8 pr-4 py-3 rounded-xl outline-none font-bold bg-transparent border transition-colors focus:border-[color:var(--accent)]" style={{ borderColor: t.border }} />
            </div>
          </div>

          {Object.entries(SECTIONS).map(([sec, subs]) => {
            const isIncome = sec === "Income";
            return (
              <div key={sec}>
                <div className="flex justify-between items-end mb-4 border-b pb-2" style={{ borderColor: isIncome ? t.green : t.border }}>
                  <h4 className="font-bold text-sm" style={{ color: isIncome ? t.green : t.accent }}>{isIncome ? "↑" : "↓"} {sec}</h4>
                  <span className="text-xs font-bold" style={{ color: t.textMuted }}>Total: ₵{sectionTotal(subs).toFixed(2)}</span>
                </div>
                <div className="space-y-4">
                  {subs.map(sub => (
                    <div key={sub} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold block mb-1" style={{ color: t.text }}>{sub}</label>
                        <input type="number" placeholder="0.00" value={plans[sub]?.budget_amount || ""} onChange={e => handleChange(sub, "budget_amount", e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none text-sm font-semibold transition-colors" style={{ background: t.inputBg, border: `1px solid ${t.border}` }} />
                      </div>
                      <div className="w-1/3">
                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: t.textMuted }}>Date</label>
                        <input type="date" value={plans[sub]?.expected_date || ""} onChange={e => handleChange(sub, "expected_date", e.target.value)} className="w-full px-2 py-2 rounded-lg outline-none text-xs font-medium transition-colors" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.textMuted }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: t.border, background: t.card }}>
          <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]" style={{ background: t.accent, color: theme === "dark" ? "#000" : "#fff" }}>
            {saving ? "Saving..." : <><Check size={18} /> Done</>}
          </button>
        </div>
      </div>
    </div>
  );
}
