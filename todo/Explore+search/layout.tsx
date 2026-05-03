import type { Metadata } from "next";
import "../styles/globals.css";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

export const metadata: Metadata = {
  title: "CampFire — Stay Warm",
  description: "A cozy social platform for creators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fff8f4] text-[#231a11] min-h-screen font-['Be_Vietnam_Pro']">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-72 mr-80 pt-6 px-10 pb-20 min-h-screen">
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </body>
    </html>
  );
}
