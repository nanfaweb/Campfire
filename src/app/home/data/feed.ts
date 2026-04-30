// ── CampFire feed data ───────────────────────────────────────────────────────

export interface Author {
  username: string;
  avatarUrl: string;
  badge: string;
}

export interface Post {
  id: number;
  author: Author;
  location: string;
  timestamp: string;
  type: "image" | "quote";
  imageUrl?: string;
  imageAlt?: string;
  quote?: string;
  body: string;
  likes: number;
  comments: number;
}

export interface Story {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface Suggestion {
  id: number;
  username: string;
  avatarUrl: string;
  reason: string;
}

export interface CurrentUser {
  name: string;
  username: string;
  avatarUrl: string;
  location: string;
}

export interface FeedData {
  currentUser: CurrentUser;
  stories: Story[];
  posts: Post[];
  suggestions: Suggestion[];
}

const FEED_DATA: FeedData = {
  currentUser: {
    name: "Afnan",
    username: "afnan.creates",
    avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=afnan",
    location: "Lahore, PK",
  },
  stories: [
    {
      id: 1,
      username: "luna.drifts",
      avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=luna",
    },
    {
      id: 2,
      username: "rooftop.ryu",
      avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ryu",
    },
    {
      id: 3,
      username: "chai.wanders",
      avatarUrl:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=chaiwander",
    },
    {
      id: 4,
      username: "pixel.sakura",
      avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sakura",
    },
    {
      id: 5,
      username: "neon.nomad",
      avatarUrl:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=neonnomad",
    },
  ],
  posts: [
    {
      id: 1,
      author: {
        username: "golden.hour.hana",
        avatarUrl:
          "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=hana",
        badge: "✨",
      },
      location: "Kyoto, Japan",
      timestamp: "2h ago",
      type: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
      imageAlt: "Golden light filtering through a bamboo grove in Kyoto",
      body: "Found a hidden bamboo path behind the temple. The late-afternoon light turned everything gold — stayed until the lanterns came on. 🎋🌅",
      likes: 342,
      comments: 27,
    },
    {
      id: 2,
      author: {
        username: "espresso.atlas",
        avatarUrl:
          "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=atlas",
        badge: "☕",
      },
      location: "Lisbon, Portugal",
      timestamp: "4h ago",
      type: "quote",
      quote:
        "Not all who wander are lost — some are just looking for better coffee.",
      body: "Third café today. Zero regrets. The pastel de nata here hits different when the ocean is right there. 🌊☕",
      likes: 518,
      comments: 63,
    },
    {
      id: 3,
      author: {
        username: "velvet.vinyl",
        avatarUrl:
          "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=velvet",
        badge: "🎵",
      },
      location: "Brooklyn, NY",
      timestamp: "6h ago",
      type: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      imageAlt: "Vinyl records and warm studio lighting",
      body: "Spent the morning digging through crates at that spot on Atlantic Ave. Found a mint Coltrane pressing for $8. The universe provides. 🎷✨",
      likes: 189,
      comments: 31,
    },
    {
      id: 4,
      author: {
        username: "midnight.sketch",
        avatarUrl:
          "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sketch",
        badge: "🎨",
      },
      location: "Studio Loft",
      timestamp: "9h ago",
      type: "quote",
      quote:
        "Creativity is just connecting things — the trick is staying curious long enough to find the dots.",
      body: "3 AM brain-dump turned into my best piece this year. Never underestimate what happens when you stop trying to be perfect. 🖤🔥",
      likes: 704,
      comments: 88,
    },
  ],
  suggestions: [
    {
      id: 1,
      username: "matcha.miles",
      avatarUrl:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=matcha",
      reason: "Followed by golden.hour.hana",
    },
    {
      id: 2,
      username: "analog.ayla",
      avatarUrl:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ayla",
      reason: "Popular this week",
    },
    {
      id: 3,
      username: "sourdough.saga",
      avatarUrl:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sourdough",
      reason: "New to CampFire",
    },
  ],
};

export default FEED_DATA;
