"use client";

import React, { useState } from "react";

const recommendedUsers = [
  {
    username: "Haru_Sketch",
    role: "LO-FI ILLUSTRATOR",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBWvvFvfM2ZrIokWMbfgyFnEtA25h9iU190K8P9eLXdE-OlwSbYJTyVHh5aO9Kx9Fy9ZFjOarrE0TQK1Nw02yNIKE3csqdRGk5qNDoPbeixUH-ZORTdVCE7nMC9280Icouq6wRfsEFk6gG6R3DWYeQZK3QegN1Oltp6VNW2AuCAlMqUkFCM21yfb2QCV8ThVOQ9q4CTp5mm4WNo5ub3XYDFkq8pidYwNLmfhPK1MuxMOXmUmBEMlpNYObGFer5zeOSVtvYggHE3L5e6",
    following: false,
  },
  {
    username: "Kaito_Music",
    role: "AMBIENT PRODUCER",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxSpPcp1yWMdtZcfW3ayn6Q-1H3DZqvy7YLmmyMV-RTyzJkF4uhLq_u08TuXCtxSIeK-onaSTItIhhKQrFJzKJ_M--afKk0sefGx7WVJoEu1pWQAZvBSuEn5FypB9XvSj-rfNQ6hRJkfcxkzj0nE55_aYSHkNwSDp2cRVglXXV2YeIylLmXyLeXLszU6imJUEDM7YK4Ul49h75tnbgoYa6_xme8R24u6Monq71X7DlFlEjUrf9x3NK2i2oFQr4RjWJFTQjpM7H2eZN",
    following: true,
  },
  {
    username: "Yuna_Pixels",
    role: "DIGITAL BOTANIST",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIfNnTo4Emye-ZVKtUeVZXnRorZx9MCtju8LEeq_GlcFoZw5QF_f9hvXaWLhfmeIMGXqEyMvF-yrFeZqPiKxf84XOG2TcQORoBzupmTYqTN8EWx1aKgicswmQE5tpDVuZ7O801PJFU2FtZypAd9Kx4WTtbyXlKXhC-NzNoWdoO2iDHWsJXnb2sVYPyYGH1BiztZoKYPgJ2qeXO8un8Hb7B-QuuyZhNQK9DMTB5pBbZ-UnL1DFX4rf65ctKPROmp3TXyMe-xT-zFci0",
    following: false,
  },
];

