import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import TopNav from '@/components/TopNav'

export const metadata: Metadata = {
  title: 'CampFire',
  description: 'Stay Warm',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-[#fff8f4] text-[#231a11] font-[family-name:var(--font-be-vietnam)] min-h-screen overflow-x-hidden">
        {/* Top Nav (mobile) */}
        <TopNav />

        <div className="flex pt-16 md:pt-0">
          {/* Sidebar (desktop) */}
          <Sidebar />

          {/* Main content */}
          <main className="md:ml-72 flex-1 min-h-screen pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  )
}
