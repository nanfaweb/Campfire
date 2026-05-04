// ── Marshmallow AI API Route ─────────────────────────────────────────────────
// Proxies chat requests to Gemini, keeping API key server-side.
// Also persists messages to the chatbot_messages table.

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const { prompt, session_id } = body;

    if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
      return NextResponse.json(
        { error: "Invalid or missing prompt (max 2000 chars)" },
        { status: 400 }
      );
    }

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // 3. Persist the user message
    const { error: userMsgErr } = await supabase
      .from("chatbot_messages")
      .insert({
        session_id,
        role: "user",
        content: prompt,
        source_post_ids: [],
      });

    if (userMsgErr) {
      console.error("[marshmallow] user msg insert error:", userMsgErr.message);
      // Non-blocking — continue to get AI response
    }

    // 4. Call Gemini API (server-side only — key never reaches the browser)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Marshmallow, a warm and playful AI buddy on CampFire social network. You speak with warmth, use 1-2 emojis per response, and keep replies under 4 sentences unless the user asks for more detail. Be encouraging, creative, and cozy.\n\nUser: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.8,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[marshmallow] Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "✨ My spark fizzled for a moment. Try again?";

    // 5. Persist the AI response
    const { error: aiMsgErr } = await supabase
      .from("chatbot_messages")
      .insert({
        session_id,
        role: "assistant",
        content: reply,
        source_post_ids: [],
      });

    if (aiMsgErr) {
      console.error("[marshmallow] AI msg insert error:", aiMsgErr.message);
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    console.error("[marshmallow] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
