# BudgetTracker — Auth Upgrade Guide

## What’s in this delivery

```
auth-upgrade/
├── migrations/
│   └── 003_multi_user_auth.sql      ← Run first in Neon
├── server.js                         ← Full backend with auth
├── src/
│   ├── App.jsx                       ← Router with auth guards
│   ├── context/
│   │   └── AuthContext.jsx           ← Auth state, tokens, authFetch
│   ├── pages/
│   │   ├── HomePage.jsx              ← Public landing page
│   │   └── AuthPages.jsx             ← Login + Register pages
│   └── components/
│       └── Dashboard.jsx             ← Auth-aware dashboard
```

> TransactionForm, TransactionTable, BudgetPlanEditor stay the same —
> just add `authFetch` prop and replace every `fetch(...)` call with
> `authFetch(...)`. See “Update existing components” section below.

-----

## Step 1 — Neon Database Migration

Paste `migrations/003_multi_user_auth.sql` into Neon SQL Editor and run it.

This creates:

- `users` table (email+password and Google OAuth)
- `sessions` table (refresh tokens)
- Adds `user_id` FK to `transactions`, `budget_plans`, `monthly_summaries`
- Re-creates unique constraints scoped per user

-----

## Step 2 — Backend environment variables

Add to your Render environment (Dashboard → Environment):

```
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<another random 64-char string>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Install new backend dependencies:

```bash
npm install bcryptjs jsonwebtoken google-auth-library
```

-----

## Step 3 — Google OAuth setup (takes ~5 minutes)

1. Go to https://console.cloud.google.com
1. Create a project (or use existing)
1. APIs & Services → Credentials → Create OAuth 2.0 Client ID
1. Application type: **Web application**
1. Authorised JavaScript origins:
- `http://localhost:5173`
- `https://your-vercel-app.vercel.app`
1. Copy the **Client ID** — no client secret needed (we use the newer GSI flow)

-----

## Step 4 — Frontend environment variables

Create/update `frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

-----

## Step 5 — Add Google Identity Services script to index.html

In `frontend/index.html`, add inside `<head>`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

-----

## Step 6 — Install frontend dependencies

```bash
cd frontend
npm install react-router-dom
```

-----

## Step 7 — Replace frontend files

|File                          |Action                           |
|------------------------------|---------------------------------|
|`src/App.jsx`                 |Replace entirely                 |
|`src/context/AuthContext.jsx` |New file — create directory first|
|`src/pages/HomePage.jsx`      |New file — create directory first|
|`src/pages/AuthPages.jsx`     |New file                         |
|`src/components/Dashboard.jsx`|Replace entirely                 |

-----

## Step 8 — Update existing components to use authFetch

`TransactionForm.jsx`, `TransactionTable.jsx`, and `BudgetPlanEditor.jsx` each
make `fetch()` calls to the API. Since the API now requires a Bearer token, you
need to:

### A) Accept the authFetch prop

```jsx
// Before
export default function TransactionForm({ month, year, onClose, onSaved }) {

// After
export default function TransactionForm({ month, year, onClose, onSaved, authFetch }) {
```

### B) Replace every fetch() call

```jsx
// Before
const res = await fetch(`${API}/transactions`, { method: "POST", ... });

// After
const res = await authFetch(`${API}/transactions`, { method: "POST", ... });
```

Do this in all three components. The `authFetch` function handles:

- Adding the Authorization header automatically
- Refreshing the access token silently if it expires
- Redirecting to login if the refresh token is also expired

-----

## How auth works (for reference)

```
Register/Login → access token (15 min) + refresh token (30 days)
                 Both stored in localStorage

API calls → authFetch adds "Authorization: Bearer <access>"

401 response → authFetch calls POST /api/auth/refresh with refresh token
               Gets new access token → retries original request

Refresh expired → user is logged out, redirected to /login

Logout → DELETE from sessions table, clear localStorage
```

-----

## Routes

|Path       |Page     |Access                                     |
|-----------|---------|-------------------------------------------|
|`/`        |Homepage |Public                                     |
|`/login`   |Login    |Public (redirects to /app if logged in)    |
|`/register`|Register |Public (redirects to /app if logged in)    |
|`/app`     |Dashboard|Private (redirects to /login if logged out)|

-----

## When you’re ready to monetise

The user table already has the structure for it. To add paid tiers later:

```sql
ALTER TABLE users
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  ADD COLUMN plan_expires_at TIMESTAMPTZ;
```

Then gate features in both the backend (`req.user.plan`) and frontend.