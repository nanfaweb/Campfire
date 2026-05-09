-- ============================================================
-- CAMPFIRE — COMPLETE DATABASE SCHEMA
-- Migration: 20240001000000_initial_schema.sql
-- ANALYSIS ONLY
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists vector with schema extensions;


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type public.user_role       as enum ('user', 'moderator', 'admin');
create type public.post_visibility as enum ('public', 'friends', 'private');
create type public.friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');
create type public.report_reason   as enum ('spam', 'harassment', 'other');
create type public.report_status   as enum ('pending', 'reviewed', 'actioned', 'dismissed');
create type public.message_role    as enum ('user', 'assistant');


-- ============================================================
-- 2. PROFILES
-- Extends auth.users (one row per authenticated user).
-- ============================================================

create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  username             text not null unique,
  display_name         text not null default '',
  bio                  text not null default '',
  avatar_url           text,
  role                 public.user_role not null default 'user',
  marshmallow_consent  boolean not null default false,   -- consent for RAG on private posts
  is_verified          boolean not null default false,   -- email verification gate
  is_banned            boolean not null default false,
  date_of_birth        date not null,                    -- age ≥ 13 enforced in app layer
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'date_of_birth')::date, current_date - interval '13 years')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 3. POSTS
-- ============================================================

create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  content      text not null default '',
  media_urls   text[] not null default '{}',        -- Supabase Storage URLs
  video_link   text,                                -- external embed URL
  visibility   public.post_visibility not null default 'public',
  is_deleted   boolean not null default false,      -- soft delete; hard-purge after 30 days
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint content_or_media check (
    char_length(content) > 0 or array_length(media_urls, 1) > 0 or video_link is not null
  )
);

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

create index idx_posts_author_id    on public.posts(author_id);
create index idx_posts_visibility   on public.posts(visibility);
create index idx_posts_created_at   on public.posts(created_at desc);
create index idx_posts_not_deleted  on public.posts(is_deleted) where is_deleted = false;

-- RLS
alter table public.posts enable row level security;

-- Helper: is the viewer friends with the author?
create or replace function public.are_friends(user_a uuid, user_b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = user_a and addressee_id = user_b)
        or (requester_id = user_b and addressee_id = user_a))
  );
$$;

create policy "Posts: public visibility readable by all"
  on public.posts for select
  using (
    is_deleted = false
    and (
      visibility = 'public'
      or author_id = auth.uid()
      or (visibility = 'friends' and public.are_friends(author_id, auth.uid()))
    )
  );

create policy "Posts: authors can insert"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Posts: authors can update their own"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Posts: authors can soft-delete their own"
  on public.posts for delete
  using (auth.uid() = author_id);


-- ============================================================
-- 4. COMMENTS
-- ============================================================

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint comment_not_empty check (char_length(content) > 0)
);

create trigger comments_updated_at
  before update on public.comments
  for each row execute procedure public.set_updated_at();

create index idx_comments_post_id on public.comments(post_id);

alter table public.comments enable row level security;

create policy "Comments readable if post is readable"
  on public.comments for select
  using (
    is_deleted = false
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.is_deleted = false
        and (
          p.visibility = 'public'
          or p.author_id = auth.uid()
          or (p.visibility = 'friends' and public.are_friends(p.author_id, auth.uid()))
        )
    )
  );

create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their own comments"
  on public.comments for update
  using (auth.uid() = author_id);


-- ============================================================
-- 5. LIKES
-- ============================================================

create table public.likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique(post_id, user_id)
);

create index idx_likes_post_id on public.likes(post_id);

alter table public.likes enable row level security;

create policy "Likes visible to all"
  on public.likes for select using (true);

create policy "Users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike their own"
  on public.likes for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 6. FRIENDSHIPS
-- ============================================================

create table public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       public.friendship_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique(requester_id, addressee_id),
  constraint no_self_friend check (requester_id <> addressee_id)
);

create trigger friendships_updated_at
  before update on public.friendships
  for each row execute procedure public.set_updated_at();

create index idx_friendships_requester on public.friendships(requester_id);
create index idx_friendships_addressee on public.friendships(addressee_id);
create index idx_friendships_status    on public.friendships(status);

alter table public.friendships enable row level security;

create policy "Users see their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Addressee can update (accept/decline)"
  on public.friendships for update
  using (auth.uid() = addressee_id or auth.uid() = requester_id);

create policy "Users can delete their own friendships"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);


-- ============================================================
-- 7. MESSAGES
-- ============================================================

create table public.messages (
  id             uuid primary key default gen_random_uuid(),
  sender_id      uuid not null references public.profiles(id) on delete cascade,
  recipient_id   uuid not null references public.profiles(id) on delete cascade,
  content        text not null default '',
  attachment_url text,
  is_read        boolean not null default false,
  delivered_at   timestamptz,
  read_at        timestamptz,
  created_at     timestamptz not null default now(),

  constraint message_has_content check (
    char_length(content) > 0 or attachment_url is not null
  ),
  constraint no_self_message check (sender_id <> recipient_id)
);

create index idx_messages_sender    on public.messages(sender_id);
create index idx_messages_recipient on public.messages(recipient_id);
create index idx_messages_thread    on public.messages(
  least(sender_id, recipient_id),
  greatest(sender_id, recipient_id),
  created_at desc
);

alter table public.messages enable row level security;

create policy "Participants can read their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipient can mark as read"
  on public.messages for update
  using (auth.uid() = recipient_id);


-- ============================================================
-- 8. REPORTS
-- ============================================================

create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  target_post_id   uuid references public.posts(id) on delete set null,
  target_user_id   uuid references public.profiles(id) on delete set null,
  reason           public.report_reason not null,
  comment          text not null default '',
  status           public.report_status not null default 'pending',
  reviewed_by      uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint report_has_target check (
    target_post_id is not null or target_user_id is not null
  )
);

