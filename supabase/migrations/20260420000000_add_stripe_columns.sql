-- Add Stripe-related columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Update RLS policies
-- 1. Profiles are viewable by everyone ONLY if is_published is true
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles 
FOR SELECT USING (is_published = true);

-- 2. Users can see their own profile even if not published
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
CREATE POLICY "Users can view own profile." ON public.profiles 
FOR SELECT USING (auth.uid() = id);
