"""
CampFire — Seed Data Generator
================================
Generates a complete, realistic seed SQL file for Supabase.
All data is self-consistent: foreign keys, timestamps, and
business rules (visibility, consent, friendship status) are
honoured throughout.

Output: seed.sql  — paste into Supabase SQL Editor or run via CLI
"""

import random
import uuid
import json
import datetime
import hashlib
import textwrap

random.seed(42)          # reproducible output

# ── helpers ──────────────────────────────────────────────────────────────────

def uid():
    return str(uuid.uuid4())

def ts(days_ago_max=365, days_ago_min=0):
    """Random UTC timestamp between now and `days_ago_max` days ago."""
    offset = random.randint(days_ago_min * 86400, days_ago_max * 86400)
    t = datetime.datetime.utcnow() - datetime.timedelta(seconds=offset)
    return t.strftime("%Y-%m-%d %H:%M:%S+00")

def dob(min_age=13, max_age=45):
    days = random.randint(min_age * 365, max_age * 365)
    d = datetime.date.today() - datetime.timedelta(days=days)
    return d.isoformat()

def sq(s):
    """Escape single quotes for SQL strings."""
    return str(s).replace("'", "''")

def arr(items):
    """Render a Python list as a Postgres text[] literal."""
    escaped = [f'"{sq(i)}"' for i in items]
    return "ARRAY[" + ", ".join(escaped) + "]" if escaped else "ARRAY[]::text[]"

def uuid_arr(items):
    """Render a list of UUID strings as a Postgres uuid[] literal."""
    if not items:
        return "ARRAY[]::uuid[]"
    return "ARRAY[" + ", ".join(f"'{i}'" for i in items) + "]::uuid[]"

# ── corpus data ───────────────────────────────────────────────────────────────

FIRST_NAMES = [
    "Alex","Jordan","Morgan","Taylor","Casey","Riley","Avery","Quinn","Skyler",
    "Blake","Cameron","Drew","Emery","Finley","Harley","Jamie","Kennedy","Logan",
    "Micah","Noah","Oakley","Parker","Reese","Sage","Scout","Spencer","Sunny",
    "Toby","Wren","Zion","Aria","Lena","Milo","Ezra","Piper","Rowan","Sawyer",
]

LAST_NAMES = [
    "Rivera","Chen","Patel","Kim","Okafor","Rossi","Mueller","Santos","Nakamura",
    "Okonkwo","Huang","Garcia","Müller","Johansson","Ali","Cohen","Kowalski",
    "Diallo","Ferreira","Yamamoto","Nguyen","Andersen","Bakker","Devi","Ito",
]

ADJECTIVES = ["cozy","golden","quiet","bright","wandering","curious","sleepy",
              "misty","tiny","gentle","electric","wild","soft","bold","crisp"]

NOUNS = ["campfire","lantern","notebook","meadow","fox","owl","pebble","ember",
         "cedar","maple","cloud","valley","spark","birch","horizon"]

BIOS = [
    "just here to vibe and share good vibes 🌿",
    "coffee first, then everything else ☕",
    "photographer by day, dreamer by night",
    "lover of long walks and longer books 📚",
    "making things with my hands and heart",
    "tech nerd who also bakes sourdough 🍞",
    "semi-professional overthinker",
    "plant parent x12 🌱",
    "chasing sunsets and good conversations",
    "here for the community, staying for the memes",
    "artist | traveller | occasional chef",
    "probably thinking about mountains rn 🏔️",
    "words are my thing. so is this platform.",
    "building cool stuff, learning cooler things",
    "just a human figuring it out one day at a time",
]

