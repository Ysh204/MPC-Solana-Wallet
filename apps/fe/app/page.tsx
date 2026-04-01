"use client";

import Link from "next/link";
import { TrendingUp, Wallet, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* ── Atmospheric glow orbs ── */}
      <div
        className="pointer-events-none absolute blur-[200px]"
        style={{
          width: 500,
          height: 500,
          top: "8%",
          left: "12%",
          background: "rgba(139,92,246,0.08)",
          borderRadius: "50%",
        }}
      />
      <div
        className="pointer-events-none absolute blur-[180px]"
        style={{
          width: 400,
          height: 400,
          bottom: "10%",
          right: "10%",
          background: "rgba(98,214,255,0.06)",
          borderRadius: "50%",
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-[850px] text-center"
        style={{ paddingTop: "2vh" }}
      >
        <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-black/20 backdrop-blur-xl p-8 md:p-14 shadow-2xl border border-white/[0.04]">
          {/* ── Background Grid ── */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* ── Ambient Radial Glows ── */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

          {/* ── Eyebrow ── */}
          <p
            className="animate-fade-in mb-5 text-[10px] font-bold uppercase text-[#5f7a80]"
            style={{ letterSpacing: "0.32em", animationDelay: "0s" }}
          >
            Solana · Creator Economy
          </p>

          {/* ── Headline ── */}
          <h1
            className="animate-fade-up text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="landing-gradient">TipJar</span>
          </h1>

          {/* ── Sub-headline ── */}
          <p
            className="animate-fade-up mx-auto mt-6 max-w-[480px] text-lg leading-[1.7] text-[#9aa3b2]"
            style={{ animationDelay: "0.2s" }}
          >
            Tip creators, manage your wallet, and stake SOL from one clean
            dashboard.
          </p>

          {/* ── CTA row ── */}
          <div
            className="animate-fade-up mt-10 flex flex-col justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.35s" }}
          >
            <Link
              href="/signin"
              className="btn inline-flex min-w-[200px] items-center justify-center px-8"
              style={{
                height: 52,
                borderRadius: 16,
                background: "var(--accent-gradient)",
                color: "#031014",
                fontWeight: 800,
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.15), 0 20px 40px rgba(139,92,246,0.25)",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="btn inline-flex min-w-[200px] items-center justify-center px-8 transition-all duration-300"
              style={{
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-primary)",
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              Explore
            </Link>
          </div>

          {/* ── Feature cards ── */}
          <div className="mt-14 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {[
              {
                title: "Instant creator tipping",
                detail:
                  "Send support in seconds with a simple on-chain flow built for fans and creators.",
                icon: Zap,
                color: "#8b5cf6",
                bgColor: "rgba(139,92,246,0.1)",
              },
              {
                title: "Secure wallet access",
                detail:
                  "Manage balances and transfers through a protected MPC-backed wallet experience.",
                icon: Wallet,
                color: "#62d6ff",
                bgColor: "rgba(98,214,255,0.1)",
              },
              {
                title: "Solana staking support",
                detail:
                  "Stake SOL, track rewards, and manage unstaking from the same workspace.",
                icon: TrendingUp,
                color: "#4ade80",
                bgColor: "rgba(74,222,128,0.1)",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="animate-fade-up rounded-[18px] p-5 relative z-10"
                  style={{
                    animationDelay: `${0.45 + i * 0.08}s`,
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: `2px solid ${item.color}`,
                  }}
                >
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: item.bgColor }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#97a1b1]">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
