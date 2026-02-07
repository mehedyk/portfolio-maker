-- FIX FOR RELATIONSHIP ERROR IN ADMIN PANEL
-- The admin panel tries to join payment_requests with user_profiles.
-- Currently payment_requests links to auth.users, so the join fails.
-- We will change the FK to point to user_profiles instead.

-- 1. Drop existing constraint (name might vary, so we try to catch standard names)
ALTER TABLE public.payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_user_id_fkey;

-- 2. Add new constraint referencing user_profiles
ALTER TABLE public.payment_requests
ADD CONSTRAINT payment_requests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.user_profiles(id) 
ON DELETE CASCADE;

-- 3. Also fix 'processed_by' just in case we ever want to join that with profiles too
ALTER TABLE public.payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_processed_by_fkey;

ALTER TABLE public.payment_requests
ADD CONSTRAINT payment_requests_processed_by_fkey 
FOREIGN KEY (processed_by) 
REFERENCES public.user_profiles(id);

-- 4. Reload schema cache (handled automatically by Supabase usually, but good to know)
NOTIFY pgrst, 'reload schema';
