'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileNavItems = [
  { href: '/', icon: 'home' },
  { href: '/search', icon: 'search' },
  { href: '/new', icon: 'add_circle' },
  { href: '/messages', icon: 'mail' },
  { href: '/settings', icon: 'settings' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-orange-50 flex justify-around items-center h-16 px-4 z-40">
      {mobileNavItems.map(({ href, icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href}>
            <button className={`flex flex-col items-center transition-colors ${isActive ? 'text-[#ff6b2b]' : 'text-stone-400'}`}>
              <span className={isActive ? 'material-symbols-filled' : 'material-symbols-outlined'}>
                {icon}
              </span>
            </button>
          </Link>
        )
      })}
    </nav>
  )
}
