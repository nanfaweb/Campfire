'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV = [
  { href: '/',              icon: 'home' },
  { href: '/explore',       icon: 'explore' },
  { href: '/notifications', icon: 'notifications', filled: true },
  { href: '/messages',      icon: 'mail' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top mobile header */}
      <header className="md:hidden fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#FFF8F4]/80 backdrop-blur-md z-40 border-b border-orange-100">
        <span className="text-2xl font-black text-[#a83900] tracking-tighter font-h1">
          CampFire
        </span>
        <div className="flex items-center gap-4">
          <button>
            <span className="material-symbols-outlined text-primary-container">search</span>
          </button>
          <span className="material-symbols-outlined text-primary-container">account_circle</span>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md flex justify-around items-center h-16 border-t border-orange-50 px-4 z-40">
        {MOBILE_NAV.map(({ href, icon, filled }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <span
                className={`material-symbols-outlined ${active ? 'text-primary-orange' : 'text-stone-400'}`}
                style={active && filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
            </Link>
          );
        })}
        {/* FAB */}
        <Link href="/new-spark" className="bg-primary-container text-white p-3 rounded-full -mt-8 shadow-lg shadow-orange-200">
          <span className="material-symbols-outlined">add</span>
        </Link>
      </nav>
    </>
  );
}
