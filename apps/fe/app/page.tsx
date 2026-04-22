import Link from "next/link";
import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute left-[12%] top-[8%] h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/[0.08] blur-[200px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-[#62d6ff]/[0.06] blur-[180px]" />

      <main className="relative z-10 mx-auto w-full max-w-[880px] text-center">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-8 shadow-[0_8px_32px_0_rgba(162,92,246,0.1)] backdrop-blur-2xl md:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.12),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.08),transparent_60%)]" />

          <p
            className="mb-5 text-[10px] font-bold uppercase text-[#8aa0a8]"
            style={{ letterSpacing: "0.32em" }}
          >
            Solana wallet security
          </p>

          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white">
            <span className="landing-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#a25cf6] to-[#62d6ff]">
              Solana MPC Wallet
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[560px] text-lg leading-[1.7] text-[#97a1b1]">
            A streamlined wallet experience for Solana with multi-party computation login,
            secure signing, balance visibility, and transaction history in one place.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex h-[52px] min-w-[220px] items-center justify-center gap-2 rounded-2xl px-8 text-base font-extrabold text-[#031014] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(162,92,246,0.4)]"
              style={{
                background: "var(--accent-gradient, linear-gradient(to right, #a25cf6, #62d6ff))",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15), 0 20px 40px rgba(139,92,246,0.15)",
              }}
            >
              Sign In To Wallet
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/wallet"
              className="inline-flex h-[52px] min-w-[220px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 text-base font-bold text-white transition-all duration-300 hover:border-[#a25cf6]/50 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(162,92,246,0.2)]"
            >
              Open Wallet
              <Wallet size={16} />
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
            {[
              {
                title: "MPC-secured login",
                detail:
                  "Access the wallet through a multi-party computation flow instead of exposing a full private key on one device.",
                icon: ShieldCheck,
                color: "#8b5cf6",
                bgColor: "rgba(139,92,246,0.1)",
              },
              {
                title: "Solana wallet actions",
                detail:
                  "Review your public key, see live balance data, and send SOL through the existing wallet backend.",
                icon: Wallet,
                color: "#62d6ff",
                bgColor: "rgba(98,214,255,0.1)",
              },
              {
                title: "Clean single-purpose UI",
                detail:
                  "The experience is now focused on the wallet only, without the old staking, creator, or tip jar features.",
                icon: ArrowRight,
                color: "#4ade80",
                bgColor: "rgba(74,222,128,0.1)",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative z-10 rounded-[1.25rem] border border-white/5 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.03] hover:shadow-xl"
                  style={{ borderLeft: `2px solid ${item.color}` }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.bgColor }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <p className="text-sm font-bold text-white/95">{item.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#97a1b1]">
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
