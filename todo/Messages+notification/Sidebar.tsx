'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',              label: 'Home',          icon: 'home' },
  { href: '/search',        label: 'Search',        icon: 'search' },
  { href: '/explore',       label: 'Explore',       icon: 'explore' },
  { href: '/messages',      label: 'Messages',      icon: 'mail',                filledIcon: true },
  { href: '/notifications', label: 'Notifications', icon: 'notifications',       filledIcon: true },
  { href: '/marshmallow',   label: 'Marshmallow',   icon: 'local_fire_department' },
  { href: '/settings',      label: 'Settings',      icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="h-screen w-72 fixed left-0 top-0 border-r border-orange-50 bg-white shadow-[4px_0_24px_-4px_rgba(168,57,0,0.06)] flex flex-col gap-2 py-8 px-4 z-50">
      {/* Brand */}
      <div className="mb-10 px-4">
        <h1 className="text-primary-container text-2xl font-black tracking-tighter font-h1">
          CampFire
        </h1>
        <p className="text-stone-400 text-xs font-label-caps tracking-widest uppercase mt-1">
          Stay Warm
        </p>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-1 flex-grow">
        {NAV_ITEMS.map(({ href, label, icon, filledIcon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? 'flex items-center gap-4 bg-orange-50 text-primary-container rounded-xl px-4 py-3 border-l-4 border-primary-container font-label-caps uppercase tracking-wider text-sm font-semibold shadow-sm'
                  : 'flex items-center gap-4 text-stone-500 hover:bg-orange-50/50 hover:text-primary-container transition-all rounded-xl px-4 py-3 font-label-caps uppercase tracking-wider text-sm font-semibold'
              }
            >
              <span
                className="material-symbols-outlined"
                style={active && filledIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <button className="mt-auto bg-primary text-white rounded-xl py-4 px-6 font-h2 text-body-md flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined">add_circle</span>
        New Spark
      </button>
    </nav>
  );
}
