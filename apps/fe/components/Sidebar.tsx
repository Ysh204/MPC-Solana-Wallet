"use client";

import Link from "next/link";


const navItems = [
  { name: "Discover", href: "/dashboard", icon: "🔥" },
  { name: "My Tips", href: "/tips", icon: "📂" },
  { name: "Wallet", href: "/wallet", icon: "👛" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col z-50">
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center p-[2px]">
            <div className="w-full h-full rounded-[6px] bg-[#0a0a0f] flex items-center justify-center">
              <span className="text-white font-black text-xs">TJ</span>
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter text-white group-hover:text-[#00f0ff] transition-colors">
            TipJar
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar-link"
          >
            <span className="text-lg grayscale group-hover:grayscale-0">{item.icon}</span>
            <span className="font-semibold tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/signin";
          }}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20"
        >
          <span className="text-lg">🚪</span>
          <span className="font-semibold tracking-wide">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
