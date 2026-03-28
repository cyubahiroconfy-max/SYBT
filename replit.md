# Smart Youth Budget Tracker

A personal finance app for youth — track savings, set budgets, and log expenses. Built with React, Vite, Tailwind, shadcn/ui, and Supabase.

## Architecture

- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS, shadcn/ui component library
- **Auth & Database**: Supabase (external service) — handles authentication (email, phone OTP, username login) and PostgreSQL data via Row Level Security
- **State/Data fetching**: TanStack React Query + custom hooks (`useSavings`, `useAdminCheck`)
- **Routing**: React Router v6

## Project Structure

```
src/
  App.tsx               # Root app with routes
  main.tsx              # Entry point
  pages/                # Route-level pages
    AuthPage.tsx          # Sign in / sign up (email, phone, username)
    SavePage.tsx          # Add savings
    SpendPage.tsx         # Add expenses
    HistoryPage.tsx       # Transaction history
    NotFound.tsx
    admin/
      AdminLayout.tsx
      AdminDashboard.tsx  # Admin stats overview
      AdminUsers.tsx      # User management (toggle admin, delete)
  components/           # Reusable UI components
  contexts/             # SavingsContext (wraps useSavings hook)
  hooks/                # useSavings, useAdminCheck
  integrations/
    supabase/
      client.ts           # Supabase client init
      types.ts            # Auto-generated DB types
  layouts/
    MainLayout.tsx        # Header, nav, footer wrapper
  types/                # savings.ts type definitions
supabase/
  config.toml           # Supabase project config
  functions/            # Edge functions (lookup-email-by-username)
  migrations/           # SQL migrations applied to Supabase
```

## Key Features

- Email/phone/username sign-in + email verification
- Savings with lock periods (MTN / Airtel Mobile Money)
- Budget setting and spending tracking
- Savings goal progress bar
- Admin dashboard: view all users, savings, expenses; toggle admin roles; delete users
- Dark/light theme toggle

## Supabase Tables

- `profiles` — user profile (username, full_name)
- `savings` — savings entries with lock periods
- `expenses` — spending entries with categories
- `budgets` — per-user budget amount
- `user_roles` — admin role assignments

## Environment Variables

Managed via Replit Secrets (do not hardcode in files):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Development

```bash
npm run dev     # Start Vite dev server on port 5000
npm run build   # Production build
```
