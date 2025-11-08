import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Log a warning instead of throwing an error
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using placeholder values for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  salary: number;
  wallet_address: string;
  join_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  employee_id: string;
  user_id: string;
  amount: number;
  token: string;
  transaction_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
  created_at: string;
}

// Employee with payment history
export interface EmployeeWithPayments extends Employee {
  payments?: Payment[];
}

// Chat Session Interface
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  last_message_content: string | null;
  last_message_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

// Chat Message Interface
export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  type: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Notification Interface
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}