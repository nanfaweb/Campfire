export default function RightSidebar() {
  const trending = [
    {
      category: "TRENDING IN ART",
      tag: "#SketchbookSunday",
      count: "12.4k sparks this morning",
    },
    {
      category: "DESIGN",
      tag: "#CozyUI",
      count: "8.2k sparks",
    },
    {
      category: "WELLNESS",
      tag: "#DigitalDetox",
      count: "5.1k sparks",
    },
  ];

  return (
    <aside className="w-80 h-screen fixed right-0 top-0 bg-white border-l border-orange-50 p-8 hidden xl:flex flex-col gap-8">
      {/* Hot Embers / Trending */}
      <section>
        <h4
          className="text-lg font-bold text-[#231a11] mb-4"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Hot Embers
        </h4>
        <div className="flex flex-col gap-4">
          {trending.map(({ category, tag, count }) => (
            <div key={tag} className="group cursor-pointer">
              <p className="text-xs font-bold text-[#ff6b2b] mb-1">
                {category}
              </p>
              <h5
                className="font-bold text-[#231a11] group-hover:text-[#ff6b2b] transition-colors"
                style={{ fontFamily: "Space Grotesk" }}
              >
                {tag}
              </h5>
              <p className="text-xs text-[#8d7167]">{count}</p>
            </div>
          ))}
        </div>
        <button className="mt-6 text-sm font-bold text-[#ff6b2b] hover:underline">
          Show more
        </button>
      </section>

      {/* Community Invite Card */}
      <div className="bg-[#fdebdc] rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h4
            className="font-bold text-[#231a11] mb-2"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Join a Circle
          </h4>
          <p className="text-sm text-[#58423a] mb-4">
            Find creators who share your creative sparks.
          </p>
          <button className="bg-white text-[#ff6b2b] px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors">
            Explore Circles
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <span className="material-symbols-outlined" style={{ fontSize: "96px" }}>
            groups
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto">
        <nav className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          {["Terms", "Privacy", "Cookies", "Ads Info"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[10px] font-bold text-[#8d7167] uppercase tracking-widest hover:text-[#ff6b2b]"
            >
              {link}
            </a>
          ))}
        </nav>
        <p className="text-[10px] text-[#8d7167] font-medium">
          © 2024 CampFire Inc.
        </p>
      </footer>
    </aside>
  );
}
