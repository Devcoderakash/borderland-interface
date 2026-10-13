# Supabase — Database Layer

This directory contains all Supabase infrastructure for the APEX 1.0 platform.

## Structure

```
supabase/
├── migrations/     # SQL migration files (chronological, never delete)
├── functions/      # Supabase Edge Functions (if any)
├── seed/           # Seed data for local development
└── config.toml     # Supabase CLI configuration
```

## Database Tables

### `teams`
Primary registration table. Contains all team and payment data.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key (team ID) |
| `player_id` | text | Public-facing APEX-XXXX ID |
| `team_name` | text | Team display name |
| `leader_name` | text | Team leader full name |
| `email` | text | Contact email |
| `phone` | text | Contact phone |
| `college` | text | College/university |
| `team_size` | int | 2–4 |
| `suit` | text | Game suit (default: spades) |
| `ppt_url` | text | Google Drive PPT link |
| `preferred_domain` | text? | Hackathon domain preference |
| `github_url` | text? | Team GitHub URL |
| `linkedin_url` | text? | Leader LinkedIn URL |
| `status` | text | pending / approved / rejected |
| `payment_status` | text | pending / paid / failed |
| `payment_amount` | int | Amount in paise (e.g. 15000 = ₹199) |
| `payment_currency` | text | INR |
| `payment_order_id` | text | Internal order ID |
| `cashfree_order_id` | text | Cashfree-assigned order ID |
| `payment_id` | text? | Cashfree payment ID (on success) |
| `paid_at` | timestamptz? | Payment success timestamp |
| `created_at` | timestamptz | Registration timestamp |

### `team_members`
Individual member records linked to a team.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `team_id` | uuid | FK → teams.id |
| `full_name` | text | Member name |
| `position` | int | 1–4 (slot number) |

### `event_settings`
Admin-configurable event settings (single row).

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `event_name` | text | Event name |
| `event_date` | text | Event date string |
| `venue` | text | Venue |
| `registration_deadline` | text | Deadline string |
| `prize_pool` | text | Prize pool display string |
| `contact_email` | text | Contact email |
| `contact_phone` | text | Contact phone |

## Migrations

Migrations are applied in chronological order. **Never delete or reorder migration files.**

| File | Description |
|---|---|
| `20260908082323_*.sql` | Initial schema — teams, team_members, event_settings |
| `20260908082352_*.sql` | RLS policies |
| `20260920_add_payment_fields.sql` | Payment tracking columns |
| `20260928_prepare_cashfree_payment.sql` | Cashfree order ID columns |

## Running Locally

```bash
# Start Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Reset and reseed
npx supabase db reset
```

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `SUPABASE_URL` | Server + Client | Project REST URL |
| `VITE_SUPABASE_URL` | Browser client | Same URL, Vite-injected |
| `SUPABASE_PUBLISHABLE_KEY` | Server + Client | Anon/publishable key (safe for client) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser client | Same key, Vite-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server ONLY** | Admin key — never expose to browser |
