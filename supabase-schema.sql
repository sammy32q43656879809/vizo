-- =============================================
-- VIZO - Full Supabase Schema
-- Run this in Supabase → SQL Editor
-- =============================================

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  subscribers integer default 0,
  created_at timestamptz default now()
);

-- VIDEOS
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  username text,
  title text not null,
  description text,
  category text default 'Other',
  video_url text,
  thumbnail_url text,
  is_reel boolean default false,
  views integer default 0,
  likes integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now()
);

-- COMMENTS
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references videos on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  content text not null,
  created_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  subscriber_id uuid references auth.users on delete cascade not null,
  channel_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  unique(subscriber_id, channel_id)
);

-- CONVERSATIONS (DMs)
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references auth.users on delete cascade not null,
  user1_email text,
  user1_name text,
  user2_id uuid references auth.users on delete cascade not null,
  user2_email text,
  user2_name text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- DIRECT MESSAGES
create table if not exists direct_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  sender_name text,
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table profiles enable row level security;
alter table videos enable row level security;
alter table comments enable row level security;
alter table subscriptions enable row level security;
alter table conversations enable row level security;
alter table direct_messages enable row level security;

-- PROFILES
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- VIDEOS
create policy "videos_select" on videos for select using (true);
create policy "videos_insert" on videos for insert with check (auth.uid() = user_id);
create policy "videos_update" on videos for update using (true);
create policy "videos_delete" on videos for delete using (auth.uid() = user_id);

-- COMMENTS
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- SUBSCRIPTIONS
create policy "subs_select" on subscriptions for select using (true);
create policy "subs_insert" on subscriptions for insert with check (auth.uid() = subscriber_id);
create policy "subs_delete" on subscriptions for delete using (auth.uid() = subscriber_id);

-- CONVERSATIONS
create policy "convos_select" on conversations for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "convos_insert" on conversations for insert with check (auth.uid() = user1_id);
create policy "convos_update" on conversations for update using (auth.uid() = user1_id or auth.uid() = user2_id);

-- DIRECT MESSAGES
create policy "dm_select" on direct_messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id and (c.user1_id = auth.uid() or c.user2_id = auth.uid()))
);
create policy "dm_insert" on direct_messages for insert with check (auth.uid() = sender_id);

-- =============================================
-- STORAGE BUCKET
-- =============================================

insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict do nothing;

create policy "videos_storage_select" on storage.objects for select using (bucket_id = 'videos');
create policy "videos_storage_insert" on storage.objects for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');
create policy "videos_storage_delete" on storage.objects for delete using (bucket_id = 'videos');

-- =============================================
-- REALTIME (for DMs)
-- =============================================

alter publication supabase_realtime add table direct_messages;
alter publication supabase_realtime add table conversations;
