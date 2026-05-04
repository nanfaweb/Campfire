import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
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

    // 2. Perform RAG query using the Supabase RPC
    let ragContext = "";
    let sourcePostIds: string[] = [];

    if (queryEmbedding.length > 0) {
      // The RPC signature expects vector as string or array
      const { data: matches, error: rpcError } = await supabase.rpc(
        "match_post_embeddings",
        {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.6,
          match_count: 5,
        }
      );

      if (!rpcError && matches && matches.length > 0) {
        const contextLines = matches.map((m: any) => `- ${m.chunk_text}`);
        ragContext = "\n\nRelevant CampFire posts from you or your friends:\n" + contextLines.join("\n");
        sourcePostIds = matches.map((m: any) => m.post_id);
      }
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
        }),
      }
    );

    if (!geminiRes.ok) {
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
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