create trigger reports_updated_at
  before update on public.reports
  for each row execute procedure public.set_updated_at();

create index idx_reports_status     on public.reports(status);
create index idx_reports_reporter   on public.reports(reporter_id);
create index idx_reports_created_at on public.reports(created_at desc);

alter table public.reports enable row level security;

create policy "Reporters can see their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Moderators and admins can see all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

create policy "Authenticated users can file reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Moderators and admins can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
  );


-- ============================================================
-- 9. CHATBOT SESSIONS
-- ============================================================

create table public.chatbot_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_chatbot_sessions_user on public.chatbot_sessions(user_id);

alter table public.chatbot_sessions enable row level security;

create policy "Users can manage their own sessions"
  on public.chatbot_sessions for all
  using (auth.uid() = user_id);


-- ============================================================
-- 10. CHATBOT MESSAGES
-- ============================================================

create table public.chatbot_messages (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.chatbot_sessions(id) on delete cascade,
  role            public.message_role not null,
  content         text not null,
  source_post_ids uuid[] not null default '{}',   -- citation post IDs
  created_at      timestamptz not null default now()
);

create index idx_chatbot_messages_session on public.chatbot_messages(session_id, created_at);

alter table public.chatbot_messages enable row level security;

create policy "Users can access messages in their own sessions"
  on public.chatbot_messages for all
  using (
    exists (
      select 1 from public.chatbot_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );


-- ============================================================
-- 11. POST EMBEDDINGS  (pgvector RAG store)
-- ============================================================

create table public.post_embeddings (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  chunk_index integer not null default 0,       -- which chunk within the post
  chunk_text  text not null,
  embedding   vector(1536),                     -- OpenAI text-embedding-3-small dimensions
  created_at  timestamptz not null default now(),

  unique(post_id, chunk_index)
);

-- HNSW index for cosine similarity — best accuracy at CampFire's scale
create index idx_post_embeddings_hnsw
  on public.post_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index idx_post_embeddings_post_id on public.post_embeddings(post_id);

-- RLS: only index PUBLIC posts, or posts the user owns with consent granted.
-- Retrieval is done server-side (service role), so RLS here is a safety net.
alter table public.post_embeddings enable row level security;

create policy "Embeddings: service role only for write"
  on public.post_embeddings for insert
  with check (false);   -- inserts only via service role in server functions

create policy "Embeddings: readable via server for RAG"
  on public.post_embeddings for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.is_deleted = false
        and (
          p.visibility = 'public'
          or (p.author_id = auth.uid())
        )
    )
  );


-- ============================================================
-- 12. RAG SIMILARITY SEARCH FUNCTION
-- Called by LangChain's SupabaseVectorStore retriever.
-- Enforces consent: only returns private-post chunks if
-- the querying user owns the post AND has marshmallow_consent.
-- ============================================================

create or replace function public.match_post_embeddings(
  query_embedding vector(1536),
  match_count     int     default 5,
  match_threshold float   default 0.7,
  requesting_user uuid    default null
)
returns table (
  id          uuid,
  post_id     uuid,
  chunk_text  text,
  similarity  float,
  post_author uuid,
  visibility  public.post_visibility
)
language sql stable security definer as $$
  select
    pe.id,
    pe.post_id,
    pe.chunk_text,
    1 - (pe.embedding <=> query_embedding) as similarity,
    p.author_id as post_author,
    p.visibility
  from public.post_embeddings pe
  join public.posts p on p.id = pe.post_id
  join public.profiles pr on pr.id = p.author_id
  where
    p.is_deleted = false
    and (
      -- Always include public posts
      p.visibility = 'public'
      -- Include requester's own private posts only if they granted consent
      or (
        p.author_id = requesting_user
        and pr.marshmallow_consent = true
      )
    )
    and 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;


-- ============================================================
-- 13. NOTIFICATIONS (lightweight, in-app only)
-- ============================================================

create type public.notification_type as enum (
  'friend_request',
  'friend_accepted',
  'post_liked',
  'post_commented',
  'report_actioned',
  'system'
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null,
  payload     jsonb not null default '{}',    -- flexible: { actor_id, post_id, message, ... }
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_unread
  on public.notifications(user_id, created_at desc)
  where is_read = false;

alter table public.notifications enable row level security;

create policy "Users see their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);


-- ============================================================
-- 14. AUDIT LOG (login failures, bans, moderator actions)
-- ============================================================

create type public.audit_event_type as enum (
  'login_failed',
  'account_locked',
  'account_banned',
  'post_removed',
  'user_warned',
  'report_actioned',
  'role_changed',
  'data_deleted'
);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  target_id   uuid,                               -- user/post ID that was acted on
  event_type  public.audit_event_type not null,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_actor      on public.audit_logs(actor_id);
create index idx_audit_logs_target     on public.audit_logs(target_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- Audit logs are write-only from application layer; only admins can read
alter table public.audit_logs enable row level security;

create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role inserts only"
  on public.audit_logs for insert
  with check (false);   -- inserts via service role in server functions only


-- ============================================================
-- 15. SOFT-DELETE CLEANUP (30-day purge)
-- Schedule this as a Supabase pg_cron job or Edge Function cron.
-- ============================================================

create or replace function public.purge_deleted_posts()
returns void language sql security definer as $$
  delete from public.posts
  where is_deleted = true
    and deleted_at < now() - interval '30 days';
$$;

-- To schedule with pg_cron (enable pg_cron extension first):
-- select cron.schedule('purge-deleted-posts', '0 3 * * *', 'select public.purge_deleted_posts()');