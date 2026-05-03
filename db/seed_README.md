# CampFire — Seed Data Package

Complete dataset to make CampFire fully functional and interactive from day one.

---

## What's included

| File | Purpose |
|---|---|
| `seed.sql` | Main SQL seed — all tables except embeddings |
| `seed_embeddings.ts` | Generates real OpenAI vectors for Marshmallow RAG |
| `seed_auth_users.ts` | Creates Auth users via Supabase Admin API (production) |
| `users.json` | User list for production auth seeding |
| `generate_seed.py` | Regenerate `seed.sql` with a fresh random dataset |

---

## Dataset at a glance

| Entity | Count | Notes |
|---|---|---|
| Users | 30 | 24 users, 4 moderators, 2 admins |
| Posts | ~126 | Public / friends / private mix |
| Friendships | ~150 | Accepted, pending, declined, blocked |
| Likes | ~785 | Distributed realistically |
| Comments | ~302 | Per-post comment threads |
| DMs | ~40 | Accepted-friend pairs only |
| Reports | 14 | Post and user reports, mixed statuses |
| Chatbot sessions | 12 | With multi-turn conversation history |
| Notifications | ~90 | All types, read and unread |
| Audit logs | 15 | Admin/moderator actions |
| Embeddings | 20 (placeholder) | Zero-vectors; replace with `seed_embeddings.ts` |

---

## Step-by-step: Local Development

### 1. Apply the schema first
Paste `../supabase/migrations/20240001000000_initial_schema.sql` into
Supabase SQL Editor and run it before seeding.

### 2. Run the seed SQL
```
# Option A: Supabase SQL Editor
# Paste seed.sql and click Run

# Option B: Supabase CLI
supabase db push
psql $DATABASE_URL < seed.sql
```

> The `auth.users` block at the top works for **local Supabase** (`supabase start`).
> For a **hosted project**, skip that block and use Step 3 below.

### 3. Seed Auth users (hosted Supabase only)
```bash
cp ../.env.local .env.local
npm install
npx tsx seed_auth_users.ts
```
Then re-run `seed.sql` with the `auth.users` block commented out.

### 4. Seed Marshmallow embeddings (real RAG)
```bash
npx tsx seed_embeddings.ts
```
This calls OpenAI's `text-embedding-3-small` model.
Cost estimate: ~$0.002 for the full seed dataset (negligible).

---

## Demo credentials

All seed users share the same password: **`CampFire2024!`**

Find a specific role to log in with:

```sql
SELECT email, role FROM public.profiles
ORDER BY role DESC LIMIT 10;
```

Or use these fixed demo accounts (generated reproducibly):

| Role | Email pattern |
|---|---|
| admin | Any profile where `role = 'admin'` |
| moderator | Any profile where `role = 'moderator'` |
| user | Any other profile |

---

## Regenerating the seed

```bash
python3 generate_seed.py
```

Change `random.seed(42)` to any other integer for a different dataset.

---

## Data design decisions

### Consistency rules enforced
- Messages only exist between users with `friendship.status = 'accepted'`
- Reports reference real post and user IDs from the seed
- Chatbot citations reference real post IDs
- Post embeddings only cover public posts + consent-granted private posts
- Deleted posts have `deleted_at` set; `is_deleted = true`
- Moderator/admin users are always `is_verified = true`
- Users with unverified email (`is_verified = false`) have no posts

### Placeholder embeddings
`seed.sql` inserts zero-vectors (`[0,0,...,0]`) for 20 posts.
These satisfy FK constraints but won't return meaningful RAG results.
Run `seed_embeddings.ts` to replace them with real OpenAI vectors.
The HNSW index will auto-update on upsert.

### Avatar URLs
Uses [DiceBear Thumbs](https://www.dicebear.com/) with username as seed —
deterministic, free, no signup required.

### Media URLs
Uses Unsplash source URLs — these work without an API key for demo purposes.
Replace with Supabase Storage URLs in production.