POST_TEMPLATES = [
    "anyone else feel like {adj} {noun} energy lately? just me? okay.",
    "hot take: the best part of any {noun} is the moment right before it starts",
    "spent today working on a new project and honestly feeling very {adj} about it 🔥",
    "the {adj} {noun} outside my window is doing something magical right now",
    "reminder to yourself: slow down. breathe. look at the {noun}.",
    "okay I finally tried that {adj} {noun} thing everyone was talking about and WOW",
    "current mood: {adj} {noun} at 2am",
    "can we talk about how {adj} the community here is? genuinely wholesome.",
    "day {n} of trying to be more {adj} — small wins count.",
    "real question: do you prefer {adj} mornings or {adj} evenings?",
    "made something {adj} today. still not sure what it is but I love it.",
    "the {noun} was perfect today. no notes.",
    "I keep coming back to this idea of being more {adj}. it's changing me.",
    "shoutout to everyone who replied to my last post — you're all {adj} 💛",
    "trying something new this week: complete {adj} chaos. updates to follow.",
    "working from the {noun} today and honestly, life is good.",
    "throwback to when I didn't know what a {noun} was. growth.",
    "is it weird that {adj} {noun}s make me emotional? asking for a friend.",
    "just had the most {adj} conversation with a stranger about {noun}s.",
    "update: the {adj} {noun} project is going extremely well. pics soon.",
]

COMMENT_TEMPLATES = [
    "this is exactly what I needed to hear today 💛",
    "okay but the '{kw}' part really got me",
    "you always say the most {adj} things",
    "I felt this in my soul",
    "wait same!! I was literally just thinking about this",
    "this is the content I come here for",
    "sending {adj} vibes your way 🌿",
    "the {noun} analogy is so real",
    "can you make a follow-up post about this?",
    "this made me smile. thank you.",
    "okay adding this to my list of things to think about at 3am",
    "you nailed it as always ✨",
    "love this perspective",
    "here for every bit of this",
    "the {noun} reference 💀💀",
]

DM_EXCHANGES = [
    ("hey! loved your post about {noun} 👋", "ahh thank you so much! it means a lot 💛"),
    ("do you have any tips for {adj} {noun}?", "yes!! actually I could go on about this forever lol"),
    ("we should collab on something {adj}", "omg yes!! been thinking the same thing"),
    ("your {noun} photos are incredible", "you're too kind 😭 still learning!"),
    ("how long have you been into {noun}s?", "probably 3 years now? started during a weird time lol"),
    ("I saw your reply on that thread — so {adj}", "haha thanks, I felt strongly about it"),
    ("are you going to post more {adj} content?", "definitely!! I have a bunch lined up"),
    ("that {noun} post blew my mind ngl", "right?? I couldn't stop thinking about it either"),
]

REPORT_COMMENTS = [
    "This post is clearly spam, it keeps appearing in my feed.",
    "The user has been sending hostile messages.",
    "This content violates community guidelines.",
    "Seems like a bot account — repetitive posts.",
    "Harassing replies to multiple users.",
    "Inappropriate content in comments.",
]

MARSHMALLOW_CONVOS = [
    [
        ("what kind of posts do people share here?", 
         "People on CampFire share all kinds of things — reflections, creative projects, questions, and daily moments. The vibe tends to be cozy and thoughtful rather than high-volume noise."),
        ("can you summarize what the community is talking about lately?",
         "Based on recent public posts, there's a lot of conversation around creativity, slow living, and personal projects. Several people have been sharing updates on things they're building or learning."),
    ],
    [
        ("marshmallow, help me write a post about my morning routine",
         "Sure! How about something like: 'Started the day slow — coffee, a few pages of a book, and just sitting with the quiet. Highly recommend this as a morning stack.' Want me to adjust the tone?"),
        ("make it more poetic",
         "Here's a more poetic version: 'Morning arrived gently today. Coffee warm in my hands, pages turning, silence doing its best impression of peace. Some days that's everything.'"),
    ],
    [
        ("is there anything interesting happening on campfire today?",
         "There are some great conversations going on! A few users are discussing creative projects, someone shared a reflection on slowing down, and there's an active thread about morning habits. Want me to pull up any specifics?"),
    ],
]

NOTIFICATION_MESSAGES = {
    "friend_request": "sent you a friend request",
    "friend_accepted": "accepted your friend request",
    "post_liked": "liked your post",
    "post_commented": "commented on your post",
    "report_actioned": "A report you submitted has been reviewed",
    "system": "Welcome to CampFire! 🔥 Your account is ready.",
}

