"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030005] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00f0ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7000ff]/5 blur-[120px] pointer-events-none" />
      
      <main className="max-w-4xl text-center z-10">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">On-Chain Tipping Platform</span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6 landing-gradient leading-tight">
          TipJar
        </h1>
        
        <p className="text-lg sm:text-xl text-[#a0a0b0] max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          Support your favorite creators with instant SOL tips.
          <span className="block mt-2 font-bold text-white/80 italic">Secured by MPC — no seed phrases, no compromise.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
           <Link href="/signin" className="btn btn-primary px-10 py-4 text-base w-full sm:w-auto shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              Get Started
           </Link>
           <Link href="/dashboard" className="btn btn-outline px-10 py-4 text-base w-full sm:w-auto">
              Explore Creators
           </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24">
           {[
             { label: "Fast", icon: "⚡", text: "Instant SOL transfers" },
             { label: "Secure", icon: "🔒", text: "Multi-party computation" },
             { label: "Direct", icon: "🤝", text: "Peer-to-peer support" },
             { label: "Proven", icon: "📈", text: "Full on-chain history" }
           ].map((feat, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{feat.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">{feat.label}</span>
                <span className="text-[10px] text-[#a0a0b0] font-medium">{feat.text}</span>
             </div>
           ))}
        </div>
      </main>

      <footer className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] text-[#606070] font-bold">
        Powered by Solana & Multi-Party Computation
      </footer>
    </div>
  );
}
