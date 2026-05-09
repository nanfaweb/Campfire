"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export function Sidebar({ currentUsername }: { currentUsername?: string }) {
  const pathname = usePathname();

  const navItems = [
    { icon: "home", label: "HOME", href: "/home" },
    { icon: "explore", label: "EXPLORE", href: "/explore" },
    { icon: "mail", label: "MESSAGES", href: "/messages" },
    { icon: "notifications", label: "NOTIFICATIONS", href: "/notifications" },
    ...(currentUsername ? [{ icon: "person", label: "PROFILE", href: `/profile/${currentUsername}` }] : []),
    { icon: "local_fire_department", label: "MARSHMALLOW", href: "/marshmallow" },
    { icon: "settings", label: "SETTINGS", href: "/settings" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white/40 backdrop-blur-md border-r border-orange-50/50 flex flex-col z-50">
      <div className="py-8 px-8 flex flex-col">
        <Link href="/home" className="text-3xl font-black tracking-tighter text-[#A83900]">
          CampFire
        </Link>
        <span className="text-[10px] font-bold text-[#A89F9A] uppercase tracking-widest mt-1">
          Stay Warm
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-1 mt-4 px-2">
        {navItems.map(({ icon, label, href }) => {
          // Simple active state check. Could be refined based on actual routes.
          const active = pathname?.startsWith(href) || (pathname === "/" && href === "/home");
          
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-200 rounded-xl mx-2 ${
                active
                  ? "text-[#A83900] font-bold bg-[#FFF1E6] shadow-sm"
                  : "text-[#6B6056] font-semibold hover:text-[#FF6B2B] hover:bg-[#FFF1E6]/50"
              }`}
            >
              <Icon name={icon} fill={active} size={22} />
              <span className="text-[12px] tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* New Spark Button */}
      <div className="p-6 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-[#843615] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#6b2c11] transition-colors ember-glow">
          <Icon name="add" size={20} />
          New Spark
        </button>
      </div>
    </nav>
  );
}
