import { createClient } from "@/utils/supabase/client";

function formatTimestamp(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

/**
 * Reusable ingestion logic for the Marshmallow Local RAG
 */
export async function ingestToLocal(text: string, type: string, userId: string, sourceId: string, updatedAt?: string) {
  if (!text || !userId || !sourceId) return false;

  // Use a composite key for caching (sourceId + updatedAt for edits)
  const cacheKey = updatedAt ? `${sourceId}-${updatedAt}` : sourceId;
  const storageKey = `marshmallow_synced_${userId}`;
  
  // Check local cache
  const cached = localStorage.getItem(storageKey);
  const syncedSet = new Set(cached ? JSON.parse(cached) : []);
  
  if (syncedSet.has(cacheKey)) return true;

  // Use content's own timestamp if available, otherwise fall back to current time
  const date = updatedAt ? new Date(updatedAt) : new Date();
  const timestamp = formatTimestamp(date);

  try {
    const res = await fetch("http://localhost:8000/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({
        text,
        metadata: {
          source: "marshmellow",
          type: type, 
          user_id: userId,
          source_id: sourceId,
          updated_at: updatedAt,
          timestamp
        }
      })
    });
    
    if (res.ok) {
      syncedSet.add(cacheKey);
      localStorage.setItem(storageKey, JSON.stringify(Array.from(syncedSet)));
      return true;
    }
    return false;
  } catch (e) {
    console.warn("[marshmallow-sync] Local brain ingest failed (offline?)");
    return false;
  }
}

/**
 * Reusable deletion logic for the Marshmallow Local RAG
 */
export async function deleteFromLocal(id: string, userId: string) {
  try {
    const res = await fetch("http://localhost:8000/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ id })
    });
    return res.ok;
  } catch (e) {
    // Silently fail if route doesn't exist or offline
    return false;
  }
}
