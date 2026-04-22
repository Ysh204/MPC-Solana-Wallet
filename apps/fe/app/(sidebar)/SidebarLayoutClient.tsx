"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "../../components/Sidebar";

export default function SidebarLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* ── Mobile hamburger trigger ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[rgba(9,9,12,0.9)] backdrop-blur-xl text-white/70 transition hover:bg-[rgba(139,92,246,0.12)] hover:text-[#b58cff] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <main
        className={`flex-1 min-h-screen px-4 py-5 transition-all duration-500 sm:px-6 sm:py-7 lg:px-8 lg:py-8 ${
          isCollapsed ? "lg:pl-[120px]" : "lg:pl-[364px]"
        }`}
      >
        <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1620px] px-1 sm:px-2">
          {children}
        </div>
      </main>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
