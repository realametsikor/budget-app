import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ summary }) {
    if (!summary) return <div>Loading...</div>;

    const chartData = {
        labels: summary.categoryData.map(c => c.category),
        datasets: [{
            data: summary.categoryData.map(c => c.total),
            backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'],
            borderWidth: 1,
        }]
    };

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Wallet /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Balance</p>
                        <h3 className="text-2xl font-bold text-gray-800">${summary.balance.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Income</p>
                        <h3 className="text-2xl font-bold text-gray-800">${summary.income.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg"><TrendingDown /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-gray-800">${summary.expense.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full md:w-1/2 mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">Expenses by Category</h3>
                {summary.categoryData.length > 0 ? (
                    <Doughnut data={chartData} />
                ) : (
                    <p className="text-center text-gray-500">No expenses recorded yet.</p>
                )}
            </div>
        </div>
    );
}
