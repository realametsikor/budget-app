import { useState } from "react";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

const SECTION_COLORS = {
  income:  "bg-green-900/40 text-green-300 border-green-700",
  expense: "bg-red-900/40 text-red-300 border-red-800",
  savings: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
};

const SECTION_ICONS = { income: "↑", expense: "↓", savings: "★" };

export default function TransactionTable({ transactions, onDelete, month, year, authFetch }) {
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);

  const fmt = (n) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n ?? 0);

  const filtered = transactions.filter(tx => {
    const matchSection = filter === "all" || tx.section === filter;
    const matchSearch  = !search ||
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category?.toLowerCase().includes(search.toLowerCase()) ||
      tx.sub_category?.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    setDeleting(id);
    try {
      await authFetch(`${API}/transactions/${id}`, { method: "DELETE" });
      onDelete?.();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-200 text-sm md:text-base">
            🧾 Expenditure — {month} {year}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["all", "income", "expense", "savings"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                filter === f
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 md:w-40"
          />
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-500 border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-6 py-3">Date</th>
              <th className="text-left px-6 py-3">Description</th>
              <th className="text-left px-6 py-3">Category</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-right px-6 py-3">Amount</th>
              <th className="px-6 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-600 text-sm">
                  No transactions found. Add your first one above.
                </td>
              </tr>
            )}
            {filtered.map(tx => (
              <tr key={tx.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {tx.transaction_date
                    ? new Date(tx.transaction_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    : "—"}
                </td>
                <td className="px-6 py-3 text-gray-200 max-w-xs truncate">{tx.description}</td>
                <td className="px-6 py-3 text-gray-400 text-xs">
                  <span className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5">
                    {tx.sub_category || tx.category}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    SECTION_COLORS[tx.section] || "bg-gray-800 text-gray-400 border-gray-700"
                  }`}>
                    {SECTION_ICONS[tx.section] || "•"} {tx.section}
                  </span>
                </td>
                <td className={`px-6 py-3 text-right font-semibold ${tx.section === "income" ? "text-green-400" : "text-gray-100"}`}>
                  {tx.section === "income" ? "+" : "-"}{fmt(tx.amount)}
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="text-gray-600 hover:text-red-400 transition text-xs disabled:opacity-50"
                  >
                    {deleting === tx.id ? "..." : "✕"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-gray-800/50 border-t border-gray-700 font-semibold text-sm">
                <td colSpan={4} className="px-6 py-3 text-gray-400">
                  {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                </td>
                <td className="px-6 py-3 text-right text-gray-100">
                  {fmt(filtered.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden">
        {filtered.length === 0 && (
          <p className="text-center py-10 text-gray-600 text-sm">
            No transactions found. Add your first one above.
          </p>
        )}
        <div className="divide-y divide-gray-800">
          {filtered.map(tx => (
            <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                tx.section === "income"  ? "bg-green-900/50 text-green-400" :
                tx.section === "savings" ? "bg-yellow-900/50 text-yellow-400" :
                "bg-red-900/50 text-red-400"
              }`}>
                {SECTION_ICONS[tx.section] || "•"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span>{tx.sub_category || tx.category}</span>
                  {tx.transaction_date && (
                    <>
                      <span className="text-gray-700">·</span>
                      <span>
                        {new Date(tx.transaction_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-semibold ${tx.section === "income" ? "text-green-400" : "text-gray-100"}`}>
                  {tx.section === "income" ? "+" : "-"}{fmt(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id)}
                  disabled={deleting === tx.id}
                  className="text-gray-700 hover:text-red-400 transition text-xs p-1 disabled:opacity-50"
                >
                  {deleting === tx.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/50 flex justify-between text-sm font-semibold">
            <span className="text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
            <span className="text-gray-100">
              {fmt(filtered.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0))}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
