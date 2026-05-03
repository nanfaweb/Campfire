/**
 * CampFire — Marshmallow RAG Embeddings Seeder
 * =============================================
 * Fetches all eligible posts from Supabase (public posts + consented
 * private posts), chunks them, generates OpenAI embeddings, and
 * upserts into post_embeddings.
 *
 * Usage:
 *   npx tsx seed_embeddings.ts
 *
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY    ← must be service role, not anon
 *   OPENAI_API_KEY
 *
 * Dependencies:
 *   npm install @supabase/supabase-js openai dotenv tsx
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dimensions
const CHUNK_SIZE = 400;       // characters per chunk
const CHUNK_OVERLAP = 50;     // overlap to preserve context at boundaries
const BATCH_SIZE = 20;        // posts per OpenAI batch call
const MATCH_DELAY_MS = 200;   // polite delay between batches

// ── clients ───────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ── chunker ───────────────────────────────────────────────────────────────────

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 10);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🔥 CampFire — Marshmallow Embedding Seeder");
  console.log("-------------------------------------------");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
    console.error("❌  Missing env vars. Check .env.local");
    process.exit(1);
  }

  // 1. Fetch eligible posts
  //    = public posts  OR  posts by users who gave marshmallow_consent
  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      author_id,
      visibility,
      created_at,
      profiles!inner ( marshmallow_consent )
    `)
    .eq("is_deleted", false)
    .or("visibility.eq.public,profiles.marshmallow_consent.eq.true");

  if (postsErr) {
    console.error("❌  Failed to fetch posts:", postsErr.message);
    process.exit(1);
  }

  console.log(`📄  Found ${posts?.length ?? 0} eligible posts`);

  if (!posts || posts.length === 0) {
    console.log("Nothing to embed. Exiting.");
    return;
  }

  // 2. Build chunk records
  type ChunkRecord = {
    post_id: string;
    chunk_index: number;
    chunk_text: string;
    embedding?: number[];
  };

  const allChunks: ChunkRecord[] = [];
  for (const post of posts) {
    const chunks = chunkText(post.content ?? "");
    chunks.forEach((text, idx) => {
      allChunks.push({ post_id: post.id, chunk_index: idx, chunk_text: text });
    });
  }

  console.log(`✂️   Total chunks to embed: ${allChunks.length}`);

  // 3. Embed in batches
  let embedded = 0;
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.chunk_text);

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      });

      response.data.forEach((item, idx) => {
        batch[idx].embedding = item.embedding;
      });

      embedded += batch.length;
      process.stdout.write(`\r⚡  Embedded ${embedded}/${allChunks.length} chunks`);
    } catch (err: any) {
      console.error(`\n❌  OpenAI error on batch ${i}:`, err.message);
      // continue with remaining batches
    }

    if (i + BATCH_SIZE < allChunks.length) {
      await new Promise((r) => setTimeout(r, MATCH_DELAY_MS));
    }
  }

  console.log("\n");

  // 4. Upsert into post_embeddings
  const toInsert = allChunks.filter((c) => c.embedding);
  console.log(`💾  Upserting ${toInsert.length} embeddings into Supabase...`);

  const UPSERT_BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < toInsert.length; i += UPSERT_BATCH) {
    const batch = toInsert.slice(i, i + UPSERT_BATCH);
    const rows = batch.map((c) => ({
      post_id: c.post_id,
      chunk_index: c.chunk_index,
      chunk_text: c.chunk_text,
      embedding: JSON.stringify(c.embedding), // pgvector accepts JSON array string
    }));

    const { error } = await supabase
      .from("post_embeddings")
      .upsert(rows, { onConflict: "post_id,chunk_index" });

    if (error) {
      console.error(`\n❌  Upsert error at batch ${i}:`, error.message);
    } else {
      upserted += batch.length;
      process.stdout.write(`\r✅  Upserted ${upserted}/${toInsert.length}`);
    }
  }

  console.log("\n");
  console.log("🎉  Embedding seeding complete!");
  console.log(`    Posts processed : ${posts.length}`);
  console.log(`    Chunks embedded : ${embedded}`);
  console.log(`    Rows upserted   : ${upserted}`);
  console.log("\nMarshmallow is now RAG-ready. 🍡");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
