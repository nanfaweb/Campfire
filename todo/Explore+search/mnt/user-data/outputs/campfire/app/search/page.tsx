"use client";

import { useState } from "next/dist/compiled/react";

const people = [
  {
    username: "Haru_Spark",
    bio: "Digital Alchemist",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEJaK-W1zoGHdZRogGRdYRbuuEP5Vk4DSiK-idFtkeJ8u3wJBNDIHnWm8ECuHACxucZKP7uely_B8up5vBcEEVvyHltbT-pOq0mJerhj4zBcwHK31-LL_I3AeNaOzaZFCn8SP2lp6bFpNvqlTIuWta6jZWSp9KtqtZZMrQJkbJMhjQfeWWzLVg6gL9UOTMvZcWFf95flPJeiXZNR6J_M1PJM6PiUIOjjtoNJqBPtfyrS89_1orgVAhCmQLC63RncAMHD-G6kKe6_ZN",
    followed: false,
  },
  {
    username: "Komorebi_Ink",
    bio: "Manga Enthusiast",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFIjpvEZWCdiYnMiEpHpNZV5dBVqnLUYOlGOEJ5U3fWbB9MkQc6li8Y6ACKyvgknDkB7w1GmShaUwY92FSL5ShM9x63YSUNjlZbEcA1P_2_J3Bkp8qxeqn2ulwtkrD8-oLMyJCA2vlWwrtRbQ9X29h258n7XpPACcpo3itSnDXzGBERIW5bbj1t4xMF-enYtSnELS9oXCeNx43l8XS1KIys2tuHhQEEc56zANuAk_6n9yCC7SNARuVDNpGI7HpVv161Q7Zw6kd-QlT",
    followed: true,
  },
  {
    username: "Yuna.Sketch",
    bio: "UI Explorer",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL5ysAno1jwCX7FGW76qD7k3qhQO8JNPEbpRLxQFlhv4hAubp4b4yWC-kIYo_P3JhfrKeU6tdTWo0NUvuRrqpf6VI7SRDKAfZbprBDbGZUb7qydVfArlrD_3n7uXXHDOwWl0iYGl9VAIEbDpZNBohvCZo45pL9-VfxZNrLC0pffrFRw8L_4Pa0pPR816Khx4wQfgA8U7xhLEyCicqLAYc1k9MBQW4bbN5PJpl4ekQZjelo1876HKYLPhch8avJn3iraV9C4BhJJ5tL",
    followed: false,
  },
];

const posts = [
  {
    id: 1,
    username: "Aria_Design",
    initial: "A",
    title: "Morning Rituals: Finding the Spark",
    excerpt:
      "Exploring the intersections of tranquility and digital creation in our latest campfire session...",
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0ujmSwf0-Ai0k60yN2fRyRWg5P6mlPQ1dC1hTQztM44_rNKr3xQKUCjiMEJxfCw0DZ28SSh_rZmOhbxGdv6RzE_Y1an4vCx0vn8YstJ_W5biXvRIG0fi-2KaNBv037mDkn9eQv_57VqpTixe0MO_oycV4S3gKd1M3ZJmi7UFyxlAwbNCBd7Es3OWd8gVyr3XatVpOh7MM6dAx1hUfzCoPpbuMdpX2m7QfcWExFV4mKfkUhPnkHsusCNMb5lOqnPn5Jf0Ce9RxCLN0Q",
    comments: 24,
    shares: 12,
  },
  {
    id: 2,
    username: "Miso_Cooks",
    initial: "M",
    title: "Soulful Spaces for Deep Work",
    excerpt:
      "How environment shapes our creative output and mental wellness in the digital age...",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcZ17GxEVDdswxWxn2orIKJFWr4SSiVjeYPLpDApvmfJJZdyLB77r1oObeHlV1CadvaSwaucw_DenU0Z3oqMuLiHugg5Rl7ksxUaaWbzraBZs5VQxEulnK2lPZhuo87tnrDf8mXUYDzvu0OpXAZUA8ZGTeM2lX42M6ZkIghdhPRQZrb1smeHgYqKPyNcm_MPm5XwsOp78twZso_nqm6QM1inNstp66R6Ji6WXCXlJ0CndEhIZzHjnHMuG_SAzDPRLrRudjY_q51uo7",
    comments: 156,
    shares: 89,
  },
];

