/*
  # Chat System Implementation

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, default 'New Chat')
      - `last_message_content` (text, nullable)
      - `last_message_timestamp` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to chat_sessions)
      - `user_id` (uuid, foreign key to users)
      - `type` (text, 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance

  3. Triggers
    - Auto-update timestamp trigger for chat_sessions
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL DEFAULT 'New Chat',
    last_message_content text,
    last_message_timestamp timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for chat_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE chat_sessions 
        ADD CONSTRAINT chat_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for chat_messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_session_id_fkey'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_user_id_fkey'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraint for message type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_type_check'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_type_check 
        CHECK (type IN ('user', 'assistant'));
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_sessions
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
    
    -- Create new policies
    CREATE POLICY "Users can read own chat sessions" ON chat_sessions
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    
    CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
        FOR INSERT TO authenticated
        WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can update own chat sessions" ON chat_sessions
        FOR UPDATE TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
        FOR DELETE TO authenticated
        USING (user_id = auth.uid());
END $$;

-- Create RLS policies for chat_messages
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read messages from own sessions" ON chat_messages;
    DROP POLICY IF EXISTS "Users can insert messages into own sessions" ON chat_messages;
    DROP POLICY IF EXISTS "Users can delete messages from own sessions" ON chat_messages;
    
    -- Create new policies
    CREATE POLICY "Users can read messages from own sessions" ON chat_messages
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    
    CREATE POLICY "Users can insert messages into own sessions" ON chat_messages
        FOR INSERT TO authenticated
        WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "Users can delete messages from own sessions" ON chat_messages
        FOR DELETE TO authenticated
        USING (user_id = auth.uid());
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at DESC);

-- Create trigger for updating updated_at column
DO $$
BEGIN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
    
    -- Create the trigger
    CREATE TRIGGER update_chat_sessions_updated_at
        BEFORE UPDATE ON chat_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;