const posts = [
  {
    id: 1,
    username: "Mina_Chan",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACrUQ5UJM9bHdgMqtmY2v9wG0ep7Hb9plpnTdyEEBDy6888dbogEtlzfU-dqpSdFpRbV-oCSUJnutUnB9buhA6PJH-0gfAK1WF4pvP7cQvhAViyeaqYIxvT_TrxLjib9Fr4ngJ-ruZPTjj8htFy4oB4xj5QRahqhJQ-MODMNRNM5T1zCiA9VOiX9Ox1U2Ae3z3SvqgNsjUnhqVtW39yvaY-BMiBrr9JcsEEbWFqsfec3golISowXp6oFAnKPOAheK8tkfl-n8lwhID",
    timeAgo: "2h ago",
    text: "Morning sketching session with some fresh coffee. Feeling that cozy vibe today! ☕️✨",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDejduOSaIQ0lfHkEm88rRMnjESJ_f_pgNNJlnLDjofvs3gkZQUYqrBXmt8odMNuI20o6G6rnefw2Rdt1nxEvkY-_JwScDjVKb1bSmQmCd52MwNHJrDcuLoCpqQXpFJYKT-LBuMR0Mg5hUzTvASg81VfoohFq5LmKVk8I0a7SQjOV__xMaal0IKmYxO0y-EH30OwTdbnemFdN93rZASetyXwONpNg35Dzp0LdLpkqmwMQ_xRBNnfelgKeL1B4IsPnmaa3NqJ_ds5nd2",
    fires: 124,
    comments: 12,
    fired: true,
  },
  {
    id: 2,
    username: "Ren_Dev",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1NxM6T7-6lnyQkQQN0mNY__9h5YONrcszK_yozW2odxbOUs6XMSquSF_sG7EhDaVWCrT4c9QJXF3cNVFprXtxYNL529jDEngqfhVMpxSBm63Y_XYl05IocDiSAZIKwWMe-iW84wt6PF_0sPJno-Iv3KlD9Wto4oGD3RpjRDDIXDO5vkQx3s2MNrsx8JzQSEICd1c1QUhQW3HPetrzhDmkFmSI8zXHt4i4worpawv8l0BFAhe3RngCaAnMEcMj4na1-aAlpXaOcDsi",
    timeAgo: "5h ago",
    text: null,
    quote: '"Creativity is just connecting things."',
    tags: ["#Inspiration", "#Quotes"],
    fires: 45,
    comments: 3,
    fired: false,
  },
  {
    id: 3,
    username: "Sky_Botanics",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtKEmvSLFE8OsS6UC0x_qNqih5_imuCbVeEkVxQHIrO5Eo61kxfQR8VYnsC3w9LzwzVNTITjjVumdulW-S0aJhFhEUiaL-lcnspgYW7-sEHP8U2gDx9wYD0Nbh_yr3dc8YdFaT9HctJsMWC_ZJJZOtQViNM-lC3aoGYOT2c-SgJVqRLig4QCUyitfZqImrAVh-X2xvFWIw7wfR_O2FU_FZAIIKxDxN2M-6Ibi01hVFSRnnZXjieIfM0EuALejsqg_Juox4jCtfvOlm",
    timeAgo: "8h ago",
    text: "Finally finished repotting the Monstera. It looks so happy in the new light! 🌿",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAENL7LNemp_P8i9IXgPm_tlF92RG-_NFr_c1JGNTSvS9YQgu-WQIkjWTiu2wjNY-wEjm66isbvIBfQ-t3kM58UmPQyCm2_ZajP3XD8-m7nehQYFPIbE6ovHybBOoeQLwgVNHCOeo-gjeJOODSXJWlWY7q8cLumkpUW5FrYXF8EaOBsmyFZFKi5zt2HAiZEXc1BVrBvTdqfKyYexR34s_whxrsAD3irtE_n--z-do-m_1bANEW3R0RRaVARJWQOKer5uRz9vodonG",
    fires: 298,
    comments: 56,
    fired: true,
  },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"friends" | "recommended">(
    "friends"
  );
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(recommendedUsers.map((u) => [u.username, u.following]))
  );

  const toggleFollow = (username: string) => {
    setFollowState((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  return (
    <main className="ml-64 flex-1 pt-8 px-10 max-w-5xl">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h2
          className="text-2xl font-bold text-[#231a11]"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Explore sparks
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input
              className="bg-white border-none rounded-full px-6 py-2 w-64 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] focus:ring-2 focus:ring-[#ff6b2b] transition-all text-sm outline-none"
              placeholder="Search the woods..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-[#8d7167] text-base">
              search
            </span>
          </div>
          <button className="w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border-2 border-white">
            <img
              src="https://lh3.googleusercontent.com/aida/ADBb0ujmSwf0-Ai0k60yN2fRyRWg5P6mlPQ1dC1hTQztM44_rNKr3xQKUCjiMEJxfCw0DZ28SSh_rZmOhbxGdv6RzE_Y1an4vCx0vn8YstJ_W5biXvRIG0fi-2KaNBv037mDkn9eQv_57VqpTixe0MO_oycV4S3gKd1M3ZJmi7UFyxlAwbNCBd7Es3OWd8gVyr3XatVpOh7MM6dAx1hUfzCoPpbuMdpX2m7QfcWExFV4mKfkUhPnkHsusCNMb5lOqnPn5Jf0Ce9RxCLN0Q"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-orange-100">
        {(["friends", "recommended"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 relative font-bold text-lg capitalize transition-colors ${
              activeTab === tab
                ? "text-[#231a11]"
                : "text-[#8d7167] hover:text-[#802a00]"
            }`}
            style={{ fontFamily: "Space Grotesk" }}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-gradient-to-r from-[#ff6b2b] to-[#ff3cac]" />
            )}
          </button>
        ))}
      </div>

      {/* Recommended Users */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3
              className="text-2xl font-bold text-[#231a11]"
              style={{ fontFamily: "Space Grotesk" }}
            >
              New faces
            </h3>
            <p className="text-base text-[#58423a]">
              Recommended based on your sparks
            </p>
          </div>
          <button className="text-[#ff6b2b] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
            VIEW ALL{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {recommendedUsers.map((user) => (
            <div
              key={user.username}
              className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[rgba(255,107,43,0.1)] flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#ff6b2b] to-[#ff3cac] mb-4">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-[#fdebdc]">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h4
                className="font-bold text-base text-[#231a11]"
                style={{ fontFamily: "Space Grotesk" }}
              >
                {user.username}
              </h4>
              <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#8d7167] mb-6">
                {user.role}
              </p>
              {followState[user.username] ? (
                <button
                  onClick={() => toggleFollow(user.username)}
                  className="w-full py-2 rounded-xl bg-[#a83900] text-white font-bold text-sm shadow-md shadow-[#a83900]/20 transition-all duration-200 hover:opacity-90"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Following
                </button>
              ) : (
                <button
                  onClick={() => toggleFollow(user.username)}
                  className="w-full py-2 rounded-xl border border-[#ff6b2b] text-[#ff6b2b] font-bold text-sm hover:bg-[#ff6b2b] hover:text-white transition-all duration-200"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Sparks Feed */}
      <section>
        <h3
          className="text-2xl font-bold text-[#231a11] mb-6"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Recent sparks
        </h3>
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="break-inside-avoid bg-white rounded-2xl shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[rgba(255,107,43,0.1)] overflow-hidden"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  className="w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#fdebdc]">
                    <img
                      src={post.avatar}
                      alt={post.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className="font-bold text-sm text-[#231a11]"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {post.username}
                  </span>
                  <span className="text-xs text-[#8d7167] ml-auto">
                    {post.timeAgo}
                  </span>
                </div>

                {post.quote && (
                  <p
                    className="text-lg font-bold text-[#231a11] mb-4"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {post.quote}
                  </p>
                )}
                {post.text && (
                  <p className="text-base text-[#58423a] mb-4">{post.text}</p>
                )}

                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-orange-50 text-[#a83900] text-xs font-bold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    className={`flex items-center gap-1 transition-colors ${
                      post.fired ? "text-[#ff6b2b]" : "text-[#8d7167]"
                    } group`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={
                        post.fired
                          ? {
                              fontVariationSettings:
                                "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }
                          : undefined
                      }
                    >
                      local_fire_department
                    </span>
                    <span className="text-sm font-bold">{post.fires}</span>
                  </button>
                  <button className="flex items-center gap-1 text-[#8d7167]">
                    <span className="material-symbols-outlined text-xl">
                      chat_bubble
                    </span>
                    <span className="text-sm font-bold">{post.comments}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
