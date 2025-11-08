/*
  # Create users and employees tables with payment tracking

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `company_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `email` (text)
      - `designation` (text)
      - `department` (text)
      - `salary` (decimal)
      - `wallet_address` (text)
      - `join_date` (date)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payments`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `amount` (decimal)
      - `token` (text)
      - `transaction_hash` (text)
      - `status` (text, pending/completed/failed)
      - `payment_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only see their own employees and payments
    - Employees can only be managed by their associated user

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for user-based queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  designation text NOT NULL,
  department text NOT NULL DEFAULT 'Engineering',
  salary decimal(10,2) NOT NULL CHECK (salary > 0),
  wallet_address text NOT NULL CHECK (length(wallet_address) = 58),
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  token text NOT NULL DEFAULT 'APT',
  transaction_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for employees table
CREATE POLICY "Users can read own employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for payments table
CREATE POLICY "Users can read payments for own employees"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for own employees"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments for own employees"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_payments_employee_id ON payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();