'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/explore', icon: 'explore', label: 'Explore' },
  { href: '/messages', icon: 'mail', label: 'Messages' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/marshmallow', icon: 'local_fire_department', label: 'Marshmallow', filled: true },
  { href: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 border-r border-orange-50 bg-white shadow-[4px_0_24px_-4px_rgba(168,57,0,0.06)] hidden md:flex flex-col gap-2 py-8 px-4 z-30">
      {/* Brand */}
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-black text-[#a83900] tracking-tighter font-[family-name:var(--font-space-grotesk)]">
          CampFire
        </h2>
        <p className="text-xs font-[family-name:var(--font-space-grotesk)] font-semibold uppercase tracking-wider text-stone-400">
          Stay Warm
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, icon, label, filled }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150 active:scale-[0.98] font-[family-name:var(--font-space-grotesk)] text-sm font-semibold uppercase tracking-wider ${
                isActive
                  ? 'bg-orange-50 text-[#a83900] border-l-4 border-[#a83900]'
                  : 'text-stone-500 hover:bg-orange-50/50 hover:text-[#a83900]'
              }`}
            >
              <span className={filled && isActive ? 'material-symbols-filled' : 'material-symbols-outlined'}>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* CTA */}
      <button className="mt-auto mx-0 bg-[#802a00] text-white py-3 rounded-xl font-[family-name:var(--font-space-grotesk)] font-bold flex items-center justify-center gap-2 hover:bg-[#ff3cac] transition-all active:scale-[0.98] duration-150 shadow-lg">
        <span className="material-symbols-outlined text-sm">add</span>
        <span>New Spark</span>
      </button>
    </aside>
  )
}