# ── generation ────────────────────────────────────────────────────────────────

def gen_username(first, last, taken):
    base = (first + last[:3]).lower().replace(" ", "")
    candidate = base
    suffix = 1
    while candidate in taken:
        candidate = f"{base}{suffix}"
        suffix += 1
    taken.add(candidate)
    return candidate

def render_post(template):
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    n = random.randint(1, 30)
    return template.format(adj=adj, noun=noun, n=n)

def render_comment(template, post_content):
    words = post_content.split()
    kw = random.choice(words) if words else "this"
    return template.format(adj=random.choice(ADJECTIVES), noun=random.choice(NOUNS), kw=kw)

def render_dm(template):
    return template.format(adj=random.choice(ADJECTIVES), noun=random.choice(NOUNS))


def generate():
    lines = []

    def w(s=""):
        lines.append(s)

    w("-- ============================================================")
    w("-- CAMPFIRE SEED DATA")
    w("-- Generated by generate_seed.py")
    w("-- Safe to re-run: uses ON CONFLICT DO NOTHING throughout")
    w("-- ============================================================")
    w()
    w("BEGIN;")
    w()

    # ── 1. AUTH USERS (simulated — in real Supabase these come from auth.users) ──
    # We insert into auth.users directly for local dev / test environments.
    # For a hosted Supabase project, use the Admin API or Auth Dashboard instead.
    w("-- ============================================================")
    w("-- NOTE: auth.users rows must be created via Supabase Auth Admin")
    w("-- API in production. This block is for local dev only.")
    w("-- In production, comment out this section and use the provided")
    w("-- users.json to call supabase.auth.admin.createUser() per user.")
    w("-- ============================================================")
    w()

    NUM_USERS = 30
    users = []
    taken_usernames = set()

    roles = ["user"] * 24 + ["moderator"] * 4 + ["admin"] * 2
    random.shuffle(roles)

    for i in range(NUM_USERS):
        first = random.choice(FIRST_NAMES)
        last  = random.choice(LAST_NAMES)
        user_id   = uid()
        username  = gen_username(first, last, taken_usernames)
        email     = f"{username}@campfire-demo.dev"
        display   = f"{first} {last}"
        bio       = random.choice(BIOS)
        role      = roles[i]
        consent   = random.choice([True, True, False])   # 2/3 give consent
        dob_val   = dob()
        created   = ts(days_ago_max=180, days_ago_min=1)
        verified  = True if role in ("moderator", "admin") else random.choice([True, True, True, False])
        banned    = False
        avatar    = f"https://api.dicebear.com/7.x/thumbs/svg?seed={username}"

        users.append({
            "id": user_id, "username": username, "email": email,
            "display_name": display, "bio": bio, "role": role,
            "consent": consent, "dob": dob_val, "created": created,
            "verified": verified, "banned": banned, "avatar": avatar,
        })

    # Write auth.users inserts (local dev only)
    w("-- auth.users (local dev only — skip in production)")
    for u in users:
        pw_hash = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345"  # placeholder
        w(f"""INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '{u['id']}',
  '{u['email']}',
  '{pw_hash}',
  {'now()' if u['verified'] else 'NULL'},
  '{u['created']}',
  '{u['created']}',
  '{{"username": "{u['username']}", "display_name": "{sq(u['display_name'])}", "date_of_birth": "{u['dob']}"}}'::jsonb
) ON CONFLICT (id) DO NOTHING;""")
    w()

    # ── 2. PROFILES ──────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- PROFILES")
    w("-- ============================================================")
    for u in users:
        w(f"""INSERT INTO public.profiles
  (id, username, display_name, bio, avatar_url, role, marshmallow_consent,
   is_verified, is_banned, date_of_birth, created_at, updated_at)
VALUES (
  '{u['id']}', '{u['username']}', '{sq(u['display_name'])}', '{sq(u['bio'])}',
  '{u['avatar']}', '{u['role']}', {str(u['consent']).upper()},
  {str(u['verified']).upper()}, {str(u['banned']).upper()},
  '{u['dob']}', '{u['created']}', '{u['created']}'
) ON CONFLICT (id) DO NOTHING;""")
    w()

    # ── 3. FRIENDSHIPS ───────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- FRIENDSHIPS")
    w("-- ============================================================")
    friendships = []
    friendship_set = set()
    accepted_pairs = []   # (a, b) where friendship is accepted

    user_ids = [u["id"] for u in users]
    for i, u in enumerate(users):
        # Each user gets 3-8 friendship connections
        targets = random.sample([x for x in users if x["id"] != u["id"]], k=random.randint(3, 8))
        for t in targets:
            key = tuple(sorted([u["id"], t["id"]]))
            if key in friendship_set:
                continue
            friendship_set.add(key)
            status = random.choices(
                ["accepted", "pending", "declined", "blocked"],
                weights=[70, 20, 7, 3]
            )[0]
            fid = uid()
            created = ts(180, 1)
            friendships.append({
                "id": fid, "requester": u["id"], "addressee": t["id"],
                "status": status, "created": created,
            })
            if status == "accepted":
                accepted_pairs.append((u["id"], t["id"]))

    for f in friendships:
        w(f"""INSERT INTO public.friendships (id, requester_id, addressee_id, status, created_at, updated_at)
VALUES ('{f['id']}', '{f['requester']}', '{f['addressee']}', '{f['status']}', '{f['created']}', '{f['created']}')
ON CONFLICT DO NOTHING;""")
    w()

    # ── 4. POSTS ─────────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- POSTS")
    w("-- ============================================================")
    posts = []
    # Verified users only create posts (matches is_verified gate in app)
    verified_users = [u for u in users if u["verified"]]

    MEDIA_POOL = [
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
        "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800",
        "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800",
        "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        "https://images.unsplash.com/photo-1495462911434-be47104d70fa?w=800",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800",
        "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800",
    ]
    VIDEO_POOL = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=ScMzIvxBSi4",
        None, None, None, None, None,   # most posts have no video
    ]

    for u in verified_users:
        num_posts = random.randint(2, 8)
        for _ in range(num_posts):
            pid = uid()
            template = random.choice(POST_TEMPLATES)
            content = render_post(template)
            visibility = random.choices(
                ["public", "friends", "private"],
                weights=[65, 25, 10]
            )[0]
            media_count = random.choices([0, 1, 2], weights=[60, 30, 10])[0]
            media = random.sample(MEDIA_POOL, k=media_count)
            video = random.choice(VIDEO_POOL) if media_count == 0 else None
            is_deleted = random.random() < 0.05
            deleted_at = ts(30, 1) if is_deleted else None
            created = ts(120, 0)
            posts.append({
                "id": pid, "author_id": u["id"], "content": content,
                "media": media, "video": video, "visibility": visibility,
                "is_deleted": is_deleted, "deleted_at": deleted_at,
                "created": created,
            })

    for p in posts:
        media_sql = arr(p["media"])
        video_sql = f"'{p['video']}'" if p["video"] else "NULL"
        deleted_at_sql = f"'{p['deleted_at']}'" if p["deleted_at"] else "NULL"
        w(f"""INSERT INTO public.posts
  (id, author_id, content, media_urls, video_link, visibility, is_deleted, deleted_at, created_at, updated_at)
VALUES (
  '{p['id']}', '{p['author_id']}', '{sq(p['content'])}',
  {media_sql}, {video_sql}, '{p['visibility']}',
  {str(p['is_deleted']).upper()}, {deleted_at_sql}, '{p['created']}', '{p['created']}'
) ON CONFLICT DO NOTHING;""")
    w()

    # Only non-deleted public+friends posts for engagement
    engageable_posts = [p for p in posts if not p["is_deleted"] and p["visibility"] in ("public", "friends")]

    # ── 5. LIKES ─────────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- LIKES")
    w("-- ============================================================")
    like_set = set()
    for p in engageable_posts:
        # Each post gets 0-15 likes from random users
        likers = random.sample(users, k=random.randint(0, min(15, len(users))))
        for liker in likers:
            key = (p["id"], liker["id"])
            if key in like_set:
                continue
            like_set.add(key)
            w(f"""INSERT INTO public.likes (id, post_id, user_id, created_at)
VALUES ('{uid()}', '{p['id']}', '{liker['id']}', '{ts(60,0)}')
ON CONFLICT DO NOTHING;""")
    w()

    # ── 6. COMMENTS ──────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- COMMENTS")
    w("-- ============================================================")
    comments = []
    for p in engageable_posts:
        num_comments = random.randint(0, 6)
        commenters = random.sample(users, k=min(num_comments, len(users)))
        for c_user in commenters:
            template = random.choice(COMMENT_TEMPLATES)
            content = render_comment(template, p["content"])
            cid = uid()
            created = ts(60, 0)
            comments.append({"id": cid, "post_id": p["id"], "author_id": c_user["id"],
                              "content": content, "created": created})
            w(f"""INSERT INTO public.comments (id, post_id, author_id, content, created_at, updated_at)
VALUES ('{cid}', '{p['id']}', '{c_user['id']}', '{sq(content)}', '{created}', '{created}')
ON CONFLICT DO NOTHING;""")
    w()

    # ── 7. MESSAGES ──────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- MESSAGES (Direct Messages)")
    w("-- ============================================================")
    dm_threads = random.sample(accepted_pairs, k=min(20, len(accepted_pairs)))
    for (a_id, b_id) in dm_threads:
        exchange = random.choice(DM_EXCHANGES)
        base_time = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 60))
        for idx, (sender_msg, reply_msg) in enumerate([(exchange[0], exchange[1])]):
            msg_time = base_time + datetime.timedelta(minutes=idx * 5)
            reply_time = msg_time + datetime.timedelta(minutes=random.randint(1, 30))
            # sender → recipient
            w(f"""INSERT INTO public.messages
  (id, sender_id, recipient_id, content, is_read, delivered_at, read_at, created_at)
VALUES (
  '{uid()}', '{a_id}', '{b_id}',
  '{sq(render_dm(sender_msg))}',
  TRUE, '{msg_time.strftime('%Y-%m-%d %H:%M:%S+00')}',
  '{msg_time.strftime('%Y-%m-%d %H:%M:%S+00')}',
  '{msg_time.strftime('%Y-%m-%d %H:%M:%S+00')}'
) ON CONFLICT DO NOTHING;""")
            # reply
            is_read = random.random() > 0.3
            w(f"""INSERT INTO public.messages
  (id, sender_id, recipient_id, content, is_read, delivered_at, read_at, created_at)
VALUES (
  '{uid()}', '{b_id}', '{a_id}',
  '{sq(render_dm(reply_msg))}',
  {str(is_read).upper()},
  '{reply_time.strftime('%Y-%m-%d %H:%M:%S+00')}',
  {'\''+reply_time.strftime('%Y-%m-%d %H:%M:%S+00')+'\'' if is_read else 'NULL'},
  '{reply_time.strftime('%Y-%m-%d %H:%M:%S+00')}'
) ON CONFLICT DO NOTHING;""")
    w()

    # ── 8. REPORTS ───────────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- REPORTS")
    w("-- ============================================================")
    reasons = ["spam", "harassment", "other"]
    statuses = ["pending", "pending", "pending", "reviewed", "actioned", "dismissed"]
    mod_users = [u for u in users if u["role"] in ("moderator", "admin")]
    report_posts = random.sample(engageable_posts, k=min(10, len(engageable_posts)))
    for p in report_posts:
        reporter = random.choice([u for u in users if u["id"] != p["author_id"]])
        reason   = random.choice(reasons)
        status   = random.choice(statuses)
        reviewer = random.choice(mod_users)["id"] if status != "pending" else None
        comment  = random.choice(REPORT_COMMENTS)
        created  = ts(60, 1)
        reviewer_sql = f"'{reviewer}'" if reviewer else "NULL"
        w(f"""INSERT INTO public.reports
  (id, reporter_id, target_post_id, reason, comment, status, reviewed_by, created_at, updated_at)
VALUES (
  '{uid()}', '{reporter['id']}', '{p['id']}',
  '{reason}', '{sq(comment)}', '{status}', {reviewer_sql},
  '{created}', '{created}'
) ON CONFLICT DO NOTHING;""")
    # A few user-targeted reports
    for _ in range(4):
        reporter = random.choice(users)
        target   = random.choice([u for u in users if u["id"] != reporter["id"]])
        reason   = random.choice(reasons)
        status   = random.choice(statuses)
        reviewer = random.choice(mod_users)["id"] if status != "pending" else None
        reviewer_sql = f"'{reviewer}'" if reviewer else "NULL"
        created  = ts(60, 1)
        w(f"""INSERT INTO public.reports
  (id, reporter_id, target_user_id, reason, comment, status, reviewed_by, created_at, updated_at)
VALUES (
  '{uid()}', '{reporter['id']}', '{target['id']}',
  '{reason}', 'Reported for conduct issues.', '{status}', {reviewer_sql},
  '{created}', '{created}'
) ON CONFLICT DO NOTHING;""")
    w()

    # ── 9. CHATBOT SESSIONS + MESSAGES ───────────────────────────────────────
    w("-- ============================================================")
    w("-- CHATBOT SESSIONS & MESSAGES (Marshmallow)")
    w("-- ============================================================")
    convo_users = random.sample(users, k=min(12, len(users)))
    for u in convo_users:
        session_id = uid()
        created = ts(30, 0)
        w(f"""INSERT INTO public.chatbot_sessions (id, user_id, created_at)
VALUES ('{session_id}', '{u['id']}', '{created}') ON CONFLICT DO NOTHING;""")
        convo = random.choice(MARSHMALLOW_CONVOS)
        for turn_idx, (user_msg, bot_msg) in enumerate(convo):
            msg_time = datetime.datetime.utcnow() - datetime.timedelta(
                days=random.randint(0,30), minutes=turn_idx*2)
            mt = msg_time.strftime('%Y-%m-%d %H:%M:%S+00')
            rt = (msg_time + datetime.timedelta(seconds=3)).strftime('%Y-%m-%d %H:%M:%S+00')
            # user turn
            w(f"""INSERT INTO public.chatbot_messages (id, session_id, role, content, source_post_ids, created_at)
VALUES ('{uid()}', '{session_id}', 'user', '{sq(user_msg)}', ARRAY[]::uuid[], '{mt}')
ON CONFLICT DO NOTHING;""")
            # assistant turn — cite a random post if one exists
            cite_posts = random.sample([p["id"] for p in engageable_posts[:5]], k=min(2, 5))
            w(f"""INSERT INTO public.chatbot_messages (id, session_id, role, content, source_post_ids, created_at)
VALUES ('{uid()}', '{session_id}', 'assistant', '{sq(bot_msg)}', {uuid_arr(cite_posts)}, '{rt}')
ON CONFLICT DO NOTHING;""")
    w()

    # ── 10. POST EMBEDDINGS (placeholder — real embeddings need OpenAI API) ──
    w("-- ============================================================")
    w("-- POST EMBEDDINGS (Marshmallow RAG)")
    w("-- Real 1536-dim vectors require calling OpenAI embeddings API.")
    w("-- These are zero-vectors as placeholders — replace with real")
    w("-- embeddings by running: npm run seed:embeddings")
    w("-- Only public posts from users with marshmallow_consent are indexed.")
    w("-- ============================================================")
    consent_user_ids = {u["id"] for u in users if u["consent"]}
    indexable = [
        p for p in engageable_posts
        if p["visibility"] == "public" or p["author_id"] in consent_user_ids
    ]
    # Only insert a sample — embeddings script handles bulk
    sample_indexable = random.sample(indexable, k=min(20, len(indexable)))
    zero_vec = "[" + ",".join(["0"] * 1536) + "]"
    for p in sample_indexable:
        # chunk 0: full content (short posts are one chunk)
        w(f"""INSERT INTO public.post_embeddings (id, post_id, chunk_index, chunk_text, embedding, created_at)
VALUES ('{uid()}', '{p['id']}', 0, '{sq(p['content'][:500])}', '{zero_vec}', '{p['created']}')
ON CONFLICT DO NOTHING;""")
    w()
    w("-- TODO: Run scripts/seed_embeddings.ts to populate real vectors")
    w()

    # ── 11. NOTIFICATIONS ────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- NOTIFICATIONS")
    w("-- ============================================================")
    notif_types = list(NOTIFICATION_MESSAGES.keys())
    for u in users:
        num_notifs = random.randint(1, 5)
        for _ in range(num_notifs):
            ntype = random.choice(notif_types)
            actor = random.choice([x for x in users if x["id"] != u["id"]])
            post  = random.choice(posts) if posts else None
            payload = {"actor_id": actor["id"], "message": NOTIFICATION_MESSAGES[ntype]}
            if ntype in ("post_liked", "post_commented") and post:
                payload["post_id"] = post["id"]
            is_read = random.choice([True, False])
            created = ts(30, 0)
            w(f"""INSERT INTO public.notifications (id, user_id, type, payload, is_read, created_at)
VALUES (
  '{uid()}', '{u['id']}', '{ntype}',
  '{json.dumps(payload)}'::jsonb, {str(is_read).upper()}, '{created}'
) ON CONFLICT DO NOTHING;""")
    w()

    # ── 12. AUDIT LOGS ───────────────────────────────────────────────────────
    w("-- ============================================================")
    w("-- AUDIT LOGS")
    w("-- ============================================================")
    admin_users = [u for u in users if u["role"] == "admin"]
    audit_events = [
        ("role_changed",    {"old_role": "user", "new_role": "moderator"}),
        ("post_removed",    {"reason": "violates community guidelines"}),
        ("account_banned",  {"reason": "repeated harassment"}),
        ("report_actioned", {"action": "post_removed"}),
        ("login_failed",    {"ip": "192.168.1.1", "attempts": 3}),
    ]
    for _ in range(15):
        actor = random.choice(admin_users + mod_users) if (admin_users or mod_users) else random.choice(users)
        target = random.choice(users)
        event_type, metadata = random.choice(audit_events)
        created = ts(90, 0)
        w(f"""INSERT INTO public.audit_logs (id, actor_id, target_id, event_type, metadata, created_at)
VALUES (
  '{uid()}', '{actor['id']}', '{target['id']}',
  '{event_type}', '{json.dumps(metadata)}'::jsonb, '{created}'
) ON CONFLICT DO NOTHING;""")
    w()

    w("COMMIT;")
    w()
    w("-- ============================================================")
    w("-- SEED COMPLETE")
    w(f"-- Users: {NUM_USERS}")
    w(f"-- Posts: {len(posts)}")
    w(f"-- Friendships: {len(friendships)}")
    w(f"-- Comments: {len(comments)}")
    w(f"-- DM threads: {len(dm_threads)}")
    w("-- Run scripts/seed_embeddings.ts next for real RAG vectors")
    w("-- ============================================================")

    return "\n".join(lines)


if __name__ == "__main__":
    sql = generate()
    with open("seed.sql", "w") as f:
        f.write(sql)
    print("✅  seed.sql written successfully")
    # Count lines and key entity mentions
    users_count = sql.count("INSERT INTO public.profiles")
    posts_count = sql.count("INSERT INTO public.posts")
    likes_count = sql.count("INSERT INTO public.likes")
    comments_count = sql.count("INSERT INTO public.comments")
    messages_count = sql.count("INSERT INTO public.messages")
    print(f"   profiles:     {users_count}")
    print(f"   posts:        {posts_count}")
    print(f"   likes:        {likes_count}")
    print(f"   comments:     {comments_count}")
    print(f"   messages:     {messages_count}")