export default function SearchPage() {
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(people.map((p) => [p.username, p.followed]))
  );
  const [activeFilter, setActiveFilter] = useState<"trending" | "recent">(
    "trending"
  );

  const toggleFollow = (username: string) => {
    setFollowState((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  return (
    <>
      {/* Search Hero */}
      <section className="max-w-2xl mx-auto mb-12">
        <h1
          className="text-[40px] font-black text-[#802a00] mb-8 text-center leading-tight"
          style={{ fontFamily: "Space Grotesk", letterSpacing: "-0.02em" }}
        >
          Find Your Tribe
        </h1>
        <div className="relative group">
          <div className="gradient-border-soft gradient-border-focus rounded-2xl golden-hour-shadow transition-all duration-300">
            <div className="flex items-center px-6 py-4">
              <span className="material-symbols-outlined text-[#ff6b2b] mr-4">
                search
              </span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-lg text-[#58423a] placeholder-stone-400 outline-none"
                placeholder="Search sparks, creators, or topics..."
                type="text"
                style={{ fontFamily: "Be Vietnam Pro" }}
              />
              <span
                className="material-symbols-outlined text-[#ff6b2b] ml-4"
                style={{ animation: "pulse 2s infinite" }}
              >
                auto_awesome
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* People Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2
              className="text-2xl font-bold text-[#802a00]"
              style={{ fontFamily: "Space Grotesk" }}
            >
              People
            </h2>
            <a
              href="#"
              className="text-xs font-bold uppercase tracking-widest text-[#ff6b2b] hover:underline"
            >
              View All
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person) => (
              <div
                key={person.username}
                className="gradient-border-soft golden-hour-shadow p-5 rounded-2xl flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-[#ffdbce]">
                  <img
                    src={person.avatar}
                    alt={person.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  className="font-bold text-base text-[#231a11] mb-1"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {person.username}
                </h3>
                <p className="text-base text-[#58423a] mb-4">{person.bio}</p>
                {followState[person.username] ? (
                  <button
                    onClick={() => toggleFollow(person.username)}
                    className="w-full bg-[#a83900] text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#b50675] transition-all"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => toggleFollow(person.username)}
                    className="w-full border border-[#802a00] text-[#802a00] py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#ffdbce] transition-all"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Posts Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2
              className="text-2xl font-bold text-[#802a00]"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Posts
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter("trending")}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeFilter === "trending"
                    ? "bg-[#ffdbce] text-[#802a00]"
                    : "bg-[#fdebdc] text-[#58423a] hover:bg-[#ffdbce]"
                }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveFilter("recent")}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeFilter === "recent"
                    ? "bg-[#ffdbce] text-[#802a00]"
                    : "bg-[#fdebdc] text-[#58423a] hover:bg-[#ffdbce]"
                }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                Recent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="gradient-border-soft golden-hour-shadow rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full">
                    <span
                      className="material-symbols-outlined text-white"
                      style={{
                        fontVariationSettings:
                          "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      favorite
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#ffdbce] flex items-center justify-center">
                      <span className="text-[#802a00] font-bold text-xs">
                        {post.initial}
                      </span>
                    </div>
                    <span
                      className="font-bold text-base text-[#231a11]"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {post.username}
                    </span>
                  </div>
                  <h4
                    className="font-bold text-lg text-[#802a00] mb-2"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {post.title}
                  </h4>
                  <p className="text-base text-[#58423a] line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-stone-400">
                    <span className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-sm">
                        chat_bubble
                      </span>{" "}
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-sm">
                        share
                      </span>{" "}
                      {post.shares}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
