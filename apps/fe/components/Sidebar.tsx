"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

import { getProfile, UserProfile } from "../lib/api";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");

    if (storedEmail) {
      setProfile({
        email: storedEmail,
        displayName: storedEmail.split("@")[0],
      } as UserProfile);
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    getProfile(token)
      .then((res) => setProfile(res.user))
      .catch((err) => console.error("Failed to fetch profile", err));
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  const walletReady = Boolean(profile?.publicKey);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 m-5 flex flex-col rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isCollapsed ? "w-[74px]" : "w-[316px]"
      } ${isOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"}`}
    >
      {!isCollapsed && (
        <div className="absolute inset-y-6 right-0 hidden w-px bg-white/[0.04] pointer-events-none lg:block" />
      )}
      
      {/* ── Background Grid ── */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] overflow-hidden opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

      {/* ── Logo Section ── */}
      <div
        className={`relative z-10 mb-6 flex min-h-[72px] items-center transition-all duration-300 ${
          isCollapsed ? "flex-col justify-center gap-3 px-0" : "justify-between px-3"
        }`}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(98,214,255,0.08))",
                border: "1px solid rgba(139,92,246,0.2)",
                boxShadow: "var(--glow-purple)",
              }}
            >
              <img
                src="/logo.png"
                alt="MPC Wallet Logo"
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    '<span style="font-size:18px;font-weight:900;color:#b58cff">M</span>';
                }}
              />
            </div>
            <div>
              <span className="text-[1.1rem] font-extrabold tracking-tight text-white">
                MPC Wallet
              </span>
              <p className="text-[11px] text-[#7e959d]">Threshold signer</p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(98,214,255,0.08))",
              border: "1px solid rgba(139,92,246,0.2)",
              boxShadow: "var(--glow-purple)",
            }}
        >
          <img
            src="/logo.png"
            alt="MPC Wallet Logo"
            className="h-7 w-7 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.parentElement as HTMLElement).innerHTML =
                '<span style="font-size:18px;font-weight:900;color:#b58cff">M</span>';
            }}
          />
        </div>
        )}

        {/* ── Collapse Toggle ── */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.05] p-2 text-white/70 transition hover:bg-[rgba(139,92,246,0.12)] hover:text-[#b58cff]"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Nav Items (Menu description box REMOVED) ── */}
      <nav className="relative z-10 flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center rounded-[var(--radius-md)] transition-all duration-300 ${
                isCollapsed ? "justify-center px-0 py-3.5" : "gap-3 px-4 py-4"
              } ${
                isActive
                  ? "sidebar-link-active text-white"
                  : "text-white/42 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-xl transition ${
                  isActive ? "text-[#b58cff]" : "group-hover:text-white"
                }`}
                style={isActive ? { textShadow: "0 0 12px rgba(181,140,255,0.4)" } : {}}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2.1} />
              </span>

              {!isCollapsed && (
                <span className="flex-1 truncate text-sm font-semibold tracking-wide">
                  {item.name}
                </span>
              )}

              {isCollapsed ? (
                <div
                  className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-xl px-3 py-2 text-xs text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  style={{
                    background: "#0b171d",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {item.name}
                </div>
              ) : null}
            </Link>
          );
        })}

        <div className={`mt-6 ${isCollapsed ? "px-0" : "px-2"}`}>
          <div
            className={`rounded-[var(--radius-md)] transition-all duration-300 ${
              isCollapsed ? "p-2" : "p-4"
            }`}
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              border: "1px dashed rgba(98,214,255,0.1)",
            }}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a1430] text-[#62d6ff]">
                <ShieldCheck size={18} />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-bold text-white">MPC Status</p>
                  <p className="text-xs text-[#7e959d]">
                    {walletReady ? "Wallet provisioned" : "Waiting for wallet setup"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Profile Section ── */}
      <div className={`relative z-10 mt-4 ${isCollapsed ? "px-1" : "px-2"}`}>
        <div
          className={`rounded-[1.5rem] bg-white/[0.024] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
            isCollapsed ? "p-2" : "p-3"
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "#0f1822",
                border: "1px solid rgba(98,214,255,0.2)",
              }}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <User className="text-white/65" size={19} />
              )}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">
                      {profile?.displayName || "Wallet User"}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        walletReady
                          ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
                          : "bg-[rgba(98,214,255,0.1)] text-[#62d6ff]"
                      }`}
                      style={{ letterSpacing: "0.08em" }}
                    >
                      {walletReady ? "Ready" : "Pending"}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[#6e868e]">
                    {profile?.email || "Member profile"}
                  </p>
                </div>

                <div className="group relative">
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("email");
                      localStorage.removeItem("userId");
                      window.location.href = "/signin";
                    }}
                    className="rounded-xl p-2 text-white/35 transition hover:bg-red-400/12 hover:text-red-400"
                  >
                    <LogOut size={17} />
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0b171d] px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Sign out
                  </div>
                </div>
              </>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                localStorage.removeItem("userId");
                window.location.href = "/signin";
              }}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-red-400/6 p-2 text-red-400 transition hover:bg-red-400/10"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
