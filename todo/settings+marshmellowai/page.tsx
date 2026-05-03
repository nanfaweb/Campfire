'use client'

import Link from 'next/link'
import Image from 'next/image'

const settingsNav = [
  { icon: 'person', label: 'Account', href: '/settings/account' },
  { icon: 'lock', label: 'Privacy & Safety', href: '/settings/privacy' },
  { icon: 'notifications_active', label: 'Notifications', href: '/settings/notifications' },
  { icon: 'palette', label: 'Appearance', href: '/settings', active: true },
  { icon: 'help', label: 'Help', href: '/settings/help' },
]

const moodPresets = [
  {
    id: 'sun-drenched',
    label: 'Sun Drenched',
    active: true,
    bg: 'bg-[#fff8f4]',
    dot: 'bg-[#ff6b2b]',
    border: 'border-[#ff6b2b]',
    containerBg: 'bg-orange-50',
    textColor: 'text-[#ff6b2b]',
  },
  {
    id: 'midnight-neon',
    label: 'Midnight Neon',
    active: false,
    bg: 'bg-stone-900',
    dot: 'bg-[#ff52b0]',
    border: 'border-transparent',
    containerBg: 'bg-white',
    textColor: 'text-[#58423a]',
  },
  {
    id: 'sepia-ink',
    label: 'Sepia Ink',
    active: false,
    bg: 'bg-[#E8E1DB]',
    dot: 'bg-[#4a4642]',
    border: 'border-transparent',
    containerBg: 'bg-white',
    textColor: 'text-[#58423a]',
  },
]

const accentColors = [
  { color: '#ff6b2b', ring: 'ring-[#ff6b2b]', active: true },
  { color: '#ff52b0', ring: 'ring-[#ff52b0]', active: false },
  { color: '#ff3cac', ring: 'ring-[#ff3cac]', active: false },
  { color: '#4a4642', ring: 'ring-[#4a4642]', active: false },
]

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-[#ff6b2b] mb-2">
          Settings
        </h1>
        <p className="text-[18px] leading-[1.6] text-[#58423a] max-w-2xl">
          Refine your CampFire experience. Customize your presence, privacy, and visual journey through our soulful anime community.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Nav Sidebar */}
        <nav className="lg:col-span-4 flex flex-col gap-3">
          {settingsNav.map(({ icon, label, href, active }) => (
            <Link key={href} href={href}>
              <button
                className={`w-full flex items-center justify-between p-4 rounded-xl border golden-shadow hover:border-[#ff6b2b] transition-all group active:scale-[0.98] ${
                  active
                    ? 'bg-[#802a00] text-white border-[#802a00]'
                    : 'bg-white border-orange-100 text-[#231a11]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      active ? 'bg-white/20 text-white' : 'bg-[#f7e5d6] text-[#a83900]'
                    }`}
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-[16px]">
                    {label}
                  </span>
                </div>
                <span className={`material-symbols-outlined ${active ? 'text-white' : 'text-stone-400 group-hover:text-[#ff6b2b]'} transition-colors`}>
                  chevron_right
                </span>
              </button>
            </Link>
          ))}

          {/* Campfire Image Card */}
          <div className="mt-8 relative h-64 rounded-2xl overflow-hidden shadow-lg border border-orange-100">
            <div className="w-full h-full bg-gradient-to-br from-orange-200 via-orange-100 to-pink-100 flex items-end">
              {/* Placeholder gradient if no image */}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <p className="text-white font-[family-name:var(--font-space-grotesk)] font-bold text-[16px] leading-tight">
                Your Spark, Your Space.
              </p>
            </div>
          </div>
        </nav>

        {/* Active Content: Appearance */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Appearance Card */}
          <section className="card-gradient-border golden-shadow p-8 flex flex-col gap-8">
            <div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-[24px] font-bold text-[#802a00] mb-1">
                Appearance
              </h3>
              <p className="text-[16px] text-[#58423a]">
                Customize how CampFire looks on your device.
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-orange-50">
              <div>
                <h4 className="font-[family-name:var(--font-space-grotesk)] font-bold text-[#231a11]">
                  Dark Mode
                </h4>
                <p className="text-sm text-[#58423a]">
                  Switch to a twilight aesthetic for eye comfort.
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  className="custom-toggle absolute block w-6 h-6 rounded-full bg-white border-2 border-orange-100 appearance-none cursor-pointer z-10"
                  id="dark-mode-toggle"
                  type="checkbox"
                />
                <label
                  className="toggle-bg block overflow-hidden h-6 rounded-full bg-stone-200 cursor-pointer"
                  htmlFor="dark-mode-toggle"
                />
                <span className="toggle-dot absolute top-0 left-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 pointer-events-none" />
              </div>
            </div>

            {/* Mood Presets */}
            <div>
              <h4 className="font-[family-name:var(--font-space-grotesk)] font-bold text-[#231a11] mb-4">
                Mood Presets
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {moodPresets.map(({ id, label, active, bg, dot, border, containerBg, textColor }) => (
                  <button
                    key={id}
                    className={`p-3 border-2 ${active ? border : 'border-transparent hover:border-orange-100'} rounded-xl ${containerBg} flex flex-col items-center gap-2 transition-all`}
                  >
                    <div className={`w-full h-12 rounded-lg ${bg} border border-orange-100 flex items-center justify-center`}>
                      <div className={`w-6 h-6 rounded-full ${dot}`} />
                    </div>
                    <span className={`font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold tracking-[0.05em] uppercase ${textColor}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h4 className="font-[family-name:var(--font-space-grotesk)] font-bold text-[#231a11] mb-4">
                Accent Spark
              </h4>
              <div className="flex gap-4">
                {accentColors.map(({ color, ring, active }) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full transition-all ${active ? `ring-2 ring-offset-2 ${ring}` : `hover:ring-2 hover:ring-offset-2 ${ring}`}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Canvas Scale Card */}
          <section className="card-gradient-border golden-shadow p-8">
            <div className="mb-8">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-[24px] font-bold text-[#802a00] mb-1">
                Canvas Scale
              </h3>
              <p className="text-[16px] text-[#58423a]">
                Adjust the font size and UI spacing for your sketchbook.
              </p>
            </div>

            <div className="relative py-8">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="40"
                className="w-full h-2 bg-orange-50 rounded-lg appearance-none cursor-pointer accent-[#ff6b2b]"
              />
              <div className="flex justify-between mt-4 text-[12px] font-[family-name:var(--font-space-grotesk)] font-bold tracking-[0.05em] text-stone-400 uppercase">
                <span>Cozy</span>
                <span>Balanced</span>
                <span>Spacious</span>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button className="px-6 py-3 rounded-xl font-[family-name:var(--font-space-grotesk)] font-bold border border-orange-100 text-[#58423a] hover:bg-orange-50 transition-all">
                Reset Defaults
              </button>
              <button className="px-8 py-3 rounded-xl font-[family-name:var(--font-space-grotesk)] font-bold bg-[#802a00] text-white hover:bg-[#ff3cac] shadow-lg transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">palette</span>
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
