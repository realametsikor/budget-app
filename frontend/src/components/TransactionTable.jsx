import React from 'react';
import { api } from '../api';
import { Trash2 } from 'lucide-react';

export default function TransactionTable({ transactions, refreshData }) {
    const handleDelete = async (id) => {
        if(window.confirm('Delete this transaction?')) {
            await api.delete(`/transactions/${id}`);
            refreshData();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b">Date</th>
                            <th className="p-4 border-b">Description</th>
                            <th className="p-4 border-b">Category</th>
                            <th className="p-4 border-b">Amount</th>
                            <th className="p-4 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition border-b last:border-0">
                                <td className="p-4 text-gray-700">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-700">{t.description}</td>
                                <td className="p-4 text-gray-700">
                                    <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">{t.category}</span>
                                </td>
                                <td className={`p-4 font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No transactions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
