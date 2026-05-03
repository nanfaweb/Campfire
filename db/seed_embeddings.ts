/**
 * CampFire — Marshmallow RAG Embeddings Seeder
 * =============================================
 * Fetches all eligible posts from Supabase, chunks them, generates
 * Google Gemini embeddings (text-embedding-004, 768 dims), and
 * upserts into post_embeddings.
 *
 * Usage:
 *   npx tsx seed_embeddings.ts
 *
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY    ← must be service role, not anon key
 *   GEMINI_API_KEY               ← free at aistudio.google.com
 *
 * Install dependencies:
 *   npm install @supabase/supabase-js @google/generative-ai dotenv tsx
 *
 * Gemini free tier limits (as of 2025):
 *   - text-embedding-004: 1,500 requests/day, 100 requests/minute
 *   - This script batches with delays to stay within limits
 *
 * Cost: $0.00 on free tier for any seed dataset under 1,500 posts.
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY      = process.env.GEMINI_API_KEY!;

// Gemini text-embedding-004 produces 768-dimensional vectors.
// This MUST match the vector(768) column in post_embeddings.
const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_DIMS  = 768;

const CHUNK_SIZE      = 400;   // characters per chunk
const CHUNK_OVERLAP   = 50;    // overlap between chunks
const BATCH_SIZE      = 20;    // chunks per Gemini API call (max 100 for batch)
const BATCH_DELAY_MS  = 700;   // delay between batches (~85 req/min, under 100 limit)
const UPSERT_BATCH    = 50;    // rows per Supabase upsert call

// ── clients ───────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI    = new GoogleGenerativeAI(GEMINI_API_KEY);
const embedder = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

// ── helpers ───────────────────────────────────────────────────────────────────

function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  if (text.length <= CHUNK_SIZE) return [text.trim()];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 10) chunks.push(chunk);
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Embed a batch of text strings using Gemini text-embedding-004.
 * Uses "RETRIEVAL_DOCUMENT" task type for indexing (better retrieval quality).
 * Returns null entries for any failed items so the batch continues.
 */
async function embedBatch(texts: string[]): Promise<(number[] | null)[]> {
  try {
    const requests = texts.map((text) => ({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT" as const,
    }));

    const result = await embedder.batchEmbedContents({ requests });
    return result.embeddings.map((e) => e.values ?? null);
  } catch (err: any) {
    // Rate limit hit — wait and retry once
    if (err?.status === 429) {
      console.warn("\n⏳  Rate limit hit. Waiting 60s before retry...");
      await sleep(60_000);
      try {
        const requests = texts.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType: "RETRIEVAL_DOCUMENT" as const,
        }));
        const result = await embedder.batchEmbedContents({ requests });
        return result.embeddings.map((e) => e.values ?? null);
      } catch (retryErr: any) {
        console.error("\n❌  Retry failed:", retryErr.message);
        return texts.map(() => null);
      }
    }
    console.error("\n❌  Gemini embed error:", err.message);
    return texts.map(() => null);
  }
}

/**
 * Embed a single query string using RETRIEVAL_QUERY task type.
 * Use this in your RAG chat endpoint, not during seeding.
 * Exported so it can be imported by the chat API route.
 */
