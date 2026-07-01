# LoveShare

A private shared couple app built with Next.js, Supabase, and Vercel.

## Features included
- Shared notes with tasks
- Shared calendar overview
- Recap dashboard
- Supabase auth-ready structure

## Local setup
1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add your values.
3. Run the migration in [sql/001_initial_schema.sql](sql/001_initial_schema.sql).
4. Seed the two accounts with `npm run seed`.
5. Start the app with `npm run dev`.

## Vercel deployment
1. Push this repo to GitHub.
2. Create a Vercel project and link the repository.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Enable the Storage bucket and configure Google Calendar OAuth credentials.

## Google Calendar OAuth
1. Create OAuth client credentials in Google Cloud Console.
2. Add authorized redirect URI for your app: `https://YOUR_APP.vercel.app/auth/callback`.
3. Store the client ID and secret in Vercel environment variables.
