# APEX 1.0 — Open Innovation Hackathon

A full-stack web application for the APEX 1.0 hackathon, featuring team registration, Cashfree payment integration, and an admin dashboard.

## Project Structure

```
Hack_website/
├── frontend/          ← React SPA (Vite + TanStack Router + Tailwind CSS)
├── backend/           ← Express.js API server (TypeScript)
├── supabase/          ← Database migrations, edge functions, seed data
├── package.json       ← Root workspace scripts
└── .gitignore
```

## Quick Start

### 1. Install Dependencies

```bash
# Install root dev dependencies (concurrently)
npm install

# Install frontend + backend
npm run install:all
```

### 2. Configure Environment Variables

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Edit both `.env` files with your real Supabase and Cashfree credentials.

### 3. Run Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:frontend   # → http://localhost:5173
npm run dev:backend    # → http://localhost:5001
```

### 4. Build for Production

```bash
npm run build
```

## Architecture

### Frontend (`frontend/`)
- **Framework**: React 19 + Vite
- **Routing**: TanStack Router (file-based)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State**: TanStack React Query
- **Payment UI**: Cashfree JS SDK (client-side checkout modal)

### Backend (`backend/`)
- **Runtime**: Node.js + Express
- **Language**: TypeScript (tsx for dev)
- **Database**: Supabase (PostgreSQL via JS client)
- **Payments**: Cashfree PG API v2023-08-01
- **Auth**: JWT middleware, cron secret authentication

### Supabase (`supabase/`)
- SQL migrations for teams, members, settings, roles
- Edge functions (if applicable)
- Seed data

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/payment/create-order` | Register team + create Cashfree order |
| POST | `/api/payment/verify` | Verify payment status |
| GET | `/api/payment/order/:id` | Get order/team by order ID |
| POST | `/api/payment/webhook` | Cashfree webhook handler |
| GET | `/api/admin/registrations` | List all registrations |
| GET | `/api/admin/stats` | Dashboard statistics |
| PATCH | `/api/admin/teams/:id/status` | Update team status |
| DELETE | `/api/admin/teams/:id` | Delete a team |
| GET | `/api/admin/settings` | Get event settings |
| POST | `/api/admin/settings` | Update event settings |

## Frontend Routes

| Route | Page |
|-------|------|
| `/` | Home |
| `/register` | Registration + payment |
| `/success` | Payment confirmation |
| `/rules` | Hackathon rules |
| `/prizes` | Prize information |
| `/faq` | FAQ |
| `/admin` | Admin dashboard |
| `/admin/registrations` | Manage registrations |
