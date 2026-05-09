import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, session_id } = body;

    if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    // 1. Generate embedding for the user prompt using Gemini text-embedding-004
    let queryEmbedding: number[] = [];
    try {
      const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: prompt }] },
          }),
        }
      );
      if (embedRes.ok) {
        const embedData = await embedRes.json();
        queryEmbedding = embedData.embedding.values;
      }
    } catch (e) {
      console.error("[marshmallow] embedding error:", e);
    }

    // 2. Perform RAG query for posts
    let ragContext = "";
    let sourcePostIds: string[] = [];

    if (queryEmbedding.length > 0) {
      const { data: matches, error: rpcError } = await adminSupabase.rpc(
        "match_post_embeddings",
        {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.5,
          match_count: 5,
          requesting_user: user.id
        }
      );

      if (!rpcError && matches && matches.length > 0) {
        const contextLines = matches.map((m: any) => `- [@${m.author_username}]: ${m.chunk_text}`);
        ragContext += "\n\nRelevant posts from you and your friends (Vector Search):\n" + contextLines.join("\n");
        sourcePostIds = matches.map((m: any) => m.post_id);
      } else if (rpcError) {
        console.error("[marshmallow] RPC error:", rpcError);
      }
    }

    // 2.1 Fallback: Fetch recent posts directly if RAG was empty or skipped
    if (!ragContext) {
      // First, get friend IDs to replicate the home feed
      const { data: friendships } = await adminSupabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const friendIds = (friendships ?? []).map((f: any) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      const authorIds = [user.id, ...friendIds];

      const { data: recentPosts } = await adminSupabase
        .from("posts")
        .select("content, author:profiles!author_id(username), created_at")
        .eq("is_deleted", false)
        .in("author_id", authorIds)
        .order("created_at", { ascending: false })
        .limit(10); // More posts for better context

      if (recentPosts && recentPosts.length > 0) {
        const fallbackLines = recentPosts.map((p: any) => `- [@${p.author.username}]: ${p.content}`);
        ragContext += "\n\nRecent posts from you and your friends (Direct Fetch):\n" + fallbackLines.join("\n");
      }
    }

    console.log("[marshmallow] Context length:", ragContext.length);
    if (ragContext) console.log("[marshmallow] RAG Context:", ragContext);

    // 3. Fetch recent messages for additional context
    const { data: recentMessages } = await adminSupabase
      .from("messages")
      .select("sender_id, recipient_id, content, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentMessages && recentMessages.length > 0) {
      const msgContext = recentMessages
        .reverse()
        .map((m: any) => `${m.sender_id === user.id ? "You" : "Them"}: ${m.content}`)
        .join("\n");
      ragContext += "\n\nRecent conversation snippets:\n" + msgContext;
    }

    // 3. Persist user message
    await supabase.from("chatbot_messages").insert({
      session_id,
      role: "user",
      content: prompt,
      source_post_ids: [],
    });

    // 4. Ask Gemini
    const systemInstruction = `You are Marshmallow, a warm and playful AI buddy on the CampFire social network. You speak with warmth, use 1-2 emojis per response, and keep replies under 4 sentences unless the user asks for more detail. Be encouraging, creative, and cozy. If relevant posts are provided in the context, refer to them naturally to help the user.${ragContext}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text();
      console.error("[marshmallow] Gemini API error:", geminiRes.status, errorBody);
      return NextResponse.json({ error: "AI service error", details: errorBody }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "✨ My spark fizzled for a moment.";

    // 5. Persist AI message with source citations
    await supabase.from("chatbot_messages").insert({
      session_id,
      role: "assistant",
      content: reply,
      source_post_ids: sourcePostIds,
    });

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    console.error("[marshmallow] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
