"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/Icon";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeMood, setActiveMood] = useState("SUN DRENCHED");
  const [activeSpark, setActiveSpark] = useState("#FF6B2B");

  return (
    <>
        <main className="ml-64 flex-1 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="h-20 flex justify-end items-center px-10 gap-6">
            <button className="text-[#6B6056] hover:text-[#A83900] transition-colors">
              <Icon name="search" size={26} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#E5D5C5] flex items-center justify-center text-[#6B6056] hover:text-[#A83900] transition-colors overflow-hidden border border-[#D5C5B5]">
              <Icon name="person" size={24} />
            </button>
          </header>

          <div className="px-10 py-6 max-w-[1100px] w-full">
            <h1 className="text-4xl text-[#FF6B2B] font-extrabold mb-3">Settings</h1>
            <p className="text-[#644E43] font-medium text-lg mb-12 max-w-2xl">
              Refine your CampFire experience. Customize your presence, privacy, and visual journey through our soulful anime community.
            </p>
            
            <div className="flex gap-8 items-start">
              
              {/* Left Column Sub-nav */}
              <div className="w-[320px] flex-shrink-0 flex flex-col gap-3">
                <SubNavItem icon="person" label="Account" />
                <SubNavItem icon="lock" label="Privacy & Safety" />
                <SubNavItem icon="notifications_active" label="Notifications" />
                <SubNavItem icon="palette" label="Appearance" active />
                <SubNavItem icon="help" label="Help" />
                
                {/* Decorative Image */}
                <div className="mt-6 rounded-2xl overflow-hidden relative shadow-sm h-[280px] group cursor-pointer border border-[#E5D5C5]">
                  {/* Since I don't have the exact image, I'll use a warm gradient placeholder that looks like the mockup */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4C4] via-[#FFB347] to-[#FF6B2B] opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm">
                     <Icon name="local_fire_department" size={48} className="text-white/80 mb-2" fill />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                    <span className="text-white font-bold text-lg">Your Spark, Your Space.</span>
                  </div>
                </div>
              </div>
              
              {/* Right Column Content */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Appearance Card */}
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#F5EBE1]">
                  <h2 className="text-2xl text-[#843615] font-extrabold mb-1">Appearance</h2>
                  <p className="text-[#6B6056] text-sm mb-10 font-medium">Customize how CampFire looks on your device.</p>
                  
                  {/* Dark Mode Toggle */}
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-[#32231B] font-bold text-[15px] mb-1">Dark Mode</h3>
                      <p className="text-[#8C7A6B] text-[13px] font-medium">Switch to a twilight aesthetic for eye comfort.</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-[#FF6B2B]' : 'bg-[#E5D5C5]'}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  
                  {/* Mood Presets */}
                  <div className="mb-10">
                    <h3 className="text-[#32231B] font-bold text-[15px] mb-4">Mood Presets</h3>
                    <div className="flex gap-4">
                      <MoodCard 
                        title="SUN DRENCHED" 
                        active={activeMood === "SUN DRENCHED"} 
                        onClick={() => setActiveMood("SUN DRENCHED")}
                        iconColor="#FF6B2B" 
                        bg="#FFF1E6" 
                      />
                      <MoodCard 
                        title="MIDNIGHT NEON" 
                        active={activeMood === "MIDNIGHT NEON"} 
                        onClick={() => setActiveMood("MIDNIGHT NEON")}
                        iconColor="#FF3CAC" 
                        bg="#1A151C" 
                      />
                      <MoodCard 
                        title="SEPIA INK" 
                        active={activeMood === "SEPIA INK"} 
                        onClick={() => setActiveMood("SEPIA INK")}
                        iconColor="#4A4543" 
                        bg="#E8E2D9" 
                      />
                    </div>
                  </div>
                  
                  {/* Accent Spark */}
                  <div>
                    <h3 className="text-[#32231B] font-bold text-[15px] mb-4">Accent Spark</h3>
                    <div className="flex gap-4">
                      <ColorCircle color="#FF6B2B" active={activeSpark === "#FF6B2B"} onClick={() => setActiveSpark("#FF6B2B")} />
                      <ColorCircle color="#FF3CAC" active={activeSpark === "#FF3CAC"} onClick={() => setActiveSpark("#FF3CAC")} />
                      <ColorCircle color="#FF007F" active={activeSpark === "#FF007F"} onClick={() => setActiveSpark("#FF007F")} />
                      <ColorCircle color="#4A4543" active={activeSpark === "#4A4543"} onClick={() => setActiveSpark("#4A4543")} />
                    </div>
                  </div>
                </div>
                
                {/* Canvas Scale Card */}
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#F5EBE1]">
                  <h2 className="text-2xl text-[#843615] font-extrabold mb-1">Canvas Scale</h2>
                  <p className="text-[#6B6056] text-sm mb-12 font-medium">Adjust the font size and UI spacing for your sketchbook.</p>
                  
                  {/* Slider */}
                  <div className="relative pt-2 pb-4 mb-2 px-2">
                    {/* Track */}
                    <div className="h-2 bg-[#FFF1E6] rounded-full w-full"></div>
                    {/* Thumb (fixed at Balanced for UI demo) */}
                    <div className="absolute top-1 left-[50%] w-4 h-4 -ml-2 bg-[#FF6B2B] rounded-full ring-4 ring-white shadow-sm cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-bold text-[#A89F9A] uppercase tracking-widest px-1">
                    <span>Cozy</span>
                    <span>Balanced</span>
                    <span>Spacious</span>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-12">
                    <button className="px-6 py-3 rounded-xl border border-[#E5D5C5] text-[#6B6056] font-bold text-sm hover:bg-[#FFF8F2] transition-colors">
                      Reset Defaults
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-[#843615] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#6b2c11] transition-colors shadow-md">
                      <Icon name="tune" size={18} />
                      Save Changes
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </main>
    </>
  );
}

// ── UI Components ─────────────────────────────────────────────────────────────

function SubNavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  if (active) {
    return (
      <div className="bg-[#843615] text-white rounded-[16px] p-5 flex justify-between items-center shadow-md cursor-default">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Icon name={icon} size={20} fill />
          </div>
          <span className="font-bold text-[15px]">{label}</span>
        </div>
        <Icon name="chevron_right" size={24} className="opacity-70" />
      </div>
    );
  }
  return (
    <div className="bg-white text-[#6B6056] rounded-[16px] p-5 flex justify-between items-center shadow-sm hover:shadow-md hover:bg-[#FFF8F2] transition-all cursor-pointer border border-[#F5EBE1] group">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#FFF1E6] text-[#A83900] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon name={icon} size={20} />
        </div>
        <span className="font-bold text-[15px] text-[#32231B]">{label}</span>
      </div>
      <Icon name="chevron_right" size={24} className="text-[#D5C5B5] group-hover:text-[#A83900] transition-colors" />
    </div>
  );
}

function MoodCard({ title, active, iconColor, bg, onClick }: { title: string; active?: boolean; iconColor: string; bg: string; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
        active ? 'border-[#FF6B2B] bg-white shadow-sm' : 'border-transparent hover:border-[#F5EBE1] bg-transparent'
      }`}
    >
       <div 
         className="w-full h-[60px] rounded-lg flex items-center justify-center border border-black/5" 
         style={{ backgroundColor: bg }}
       >
          <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: iconColor }}></div>
       </div>
       <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#FF6B2B]' : 'text-[#A89F9A]'}`}>
         {title}
       </span>
    </div>
  );
}

function ColorCircle({ color, active, onClick }: { color: string; active?: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
        active ? 'ring-2 ring-offset-4 ring-[#FF6B2B]' : 'ring-1 ring-offset-2 ring-transparent'
      }`} 
      style={{ backgroundColor: color }}
    ></div>
  );
}
