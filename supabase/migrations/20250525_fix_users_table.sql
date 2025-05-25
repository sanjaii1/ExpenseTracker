-- First, let's check what columns actually exist and fix the table structure
-- Drop all existing triggers that might be causing issues
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Let's recreate the users table with the correct structure
-- First backup any existing data
CREATE TABLE IF NOT EXISTS public.users_backup AS SELECT * FROM public.users;

-- Drop and recreate the users table with proper structure
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    currency TEXT DEFAULT 'USD',
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore data from backup if it exists
INSERT INTO public.users (id, email, name, currency, theme, created_at, updated_at)
SELECT 
    id, 
    email, 
    name, 
    COALESCE(currency, 'USD') as currency,
    COALESCE(theme, 'light') as theme,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(created_at, NOW()) as updated_at
FROM public.users_backup
ON CONFLICT (id) DO NOTHING;

-- Drop the backup table
DROP TABLE IF EXISTS public.users_backup;

-- Create a simple function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, currency, theme)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'USD',
        'light'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure transactions table has proper structure
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing transactions
UPDATE public.transactions SET updated_at = created_at WHERE updated_at IS NULL;

-- Create trigger for transactions
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure budgets table has proper structure  
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing budgets
UPDATE public.budgets SET updated_at = created_at WHERE updated_at IS NULL;

-- Create trigger for budgets
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