export async function embedQuery(queryText: string): Promise<number[]> {
  const result = await embedder.embedContent({
    content: { parts: [{ text: queryText }] },
    taskType: "RETRIEVAL_QUERY",
  });
  if (!result.embedding?.values) {
    throw new Error("Gemini returned empty embedding for query");
  }
  return result.embedding.values;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🔥 CampFire — Marshmallow Embedding Seeder (Gemini)");
  console.log("====================================================");
  console.log(`Model : ${EMBEDDING_MODEL} (${EMBEDDING_DIMS} dims)`);
  console.log();

  // Guard: check all required env vars up front
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL",  SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_KEY],
    ["GEMINI_API_KEY",            GEMINI_API_KEY],
  ].filter(([, val]) => !val).map(([key]) => key);

  if (missing.length > 0) {
    console.error("❌  Missing required env vars:", missing.join(", "));
    console.error("    Add them to .env.local and try again.");
    process.exit(1);
  }

  // ── 1. Fetch eligible posts ─────────────────────────────────────────────────
  // Eligible = public posts OR posts by users who granted marshmallow_consent
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
    console.error("    Ensure SUPABASE_SERVICE_ROLE_KEY is the service role key, not anon.");
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log("ℹ️   No eligible posts found. Run seed.sql first, then re-run this script.");
    return;
  }

  console.log(`📄  Eligible posts: ${posts.length}`);

  // ── 2. Chunk all posts ──────────────────────────────────────────────────────
  type ChunkRecord = {
    post_id:     string;
    chunk_index: number;
    chunk_text:  string;
    embedding?:  number[];
  };

  const allChunks: ChunkRecord[] = [];
  for (const post of posts) {
    const chunks = chunkText(post.content ?? "");
    chunks.forEach((text, idx) => {
      allChunks.push({ post_id: post.id, chunk_index: idx, chunk_text: text });
    });
  }

  console.log(`✂️   Total chunks: ${allChunks.length}`);
  console.log();

  // ── 3. Embed in batches ─────────────────────────────────────────────────────
  let embedded = 0;
  let failed   = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch  = allChunks.slice(i, i + BATCH_SIZE);
    const texts  = batch.map((c) => c.chunk_text);
    const vecs   = await embedBatch(texts);

    vecs.forEach((vec, idx) => {
      if (vec) {
        // Sanity check dimension
        if (vec.length !== EMBEDDING_DIMS) {
          console.error(
            `\n❌  Unexpected embedding dimension: got ${vec.length}, expected ${EMBEDDING_DIMS}.` +
            `\n    Check that EMBEDDING_MODEL="${EMBEDDING_MODEL}" is correct.`
          );
          process.exit(1);
        }
        batch[idx].embedding = vec;
        embedded++;
      } else {
        failed++;
      }
    });

    const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
    process.stdout.write(`\r⚡  Embedding chunks... ${i + batch.length}/${allChunks.length} (${pct}%)`);

    if (i + BATCH_SIZE < allChunks.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log("\n");

  if (failed > 0) {
    console.warn(`⚠️   ${failed} chunks failed to embed and will be skipped.`);
  }

  // ── 4. Upsert into post_embeddings ─────────────────────────────────────────
  const toInsert = allChunks.filter((c) => c.embedding);
  console.log(`💾  Upserting ${toInsert.length} embeddings into Supabase...`);

  let upserted = 0;
  let upsertErrors = 0;

  for (let i = 0; i < toInsert.length; i += UPSERT_BATCH) {
    const batch = toInsert.slice(i, i + UPSERT_BATCH);
    const rows  = batch.map((c) => ({
      post_id:     c.post_id,
      chunk_index: c.chunk_index,
      chunk_text:  c.chunk_text,
      // pgvector accepts a JSON array string or native array
      embedding:   JSON.stringify(c.embedding),
    }));

    const { error } = await supabase
      .from("post_embeddings")
      .upsert(rows, { onConflict: "post_id,chunk_index" });

    if (error) {
      console.error(`\n❌  Upsert error (batch ${i}):`, error.message);
      upsertErrors++;
    } else {
      upserted += batch.length;
    }

    process.stdout.write(`\r✅  Upserted ${upserted}/${toInsert.length}`);
  }

  console.log("\n");

  // ── 5. Final summary ────────────────────────────────────────────────────────
  console.log("════════════════════════════════════════");
  console.log("🎉  Embedding seeding complete!");
  console.log(`    Posts processed  : ${posts.length}`);
  console.log(`    Chunks created   : ${allChunks.length}`);
  console.log(`    Chunks embedded  : ${embedded}`);
  console.log(`    Chunks failed    : ${failed}`);
  console.log(`    Rows upserted    : ${upserted}`);
  console.log(`    Upsert errors    : ${upsertErrors}`);
  console.log();
  console.log("Marshmallow is now RAG-ready with Gemini embeddings. 🍡");
  console.log();

  if (failed > 0 || upsertErrors > 0) {
    console.log("⚠️   Some chunks were not embedded. Re-run this script to retry.");
    console.log("    Upsert is idempotent — already-embedded chunks will be skipped.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
