import React from "react";
import { Sidebar } from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FFF8F2] font-body text-[#32231B]">
      <Sidebar />
      {children}
    </div>
  );
}
