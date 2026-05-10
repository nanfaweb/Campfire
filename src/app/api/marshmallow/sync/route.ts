import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  console.log("--- 🔄 Sync Started ---");
  try {
    const adminSupabase = await createAdminClient();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in your .env file");
    }

    // 1. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Explicitly using the latest stable embedding model
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // 2. Find Gaps: Get existing IDs from Marshmallow
    const { data: indexedRows, error: indexError } = await adminSupabase
      .from('marshmallow_index')
      .select('source_id');

    if (indexError) throw indexError;

    const indexedIdSet = new Set(indexedRows?.map((row) => row.source_id) || []);

    // 3. Fetch Posts
    const { data: allPosts, error: fetchError } = await adminSupabase
      .from('posts')
      .select('id, content, author_id');

    if (fetchError) throw fetchError;

    const missingPosts = allPosts
      ?.filter(post => !indexedIdSet.has(post.id))
      .slice(0, 20) || [];
    
    if (missingPosts.length === 0) {
      console.log("✅ Nothing to sync.");
      return NextResponse.json({ message: "Everything is already synced! ✨" });
    }

    console.log(`📦 Processing ${missingPosts.length} posts...`);

    // 4. Generate Embeddings
    const syncResults = await Promise.all(missingPosts.map(async (post) => {
      const contentToEmbed = `Post by User ${post.author_id}: ${post.content}`;
      
      try {
        // Correct SDK method for embeddings
        const embedResult = await model.embedContent(contentToEmbed);
        const embedding = embedResult.embedding.values;

        return {
          content: contentToEmbed,
          embedding: embedding, // Ensure your DB column is vector(768)
          source_id: post.id,
          metadata: { 
            type: 'posts', 
            source_id: post.id, 
            author_id: post.author_id 
          }
        };
      } catch (err) {
        console.error(`Error embedding post ${post.id}:`, err);
        return null;
      }
    }));

    // Filter out any failed embeddings
    const validResults = syncResults.filter(r => r !== null);

    if (validResults.length === 0) {
        throw new Error("Failed to generate any embeddings.");
    }

    // 5. Upsert results
    const { error: upsertError } = await adminSupabase
      .from('marshmallow_index')
      .upsert(validResults, { onConflict: 'source_id' });

    if (upsertError) {
      console.error("❌ Upsert failed:", upsertError);
      throw upsertError;
    }

    console.log("🎉 Sync successful!");
    return NextResponse.json({ 
      success: true, 
      count: validResults.length 
    });

  } catch (err: any) {
    console.error("💥 Sync Route Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}