-- Create savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings_transactions table to track individual contributions
CREATE TABLE IF NOT EXISTS public.savings_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    savings_id UUID NOT NULL REFERENCES public.savings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_status ON public.savings(status);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_savings_id ON public.savings_transactions(savings_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON public.savings_transactions(date);

-- Enable Row Level Security
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for savings table
CREATE POLICY "Users can view own savings" ON public.savings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings" ON public.savings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings" ON public.savings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings" ON public.savings
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for savings_transactions table
CREATE POLICY "Users can view own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings transactions" ON public.savings_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings transactions" ON public.savings_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_savings_updated_at
    BEFORE UPDATE ON public.savings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update current_amount when savings_transactions change
CREATE OR REPLACE FUNCTION public.update_savings_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the current_amount in savings table
    UPDATE public.savings 
    SET current_amount = (
        SELECT COALESCE(
            SUM(CASE 
                WHEN transaction_type = 'deposit' THEN amount 
                WHEN transaction_type = 'withdrawal' THEN -amount 
                ELSE 0 
            END), 0
        )
        FROM public.savings_transactions 
        WHERE savings_id = COALESCE(NEW.savings_id, OLD.savings_id)
    )
    WHERE id = COALESCE(NEW.savings_id, OLD.savings_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update current_amount automatically
CREATE TRIGGER update_savings_amount_on_insert
    AFTER INSERT ON public.savings_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_savings_current_amount();

CREATE TRIGGER update_savings_amount_on_update
    AFTER UPDATE ON public.savings_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_savings_current_amount();

CREATE TRIGGER update_savings_amount_on_delete
    AFTER DELETE ON public.savings_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_savings_current_amount();
