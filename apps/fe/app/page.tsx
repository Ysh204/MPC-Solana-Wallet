"use client";

import Link from "next/link";
import { ArrowRight, Blocks, ShieldCheck, Wallet } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      title: "Threshold key management",
      detail:
        "Private key material stays split across MPC participants so a single signer never holds the whole key.",
      icon: ShieldCheck,
      color: "#2563eb",
      bgColor: "rgba(37,99,235,0.1)",
    },
    {
      title: "Wallet-first operations",
      detail:
        "Check balances, provision wallets, and send SOL from one focused Solana dashboard.",
      icon: Wallet,
      color: "#0f766e",
      bgColor: "rgba(15,118,110,0.1)",
    },
    {
      title: "Split backend architecture",
      detail:
        "A frontend app, an API server, and MPC signing nodes work together to approve and broadcast transfers.",
      icon: Blocks,
      color: "#b45309",
      bgColor: "rgba(180,83,9,0.1)",
    },
  ];

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute left-[12%] top-[8%] h-[500px] w-[500px] rounded-full bg-[#3b82f6]/[0.09] blur-[200px] print:hidden" />
      <div className="pointer-events-none absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-[#14b8a6]/[0.07] blur-[180px] print:hidden" />

      <main
        className="relative z-10 mx-auto w-full max-w-[850px] text-center"
        style={{ paddingTop: "2vh" }}
      >
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-2xl md:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] print:hidden [background-image:linear-gradient(to_right,rgba(15,23,42,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-0 print:hidden bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.08),transparent_60%)]" />

          <p
            className="animate-fade-in mb-5 text-[10px] font-bold uppercase text-slate-500"
            style={{ letterSpacing: "0.32em", animationDelay: "0s" }}
          >
            Solana · MPC · Wallet Operations
          </p>

          <h1
            className="animate-fade-up text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight text-slate-950"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="landing-gradient">wallet on Solana</span> with MPC
          </h1>

          <p
            className="animate-fade-up mx-auto mt-6 max-w-[480px] text-lg leading-[1.7] text-slate-600"
            style={{ animationDelay: "0.2s" }}
          >
            This project is trimmed down to a wallet-first experience: MPC
            wallet provisioning, balance visibility, and secure SOL transfers on
            devnet.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.35s" }}
          >
            <Link
              href="/signin"
              className="btn btn-primary h-[52px] min-w-[200px] rounded-2xl px-8 text-base font-extrabold hover:scale-[1.02]"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={scrollToFeatures}
              className="btn btn-outline h-[52px] min-w-[200px] rounded-2xl px-8 text-base font-bold"
            >
              Explore Wallet Flow
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>

          <div
            id="features"
            className="mt-16 grid grid-cols-1 gap-5 text-left sm:grid-cols-3"
          >
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative z-10 animate-fade-up rounded-[1.25rem] border border-slate-200/80 bg-white/78 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl"
                  style={{
                    animationDelay: `${0.45 + i * 0.08}s`,
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.bgColor }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
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
