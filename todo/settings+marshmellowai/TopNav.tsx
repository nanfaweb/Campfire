export default function TopNav() {
  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#FFF8F4]/80 backdrop-blur-md z-40 border-b border-orange-100 shadow-[0_2px_15px_-3px_rgba(168,57,0,0.05)] md:hidden">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black text-[#a83900] tracking-tighter font-[family-name:var(--font-space-grotesk)]">
          CampFire
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-stone-500 hover:text-[#a83900] transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button className="p-2 text-stone-500 hover:text-[#a83900] transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  )
}
