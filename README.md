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
4. Enable the Storage bucket and use the built-in Android calendar integration for shared events.

## Android Calendar integration
1. On Android devices, the app opens the native calendar app using a calendar deep link.
2. Use the “Open Android Calendar” action from the shared calendar view to jump straight to the event time in the device calendar.
3. No extra OAuth setup is required for the native Android calendar flow.
