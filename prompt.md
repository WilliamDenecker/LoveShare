# Build Prompt: Shared Couple's App

## Overview
Build a private, love-themed web app for two people (a couple) to share notes, tasks, a calendar, and memories together. Host on **Vercel**, use **Supabase** for database, auth, and file storage.

## Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage + Row Level Security)
- **Hosting:** Vercel
- **Calendar sync:** Android Calendar native integration (open shared events directly in the Android device calendar app, using native calendar deep links instead of external OAuth-based sync)

## Core Features

### 1. Authentication (2 users only)
- Supabase Auth with email/password login
- No public sign-up — only two pre-provisioned accounts (the couple)
- Simple, romantic-themed login screen with both partners' names/avatars
- Persistent session (stay logged in on trusted devices)

### 2. Shared Notes
- Notes visible to both partners in real time (Supabase Realtime subscriptions)
- Each note has: title, body, category, created/updated timestamp, author
- **Categories** (customizable, with color coding): e.g. Date Ideas, Groceries, Travel, Gifts, Memories, Household, Random Thoughts
- Filter/sort notes by category, date, or author
- Rich text or simple markdown support

### 3. Tasks within Notes
- Any note can contain checkable task items (like a checklist embedded in the note)
- Mark tasks complete/incomplete, with who completed it and when
- **On completion:** prompt to attach one or more photos (e.g. "completed a date idea" → upload proof/memory photo)
- Completed tasks with photos are viewable later — clicking a completed task opens its attached photos in a gallery/lightbox view
- Photos stored in Supabase Storage, linked to the task via a `task_photos` table

### 4. Shared Calendar
- Shared events visible to both partners
- Shared events open in the Android Calendar app on supported devices, with local calendar deep-link access for event times and reminders
- Events can be created in-app and linked to the Android calendar for quick viewing; no Google OAuth sync is required for the basic Android flow
- Color-code events by creator or category (date night, anniversary, reminder, etc.)

### 5. Month/Year Reviews ("Recap")
- Auto-generated recap view at end of each month and year
- Pulls together: completed tasks (with photos), calendar events from that period, and notes created
- Presented as a scrollable, visual "memory lane" page — think a love-themed photo recap/slideshow
- Should be shareable or exportable (e.g. as a downloadable image/PDF summary) — optional stretch goal

### 6. Design / Theme
- Warm, romantic aesthetic: soft pinks/reds/creams or a customizable couple's color palette
- Consider small personal touches: pet names, an "our story" landing detail, subtle animations (hearts, transitions)
- Mobile-first responsive design (this will mostly be used on phones)

## Database Schema (Supabase, high-level)
- `users` (via Supabase Auth, 2 rows)
- `notes` (id, author_id, title, body, category_id, created_at, updated_at)
- `categories` (id, name, color)
- `tasks` (id, note_id, description, is_complete, completed_by, completed_at)
- `task_photos` (id, task_id, storage_path, uploaded_at)
- `events` (id, creator_id, title, description, start_time, end_time, google_event_id, category)
- Row Level Security: only the two authenticated users can read/write any data (no public access)

## Deployment
- Repo on GitHub → connected to Vercel for CI/CD
- Environment variables for Supabase URL/anon key stored in Vercel project settings; Android calendar integration uses native device deep links rather than backend OAuth credentials
- Supabase Storage bucket for photos, with signed URLs or RLS-based access policies

## Deliverables
1. Fully functional Next.js app with the above features
2. Supabase schema + RLS policies (SQL migration files) + migration script 
3. Setup instructions for Vercel deployment and Google Calendar OAuth
4. Seed script to create the two user accounts and default categories