import React from "react";
import { Sidebar } from "@/components/Sidebar";
import MarshmallowSyncEngine from "@/components/MarshmallowSyncEngine";
import { getCurrentProfile } from "@/lib/queries/profiles";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  
  return (
    <div className="flex min-h-screen bg-[#FFF8F2] font-body text-[#32231B]">
      <MarshmallowSyncEngine />
      <Sidebar currentUsername={profile?.username} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

