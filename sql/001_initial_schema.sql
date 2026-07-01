create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#ef4444'
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  title text not null,
  body text,
  category_id uuid references categories(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  description text not null,
  is_complete boolean default false,
  completed_by uuid,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  storage_path text not null,
  uploaded_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  google_event_id text,
  category text
);

alter table notes enable row level security;
alter table categories enable row level security;
alter table tasks enable row level security;
alter table task_photos enable row level security;
alter table events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_select_all') then
    create policy notes_select_all on notes for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_insert_all') then
    create policy notes_insert_all on notes for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_update_all') then
    create policy notes_update_all on notes for update using (auth.uid() is not null) with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_delete_all') then
    create policy notes_delete_all on notes for delete using (auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_select_all') then
    create policy categories_select_all on categories for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_insert_all') then
    create policy categories_insert_all on categories for insert with check (auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_select_all') then
    create policy tasks_select_all on tasks for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_insert_all') then
    create policy tasks_insert_all on tasks for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_update_all') then
    create policy tasks_update_all on tasks for update using (auth.uid() is not null) with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_delete_all') then
    create policy tasks_delete_all on tasks for delete using (auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_photos' and policyname = 'task_photos_select_all') then
    create policy task_photos_select_all on task_photos for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_photos' and policyname = 'task_photos_insert_all') then
    create policy task_photos_insert_all on task_photos for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_photos' and policyname = 'task_photos_delete_all') then
    create policy task_photos_delete_all on task_photos for delete using (auth.uid() is not null);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_select_all') then
    create policy events_select_all on events for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_insert_all') then
    create policy events_insert_all on events for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_update_all') then
    create policy events_update_all on events for update using (auth.uid() is not null) with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_delete_all') then
    create policy events_delete_all on events for delete using (auth.uid() is not null);
  end if;
end $$;
