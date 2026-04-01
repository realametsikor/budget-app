import { useEffect, useState } from "react";

const API = "https://budget-app-backend-gn8r.onrender.com/api";

export default function BudgetPlanEditor({ month, year, onClose, authFetch }) {
  const [plans, setPlans] = useState({});
  const [startBalance, setStartBal] = useState("");

  useEffect(() => {
    const load = async () => {
      const [pRes, sRes] = await Promise.all([
        authFetch(`${API}/budget-plans?year=${year}&month=${month}`),
        authFetch(`${API}/summary?year=${year}&month=${month}`)
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      
      const map = {};
      pData.forEach(r => { map[r.sub_category] = r.budget_amount; });
      setPlans(map);
      setStartBal(sData.startBalance || "");
    };
    load();
  }, [month, year, authFetch]);

  const saveStartBalance = async () => {
    await authFetch(`${API}/monthly-summary`, {
      method: "PUT",
      body: JSON.stringify({ budget_year: year, budget_month: month, start_balance: parseFloat(startBalance || 0) })
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6">Edit Budget Plan</h2>
        <div className="space-y-4">
          <label className="block text-sm text-gray-400">Start Balance (₵)</label>
          <input 
            type="number" 
            value={startBalance} 
            onChange={e => setStartBal(e.target.value)} 
            onBlur={saveStartBalance}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
          />
          <button onClick={onClose} className="w-full py-3 bg-indigo-600 rounded-xl font-bold mt-4">Done</button>
        </div>
      </div>
    </div>
  );
}
