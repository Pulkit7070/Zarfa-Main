/*
  # Add user_id to payments table

  1. Schema Changes
    - Add `user_id` column to payments table
    - Update existing payments with user_id from their associated employee
    - Make user_id column NOT NULL after updating existing rows
    - Add foreign key constraint to users table
    - Create index on user_id for faster lookups

  2. Security
    - Drop old RLS policies that used subqueries
    - Add new, simplified RLS policies using direct user_id check
*/

-- Add user_id column to payments table
ALTER TABLE public.payments
ADD COLUMN user_id uuid;

-- Update existing payments with user_id from their associated employee
-- This is crucial for existing data to be accessible after RLS change
UPDATE public.payments p
SET user_id = e.user_id
FROM public.employees e
WHERE p.employee_id = e.id;

-- Make user_id column NOT NULL after updating existing rows
ALTER TABLE public.payments
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.payments
ADD CONSTRAINT payments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can insert payments for own employees" ON public.payments;
DROP POLICY IF EXISTS "Users can read payments for own employees" ON public.payments;
DROP POLICY IF EXISTS "Users can update payments for own employees" ON public.payments;

-- Add new, simplified RLS policies
CREATE POLICY "Users can insert own payments" ON public.payments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own payments" ON public.payments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own payments" ON public.payments
FOR UPDATE USING (user_id = auth.uid());

-- Optional: Add a policy for delete if needed, similar to others
CREATE POLICY "Users can delete own payments" ON public.payments
FOR DELETE USING (user_id = auth.uid());