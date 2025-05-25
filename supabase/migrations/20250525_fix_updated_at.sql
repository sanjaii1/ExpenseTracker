-- First, let's add the updated_at column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have updated_at value
UPDATE public.users SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.transactions SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.budgets SET updated_at = created_at WHERE updated_at IS NULL;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Create the correct function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (only if the column exists)
DO $$
BEGIN
    -- Check if updated_at column exists in users table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check if updated_at column exists in transactions table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'transactions' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        CREATE TRIGGER update_transactions_updated_at
            BEFORE UPDATE ON public.transactions
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Check if updated_at column exists in budgets table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'budgets' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        CREATE TRIGGER update_budgets_updated_at
            BEFORE UPDATE ON public.budgets
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
