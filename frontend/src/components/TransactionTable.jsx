// src/components/TransactionTable.jsx
import { useState } from "react";
import { Search, ArrowDownRight, ArrowUpRight, Star, X, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const THEMES = {
  dark: { card: "rgba(20,20,20,0.6)", border: "rgba(255,255,255,0.08)", text: "#fff", textMuted: "#9ca3af", accent: "#D4AF37", green: "#4ade80", red: "#f87171", inputBg: "rgba(255,255,255,0.05)" },
  light: { card: "#ffffff", border: "rgba(0,0,0,0.08)", text: "#000", textMuted: "#64748b", accent: "#4f46e5", green: "#16a34a", red: "#dc2626", inputBg: "rgba(0,0,0,0.03)" }
};

export default function TransactionTable({ transactions, onDelete, month, year, authFetch }) {
  const { theme } = useAuth();
  const t = THEMES[theme || "dark"];

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(tx => {
    const s = (tx.section || "").toLowerCase();
    const isInc = s.includes("income");
    const isSav = s.includes("saving");
    const isExp = !isInc && !isSav;

    let matchType = true;
    if (filter === "Income") matchType = isInc;
    if (filter === "Expense") matchType = isExp;
    if (filter === "Savings") matchType = isSav;

    const matchSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) || tx.sub_category?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await authFetch(`${API}/transactions/${id}`, { method: "DELETE" });
      onDelete();
    } catch (err) { console.error("Failed to delete", err); }
  };

  const fmt = (n) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);

  return (
    <div className="rounded-[2rem] border shadow-lg glass-card overflow-hidden" style={{ background: t.card, borderColor: t.border }}>
      
      {/* Header & Controls */}
      <div className="px-6 py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: t.border }}>
        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: t.text }}><ReceiptText size={20} color={t.accent} /> Logbook — {month} {year}</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-2 w-full sm:w-auto">
            {["All", "Income", "Expense", "Savings"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-lg text-xs font-bold transition-colors" style={{ background: filter === f ? t.accent : t.inputBg, color: filter === f ? (theme==="dark"?"#000":"#fff") : t.textMuted }}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium outline-none transition-colors" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y" style={{ borderColor: t.border }}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center font-medium" style={{ color: t.textMuted }}>No transactions found.</div>
        ) : (
          filtered.map(tx => {
            const isInc = (tx.section || "").toLowerCase().includes("income");
            const isSav = (tx.section || "").toLowerCase().includes("saving");
            const icon = isInc ? <ArrowDownRight size={16} /> : isSav ? <Star size={14} /> : <ArrowUpRight size={16} />;
            const color = isInc ? t.green : isSav ? t.accent : t.red;
            const date = new Date(tx.transaction_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

            return (
              <div key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:opacity-80 transition-opacity" style={{ background: theme==="dark"?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color: color }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: t.text }}>{tx.description}</p>
                  <p className="text-xs font-medium mt-1 truncate" style={{ color: t.textMuted }}>{tx.sub_category || tx.category} · {date}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm md:text-base font-bold" style={{ color }}>{isInc ? "+" : "-"}{fmt(tx.amount)}</span>
                  <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded transition-colors hover:bg-red-500/20 text-red-500/50 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
