import React, { useState, useEffect } from 'react';
import { api } from './api';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';

export default function App() {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);

    const fetchData = async () => {
        try {
            const [txRes, sumRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/summary')
            ]);
            setTransactions(txRes.data);
            setSummary(sumRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-800">BudgetTracker</h1>
                    <p className="text-gray-500">Manage your finances efficiently</p>
                </header>

                <Dashboard summary={summary} />
                <TransactionForm refreshData={fetchData} />
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Transactions</h3>
                <TransactionTable transactions={transactions} refreshData={fetchData} />
            </div>
        </div>
    );
}
