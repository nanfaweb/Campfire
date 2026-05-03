"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/explore", icon: "explore", label: "Explore" },
  { href: "/messages", icon: "mail", label: "Messages" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
  { href: "/marshmallow", icon: "local_fire_department", label: "Marshmallow" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 bg-white border-r border-orange-50 shadow-[4px_0_24px_-4px_rgba(168,57,0,0.06)] z-50">
      <div className="flex flex-col gap-2 py-8 px-4 h-full">
        {/* Logo */}
        <div className="px-4 mb-8">
          <h1 className="text-3xl font-black text-[#a83900] tracking-tighter font-['Space_Grotesk']">
            CampFire
          </h1>
          <p
            className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#8d7167] mt-1"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Stay Warm
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150 ease-out active:scale-[0.98] ${
                  isActive
                    ? "bg-orange-50 text-[#a83900] border-l-4 border-[#a83900]"
                    : "text-stone-500 hover:bg-orange-50/50 hover:text-[#a83900]"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? {
                          fontVariationSettings:
                            "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                        }
                      : undefined
                  }
                >
                  {icon}
                </span>
                <span
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* New Spark CTA */}
        <div className="mt-auto px-4">
          <button className="w-full bg-[#a83900] text-white rounded-xl py-4 font-['Space_Grotesk'] text-base font-bold shadow-lg shadow-[#a83900]/20 hover:bg-[#ff3cac] transition-all duration-300 active:scale-95">
            New Spark
          </button>
        </div>
      </div>
    </aside>
  );
}
