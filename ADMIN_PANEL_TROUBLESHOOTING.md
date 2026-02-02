# Admin Panel Not Showing - Troubleshooting Guide

## Issue
The admin panel link is not appearing in the dashboard even though you've set yourself as admin.

## Root Cause
The admin panel link appears based on `profile?.role === 'admin'`, but the profile data might not be loading correctly.

## Step-by-Step Fix

### Step 1: Apply the RLS Policy Fix
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL:
   ```sql
   CREATE POLICY "Admins can view all user profiles" ON user_profiles
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM user_profiles 
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```
3. Click **Run** to execute

### Step 2: Verify Your Role in Database
1. Go to **Supabase Dashboard** → **Table Editor** → **user_profiles**
2. Find your user record
3. Make sure the **role** column shows `admin` (not `user`)
4. If it's not set, click on the cell and change it to `admin`

### Step 3: Clear Cache and Re-login
1. **Sign out** from the application
2. **Clear browser cache** (or open in incognito/private mode)
3. **Sign back in**
4. The admin panel link should now appear

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to the **Console** tab
3. Look for these debug logs:
   ```
   Profile data: { id: "...", role: "admin", ... }
   Profile role: admin
   ```
4. If you see `Profile role: user` or `Profile role: undefined`, the issue is with the database or RLS policies

### Step 5: Manual Profile Refresh (If Still Not Working)
If the admin panel still doesn't appear, try this temporary workaround:
1. Open browser console (F12)
2. Run this command:
   ```javascript
   localStorage.clear()
   location.reload()
   ```
3. Sign in again

## Expected Result
After following these steps, you should see:
- ✅ "Admin Panel" button in the dashboard navigation
- ✅ Console shows `Profile role: admin`
- ✅ Clicking "Admin Panel" takes you to `/admin` route

## Still Not Working?
Check for errors in:
1. **Browser Console** - Look for any red error messages
2. **Supabase Logs** - Check for RLS policy violations
3. **Network Tab** - Check if the profile fetch is returning data

Let me know what you see in the console logs!
