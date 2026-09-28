ALTER TABLE public.teams
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_id text,
ADD COLUMN razorpay_order_id text,
ADD COLUMN payment_signature text,
ADD COLUMN payment_amount integer,
ADD COLUMN payment_currency text,
ADD COLUMN paid_at timestamptz;
