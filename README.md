# Budget Tracker Upgrade — Integration Guide

## What’s Included

```
budget-upgrade/
├── migrations/
│   └── 001_upgrade_schema.sql     ← Run this on your Neon DB first
├── server.js                       ← Complete upgraded backend
└── src/components/
    ├── Dashboard.jsx               ← Main page (replace your current one)
    ├── TransactionTable.jsx        ← Filterable transaction list
    ├── TransactionForm.jsx         ← Add-transaction modal
    └── BudgetPlanEditor.jsx        ← Edit planned budget amounts
```

-----

## Step 1 — Run the Database Migration

Open your Neon dashboard → SQL Editor, paste and run:

```
migrations/001_upgrade_schema.sql
```

This will:

- Add new columns to your existing `transactions` table
  (`budget_month`, `budget_year`, `section`, `sub_category`, `expected_amount`, `transaction_date`)
- Create `budget_plans` table (one row per category per month)
- Create `monthly_summaries` table (cash flow baseline)
- Seed April 2026 with your spreadsheet’s planned amounts

-----

## Step 2 — Update Your Backend

Replace your existing `server.js` with the provided one.

Make sure your `.env` has:

```
DATABASE_URL=postgresql://...   # your Neon connection string
PORT=4000
```

Install any missing deps:

```bash
npm install express cors pg dotenv
```

Ensure `package.json` has `"type": "module"` (the file uses ES module imports).

-----

## Step 3 — Update Your Frontend

Copy the four component files into `src/components/`.

Install Chart.js if not already present:

```bash
npm install chart.js react-chartjs-2
```

In your `.env` (Vite):

```
VITE_API_URL=http://localhost:4000/api
```

In your `App.jsx` (or router), render `<Dashboard />` as the main route.

To add the Budget Plan Editor button to the Dashboard header, add this alongside the “+ Add Transaction” button:

```jsx
import BudgetPlanEditor from "./BudgetPlanEditor";

// In state:
const [showPlanEditor, setShowPlanEditor] = useState(false);

// In JSX (next to the existing button):
<button
  onClick={() => setShowPlanEditor(true)}
  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-600"
>
  📋 Edit Budget Plan
</button>

// At the bottom of the return, alongside the TransactionForm modal:
{showPlanEditor && (
  <BudgetPlanEditor
    month={month}
    year={year}
    onClose={() => { setShowPlanEditor(false); fetchData(); }}
  />
)}
```

-----

## How It Maps to Your Spreadsheet

|Spreadsheet Section      |App Equivalent                                 |
|-------------------------|-----------------------------------------------|
|Cash Flow (Budget/Actual)|Dashboard → Cash Flow Summary table            |
|Income rows              |`section = 'income'` transactions              |
|Expenses (variable)      |`section = 'expense'`, `category = 'Expenses'` |
|Bills                    |`section = 'expense'`, `category = 'Bills'`    |
|Debts                    |`section = 'expense'`, `category = 'Debts'`    |
|Savings & Investments    |`section = 'savings'` transactions             |
|Balance formula          |`startBalance + income - expenses - savings`   |
|Spent formula            |`bills + debts + variableExpenses`             |
|Actual Expenditure table |TransactionTable component                     |
|Budget column            |`budget_plans.budget_amount` (BudgetPlanEditor)|

-----

## API Reference

|Method|Endpoint                        |Description                    |
|------|--------------------------------|-------------------------------|
|GET   |`/api/summary?year=&month=`     |Full cash flow summary         |
|GET   |`/api/transactions?year=&month=`|All transactions for a month   |
|POST  |`/api/transactions`             |Add a transaction              |
|PATCH |`/api/transactions/:id`         |Update a transaction           |
|DELETE|`/api/transactions/:id`         |Delete a transaction           |
|GET   |`/api/budget-plans?year=&month=`|Get planned amounts for a month|
|PUT   |`/api/budget-plans`             |Upsert a planned amount        |

-----

## Notes

- Currency is formatted as **GHS (₵)** throughout. To change, search for `GHS` in the component files.
- The `Tithe` line uses a percentage in the spreadsheet (10%). Currently treated as a fixed amount — enter the computed value manually or add a `%`-mode toggle to the form.
- To add more months, copy the seed block in the SQL file and change the month number.