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
    <div className="relative flex min-h-screen bg-transparent print:block">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* ── Mobile hamburger trigger ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/90 text-slate-500 shadow-[0_18px_30px_rgba(148,163,184,0.18)] backdrop-blur-xl transition hover:bg-slate-900 hover:text-white lg:hidden print:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <main
        className={`flex-1 min-h-screen px-4 py-5 transition-all duration-500 sm:px-6 sm:py-7 lg:px-8 lg:py-8 print:p-0 ${
          isCollapsed ? "lg:pl-[120px]" : "lg:pl-[364px]"
        }`}
      >
        <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1620px] px-1 sm:px-2 print:min-h-0 print:px-0">
          {children}
        </div>
      </main>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/70 backdrop-blur-sm lg:hidden print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
