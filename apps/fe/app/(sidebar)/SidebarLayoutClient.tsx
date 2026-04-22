"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

export default function SidebarLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "Authenticated wallet session");
    setIsCollapsed(localStorage.getItem("wallet_sidebar_collapsed") === "true");
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateDesktopState = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);

    return () => mediaQuery.removeEventListener("change", updateDesktopState);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem("wallet_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const isCompact = isDesktop && isCollapsed;

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/signin";
  }

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[rgba(9,9,12,0.9)] text-white/70 backdrop-blur-xl transition hover:bg-[rgba(139,92,246,0.12)] hover:text-[#b58cff] lg:hidden"
        aria-label="Open wallet navigation"
      >
        <Menu size={20} />
      </button>

      <aside
        className={`fixed left-0 top-0 z-50 m-5 flex h-[calc(100vh-2.5rem)] w-[214px] max-w-[calc(100vw-2.5rem)] flex-col overflow-y-auto overflow-x-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003))] p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-3xl transition-all duration-300 ease-out ${
          isCompact ? "lg:w-[80px]" : "lg:w-[214px]"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

        <div
          className={`relative z-10 flex gap-2.5 ${
            isCompact ? "items-center justify-center lg:flex-col" : "items-center justify-between"
          }`}
        >
          <Link
            href="/wallet"
            className={`flex min-w-0 items-center gap-2.5 ${isCompact ? "lg:flex-col lg:text-center" : ""}`}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(98,214,255,0.08))",
                border: "1px solid rgba(139,92,246,0.2)",
                boxShadow: "var(--glow-purple)",
              }}
            >
              <ShieldCheck size={22} className="text-white" />
            </div>

            {!isCompact ? (
              <div>
                <span className="block text-[0.92rem] font-extrabold tracking-tight text-white">
                  Solana MPC Wallet
                </span>
                <span className="block text-[11px] text-[#7e959d]">Secure login and custody</span>
              </div>
            ) : null}
          </Link>

          <div className={`flex ${isCompact ? "lg:w-full lg:justify-center" : ""}`}>
            <button
              onClick={() => setIsCollapsed((current) => !current)}
              className="hidden rounded-2xl border border-white/[0.06] bg-white/[0.05] p-2 text-white/70 transition hover:bg-[rgba(139,92,246,0.12)] hover:text-[#b58cff] lg:flex"
              aria-label={isCompact ? "Expand wallet navigation" : "Collapse wallet navigation"}
            >
              {isCompact ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.05] p-2 text-white/70 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
              aria-label="Close wallet navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="relative z-10 mt-5 flex-1">
          <Link
            href="/wallet"
            className={`group flex rounded-[var(--radius-md)] text-sm font-semibold tracking-wide transition-all duration-300 ${
              isCompact ? "justify-center px-0 py-4 lg:min-h-[54px]" : "items-center gap-3 px-3.5 py-3"
            } ${
              pathname === "/wallet"
                ? "sidebar-link-active text-white"
                : "text-white/50 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span
              className={`flex items-center justify-center rounded-xl transition ${
                pathname === "/wallet" ? "text-[#b58cff]" : "group-hover:text-white"
              }`}
            >
              <Wallet size={19} strokeWidth={pathname === "/wallet" ? 2.5 : 2.1} />
            </span>
            {!isCompact ? <span className="flex-1">Wallet</span> : null}
          </Link>

          {!isCompact ? (
            <div
              className="mt-4 rounded-[var(--radius-md)] p-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                border: "1px dashed rgba(98,214,255,0.1)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1430] text-[#62d6ff]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Multi-party computation</p>
                  <p className="mt-1 text-[11px] leading-4.5 text-[#7e959d]">
                    Signing stays distributed, so no single device holds the full private key.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#62d6ff]/10 bg-[#1a1430] text-[#62d6ff]">
                <ShieldCheck size={18} />
              </div>
            </div>
          )}
        </nav>

        <div className="relative z-10 mt-auto rounded-[1.5rem] bg-white/[0.024] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className={`flex items-center gap-3 ${isCompact ? "lg:justify-center" : ""}`}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "#0f1822",
                border: "1px solid rgba(98,214,255,0.2)",
              }}
            >
              <Wallet className="text-white/65" size={19} />
            </div>

            {!isCompact ? (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13px] font-bold text-white">Wallet session</p>
                  <span className="rounded-full bg-[rgba(98,214,255,0.1)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#62d6ff]">
                    MPC
                  </span>
                </div>
                <p className="truncate text-[11px] text-[#6e868e]">{email}</p>
              </div>
            ) : null}

            <button
              onClick={handleSignOut}
              className="rounded-xl p-2 text-white/35 transition hover:bg-red-400/12 hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`flex-1 min-h-screen px-4 py-5 transition-all duration-300 sm:px-6 sm:py-7 lg:px-8 lg:py-8 ${
          isCompact ? "lg:pl-[118px]" : "lg:pl-[252px]"
        }`}
      >
        <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1620px] px-1 sm:px-2">
          {children}
        </div>
      </main>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}
