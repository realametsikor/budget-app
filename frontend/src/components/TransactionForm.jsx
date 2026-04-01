import React, { useState } from 'react';
import { api } from '../api';

const CATEGORIES = {
    expense: ['Feeding', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Other'],
    income: ['Salary', 'Business', 'Investments', 'Gift', 'Other']
};

export default function TransactionForm({ refreshData }) {
    const [formData, setFormData] = useState({
        type: 'expense', amount: '', category: 'Feeding', description: '', date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/transactions', formData);
        setFormData({ ...formData, amount: '', description: '' });
        refreshData();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Add Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <select 
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value, category: CATEGORIES[e.target.value][0]})}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                
                <input type="number" step="0.01" required placeholder="Amount" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                
                <select className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input type="text" placeholder="Description" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                    Add Record
                </button>
            </div>
        </form>
    );
}
