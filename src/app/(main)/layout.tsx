import React from "react";
import { Sidebar } from "@/components/Sidebar";

import { getCurrentProfile } from "@/lib/queries/profiles";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  
  return (
    <div className="flex min-h-screen bg-[#FFF8F2] font-body text-[#32231B]">
      <Sidebar currentUsername={profile?.username} />
      {children}
    </div>
  );
}

