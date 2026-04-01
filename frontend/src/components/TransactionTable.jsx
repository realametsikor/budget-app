import { useState } from "react";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

export default function TransactionTable({ transactions, onDelete, month, year, authFetch }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this?")) return;
    setDeleting(id);
    try {
      // authFetch ensures you can only delete YOUR transactions
      await authFetch(`${API}/transactions/${id}`, { method: "DELETE" });
      onDelete();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase text-gray-500 border-b border-gray-800">
          <tr>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3 text-right">Amount</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td className="px-6 py-4">{tx.description}</td>
              <td className="px-6 py-4 text-right font-bold text-indigo-400">₵{tx.amount}</td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleDelete(tx.id)} className="text-red-500">{deleting === tx.id ? "..." : "✕"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
