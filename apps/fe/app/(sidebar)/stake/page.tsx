"use client";

import { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import dynamic from "next/dynamic";
const SolanaWalletProvider = dynamic(() => import("../../../components/SolanaWalletProvider"), { ssr: false });

import { Navbar } from "./components/Navbar";
import { RewardsCard } from "./components/RewardsCard";
import { StakeCard } from "./components/StakeCard";
import { StatsBar } from "./components/StatsBar";
import { UnstakeCard } from "./components/UnstakeCard";

export default function StakePage() {
  return (
    <RequireAuth>
      <SolanaWalletProvider>
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden rounded-[var(--radius)] selection:bg-[#8b5cf6]/30">
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: "#091318",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(18px)",
              },
            }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col">
            <Navbar />

            <main className="mt-6 flex flex-1 flex-col px-0 pb-10">
              <header className="mb-6 z-10">
                {/* ── Staking terminal chip with blinking cursor ── */}
                <div className="dashboard-chip dashboard-chip-strong mb-4">
                  <Sparkles size={14} />
                  <span>
                    Staking terminal
                    <span
                      className="ml-0.5 inline-block text-[#b58cff]"
                      style={{ animation: "blink 1s step-end infinite" }}
                    >
                      _
                    </span>
                  </span>
                </div>
                <div className="animate-float-staking">
                  <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
                    Stake <span className="font-normal text-white/90">your</span>{" "}
                    <span className="landing-gradient text-glow-staking">SOL</span>
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                    Stake your SOL and earn rewards with our secure and user-friendly staking
                    terminal, designed to maximize your returns while keeping your assets safe.
                  </p>
                </div>
              </header>

              {/* NEW: Glassmorphism */}
              <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-black/10 backdrop-blur-xl p-6 shadow-2xl md:p-10 border border-white/[0.04]">

                {/* ── Background Grid ── */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

                {/* ── Ambient Radial Glows ── */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

                {/* ── Wavy SVG Lines ── */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">

                  {/* Left Side Waves */}
                  <svg className="absolute left-0 top-0 h-full w-[120%] md:w-full opacity-60" viewBox="0 0 1000 800" preserveAspectRatio="none">
                    {/* Cyan / Teal Waves */}
                    <g className="stroke-[#00d2ff]">
                      <path d="M-100,600 C200,700 300,300 1100,400" fill="none" strokeWidth="1.5" filter="blur(4px)" opacity="0.6" />
                      <path d="M-100,600 C200,700 300,300 1100,400" fill="none" strokeWidth="1" opacity="0.8" />

                      <path d="M-50,650 C250,750 350,350 1150,450" fill="none" strokeWidth="1" opacity="0.3" />
                    </g>

                    {/* Purple Waves */}
                    <g className="stroke-[#8b5cf6]">
                      <path d="M-100,300 C250,200 400,600 1100,500" fill="none" strokeWidth="2" filter="blur(5px)" opacity="0.5" />
                      <path d="M-100,300 C250,200 400,600 1100,500" fill="none" strokeWidth="1" opacity="0.7" />

                      <path d="M-150,250 C200,150 350,550 1050,450" fill="none" strokeWidth="1" opacity="0.3" />
                    </g>
                  </svg>

                  {/* Right Side Waves (Reversed Flow) */}
                  <svg className="absolute right-0 top-0 h-full w-[120%] md:w-full opacity-50" viewBox="0 0 1000 800" preserveAspectRatio="none">
                    {/* Purple Waves */}
                    <g className="stroke-[#8b5cf6]">
                      <path d="M1100,200 C700,100 600,700 -100,600" fill="none" strokeWidth="1.5" filter="blur(4px)" opacity="0.6" />
                      <path d="M1100,200 C700,100 600,700 -100,600" fill="none" strokeWidth="1" opacity="0.8" />
                    </g>

                    {/* Cyan / Teal Waves */}
                    <g className="stroke-[#00d2ff]">
                      <path d="M1100,700 C800,800 500,200 -100,300" fill="none" strokeWidth="2" filter="blur(5px)" opacity="0.4" />
                      <path d="M1100,700 C800,800 500,200 -100,300" fill="none" strokeWidth="1" opacity="0.6" />
                    </g>
                  </svg>
                </div>

                <div className="relative z-10">
                  <StatsBar />

                  <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <StakeCard />
                    <UnstakeCard />
                    <RewardsCard />
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </SolanaWalletProvider>
    </RequireAuth>
  );
}