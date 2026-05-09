// ── CampFire Database Types ──────────────────────────────────────────────────
// Mirrors the Supabase schema. Used across server queries & client components.

export type UserRole = "user" | "moderator" | "admin";
export type PostVisibility = "public" | "friends" | "private";
export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";
export type MessageRole = "user" | "assistant";
export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "post_liked"
  | "post_commented"
  | "report_actioned"
  | "system";

// ── Profiles ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  role: UserRole;
  marshmallow_consent: boolean;
  is_public_profile: boolean;
  is_verified: boolean;
  is_banned: boolean;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  video_link: string | null;
  visibility: PostVisibility;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Post with joined relations for feed display */
export interface FeedPost extends Post {
  author: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  user_has_saved: boolean;
}

// ── Comments ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

// ── Likes ────────────────────────────────────────────────────────────────────

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ── Friendships ──────────────────────────────────────────────────────────────

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

// ── Messages (DM) ────────────────────────────────────────────────────────────

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url: string | null;
  is_read: boolean;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

/** A conversation thread preview for the message list sidebar */
export interface ConversationPreview {
  participant: Profile;
  last_message: DirectMessage;
  unread_count: number;
}

// ── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  // Resolved from payload.actor_id
  actor?: Profile;
}

// ── Chatbot ──────────────────────────────────────────────────────────────────

export interface ChatbotSession {
  id: string;
  user_id: string;
  created_at: string;
}

export interface ChatbotMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  source_post_ids: string[];
  created_at: string;
}

// ── Stories ──────────────────────────────────────────────────────────────────

export interface Story {
  id: string;
  author_id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  author?: Profile;
}

// ── Friend suggestion (computed) ─────────────────────────────────────────────

export interface FriendSuggestion {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  is_public_profile: boolean;
  initial_status?: "accepted" | "pending" | "none";
  mutual_count?: number;
}
