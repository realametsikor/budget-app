const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Updated Database Connection (Now with SSL for Neon)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { require: true, rejectUnauthorized: false }
});

// 2. Auto-Create Table on Startup (Saves you from doing it manually in Neon)
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
                amount DECIMAL(12, 2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                date DATE DEFAULT CURRENT_DATE
            );
        `);
        console.log('Database connected and table verified.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};
initDB();

// GET: All Transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add Transaction
app.post('/api/transactions', async (req, res) => {
    const { type, amount, category, description, date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (type, amount, category, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [type, amount, category, description, date || new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove Transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Summary & Analytics
app.get('/api/summary', async (req, res) => {
    try {
        const { rows: totals } = await pool.query(`
            SELECT type, COALESCE(SUM(amount), 0) as total 
            FROM transactions GROUP BY type
        `);
        
        const { rows: categoryTotals } = await pool.query(`
            SELECT category, SUM(amount) as total 
            FROM transactions WHERE type = 'expense' GROUP BY category
        `);

        let income = 0, expense = 0;
        totals.forEach(t => {
            if (t.type === 'income') income = parseFloat(t.total);
            if (t.type === 'expense') expense = parseFloat(t.total);
        });

        res.json({
            income,
            expense,
            balance: income - expense,
            categoryData: categoryTotals
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
