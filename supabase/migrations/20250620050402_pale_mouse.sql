/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `notifications` table
    - Add policies for authenticated users to manage their own notifications
*/

-- Create the notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) for the notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table

-- Policy for authenticated users to select (read) their own notifications
CREATE POLICY "Users can read their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

-- Policy for authenticated users to insert (create) their own notifications
CREATE POLICY "Users can insert their own notifications" ON public.notifications
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy for authenticated users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- Policy for authenticated users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (user_id = auth.uid());

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);