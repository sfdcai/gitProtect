# 🛠️ Supabase Complete Setup Guide

This guide covers everything you need to configure in your Supabase Dashboard to make the GitProtect app work perfectly with your custom domain (`https://gitprotect.amitbhardwaj.co.uk`).

---

## 1. Database Setup (Fixing the Profile Error)
We need to tell Supabase to automatically create a `profile` every time a new user signs up. If this is missing, you will get a "Foreign Key Constraint" error when trying to add a repository.

1. Go to **SQL Editor** on the left menu of your Supabase dashboard.
2. Click **New query**, paste the code below, and click **Run**:

```sql
-- Create a function that automatically creates a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username'),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to run every time a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Allow users to create and delete their own scan jobs
CREATE POLICY "Users can insert own jobs" ON scan_jobs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM scan_targets WHERE scan_targets.id = target_id AND scan_targets.user_id = auth.uid())
);
CREATE POLICY "Users can delete own jobs" ON scan_jobs FOR DELETE USING (
    EXISTS (SELECT 1 FROM scan_targets WHERE scan_targets.id = target_id AND scan_targets.user_id = auth.uid())
);
```

---

## 2. URL Configuration (Fixing Redirects)
Since you are using a custom domain, Supabase needs to authorize it.

1. Go to **Authentication** → **URL Configuration**.
2. **Site URL:** Change this to exactly `https://gitprotect.amitbhardwaj.co.uk`
3. **Redirect URLs:** Click "Add URL" and add `https://gitprotect.amitbhardwaj.co.uk/auth/callback`
4. Click **Save**.

---

## 3. Email Settings (Fixing the Login Error)
By default, Supabase waits for users to click an email confirmation link before logging them in. This blocks the flow for testing.

1. Go to **Authentication** → **Providers** → **Email**.
2. Toggle **OFF** the **"Confirm email"** switch.
3. Click **Save**.

---

## 4. GitHub Login (Optional, if you want it enabled)
If you want the "Continue with GitHub" button to work:

1. Go to **Authentication** → **Providers** → **GitHub**.
2. Toggle it **ON**.
3. Enter your **Client ID** and **Client Secret** (from your GitHub Developer settings).
4. Click **Save**.

---

## 5. Final Step: Start Fresh!
Because your current testing account is stuck in a half-created state from before we added the database fix, you need to clear it out:

1. Go to **Authentication** → **Users**.
2. Find your email, click the three dots (`...`) on the right, and select **Delete user**.
3. Go back to your website and **Sign up again**. 

Everything should flow perfectly now!
