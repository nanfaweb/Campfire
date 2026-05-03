import type { Metadata } from 'next';
import '../styles/globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'CampFire',
  description: 'Stay Warm',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-background text-on-surface font-body-md">

        {/* Scroll progress accent bar */}
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-orange to-accent-pink z-50 origin-left" />

        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile header + bottom nav */}
        <MobileNav />

        {/* Page content — offset for sidebar on desktop, top bar on mobile */}
        <div className="md:ml-72 pt-16 md:pt-0 pb-16 md:pb-0 min-h-screen">
          {children}
        </div>

      </body>
    </html>
  );
}
