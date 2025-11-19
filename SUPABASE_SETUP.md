# Supabase Setup Guide

This guide explains how to set up Supabase authentication for PrisimAI.

## Prerequisites

You need a Supabase account. If you don't have one:
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## Getting Your Supabase Credentials

1. **Log in to your Supabase dashboard**: [https://app.supabase.com](https://app.supabase.com)
2. **Select your project** (or create a new one)
3. **Navigate to Settings** → **API** in the sidebar
4. **Copy the following values**:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **Project API Key (anon/public)**: This is your `VITE_SUPABASE_ANON_KEY`

## Setting Up Environment Variables

### For Local Development

1. **Create a `.env` file** in the root directory of the project (same level as `package.json`)

2. **Add your Supabase credentials** to the `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. **Replace the placeholder values** with your actual credentials from the Supabase dashboard

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.example_key_here
```

### For Production/Deployment

If you're deploying to a hosting platform (Vercel, Netlify, etc.), add these environment variables in your hosting platform's dashboard:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment Variables
- **Other platforms**: Check their documentation for environment variable configuration

Add the same two variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Notes

⚠️ **Important Security Information**:

- The `.env` file is already included in `.gitignore` and **should NEVER be committed** to version control
- The `VITE_SUPABASE_ANON_KEY` is a public key that's safe to expose in your frontend code (it's restricted by Row Level Security policies)
- Never share your Supabase **service role key** - this is different from the anon key and should only be used server-side
- Always use Row Level Security (RLS) policies in Supabase to protect your data

## Configuring Supabase Authentication

### Enable Authentication Providers

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable the authentication methods you want to use:
   - **Email/Password** (recommended for basic setup)
   - **Magic Link** (passwordless email login)
   - **OAuth providers** (Google, GitHub, etc.)

### Setting Up GitHub OAuth

To enable GitHub sign-in:

1. **Create a GitHub OAuth App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **OAuth Apps** → **New OAuth App**
   - Fill in the application details:
     - **Application name**: PrisimAI (or your preferred name)
     - **Homepage URL**: `http://localhost:5000` (for development) or your production URL
     - **Authorization callback URL**: Get this from your Supabase dashboard (see next step)
   - Click **Register application**
   - Copy the **Client ID**
   - Click **Generate a new client secret** and copy the **Client Secret**

2. **Configure GitHub Provider in Supabase**:
   - Go to your Supabase dashboard → **Authentication** → **Providers**
   - Find **GitHub** in the list and click to expand
   - Toggle **Enable Sign in with GitHub** to ON
   - Copy the **Callback URL (for OAuth)** - this is what you'll use in step 1 above
   - Paste your GitHub **Client ID** and **Client Secret**
   - Click **Save**

3. **Update GitHub OAuth App callback URL**:
   - Go back to your GitHub OAuth App settings
   - Update the **Authorization callback URL** with the URL from Supabase (format: `https://your-project.supabase.co/auth/v1/callback`)
   - Click **Update application**

**For Production (GitHub Pages):**
- Create a separate GitHub OAuth App for production
- Use your production URL as the Homepage URL (e.g., `https://prisimai.github.io/PrisimAI/`)
  - **Important**: Include the `/PrisimAI/` base path if deploying to GitHub Pages
- Use the production Supabase callback URL
- The app automatically handles the base path configured in `vite.config.ts`

### Email Templates (Optional)

You can customize the email templates for:
- Confirmation emails
- Password reset emails
- Magic link emails

Go to **Authentication** → **Email Templates** in your Supabase dashboard.

### Authentication Settings

Recommended settings for development:
1. **Disable email confirmations** during development (Authentication → Settings → Email Auth → Enable email confirmations: OFF)
2. **Re-enable** email confirmations in production for security

## Database Setup (Optional)

If you want to store additional user data beyond what Supabase Auth provides:

1. Go to **Table Editor** in your Supabase dashboard
2. Create a `profiles` table with the following schema:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create a policy that allows users to read their own profile
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

-- Create a policy that allows users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

## Testing Your Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:5173`)

3. **Try signing up** with a test email address

4. **Check the Supabase dashboard** → **Authentication** → **Users** to see if the user was created

## Troubleshooting

### "Invalid API credentials" error
- Double-check that you copied the correct URL and anon key from your Supabase dashboard
- Make sure there are no extra spaces in your `.env` file
- Restart your development server after creating/modifying the `.env` file

### Users can't sign up
- Check that email authentication is enabled in Supabase dashboard
- If using email confirmations, check the user's email inbox (and spam folder)
- Check the browser console for detailed error messages

### Environment variables not loading
- Make sure your `.env` file is in the root directory
- Variable names must start with `VITE_` to be accessible in Vite applications
- Restart the development server after changing `.env`

### OAuth redirect errors (React error #310 or similar)
- This can happen if the OAuth redirect URL doesn't match your app's deployment path
- The app automatically handles the base path from `vite.config.ts` (`/PrisimAI/` for GitHub Pages)
- For local development, this should work without changes
- For production, ensure your GitHub OAuth App's Homepage URL includes the base path (e.g., `https://prisimai.github.io/PrisimAI/`)
- After OAuth login, users should be redirected to the correct app URL with the base path

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
