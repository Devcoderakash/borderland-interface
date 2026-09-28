-- Migration to add Cashfree payment fields to public.teams
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS payment_order_id text,
ADD COLUMN IF NOT EXISTS cashfree_order_id text;
