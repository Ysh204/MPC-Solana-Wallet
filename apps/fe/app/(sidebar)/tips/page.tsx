"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Inbox, Send } from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { useTips } from "../../../hooks/tips";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortSig(sig: string) {
  return sig.slice(0, 10) + "..." + sig.slice(-4);
}

export default function TipsPage() {
  const { sent, received, loading } = useTips();
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  const activeTips = activeTab === "sent" ? sent : received;
  const totals = useMemo(
    () => ({
      sentVolume: sent.reduce((sum: number, tip: any) => sum + tip.amount, 0),
      receivedVolume: received.reduce((sum: number, tip: any) => sum + tip.amount, 0),
    }),
    [sent, received],
  );

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1500px]" id="tips-history">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-black/20 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/[0.04]">
          {/* ── Background Grid ── */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* ── Ambient Radial Glows ── */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

          <div className="relative z-10 w-full">
            <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Tip <span className="landing-gradient">History</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
                  Keep track of your impact and see how your contributions grow over time.
                </p>
              </div>

              {/* ── Summary mini-cards ── */}
              <div className="flex flex-wrap gap-3">
                <div className="dashboard-panel flex flex-col relative text-left min-w-[80px] !p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                    Sent
                  </span>
                  <span className="mt-1 font-mono text-sm font-extrabold text-[#fb7185]">
                    ◎ {totals.sentVolume.toFixed(2)}
                  </span>
                </div>
                <div className="dashboard-panel flex flex-col relative text-left min-w-[80px] !p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                    Received
                  </span>
                  <span className="mt-1 font-mono text-sm font-extrabold text-[#4ade80]">
                    ◎ {totals.receivedVolume.toFixed(2)}
                  </span>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="grid gap-4">
                <div className="dashboard-panel flex flex-col relative text-left">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
                      <Send size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Outgoing support
                      </p>
                      <h2 className="text-xl font-extrabold text-white">Tips you sent</h2>
                    </div>
                  </div>
                  <p className="landing-gradient text-4xl font-extrabold tracking-tight">
                    ◎ {totals.sentVolume.toFixed(2)}
                  </p>
                  <p className="mt-3 text-sm text-[#8ba1a9]">{sent.length} transfers recorded.</p>
                </div>

                <div className="dashboard-panel flex flex-col relative text-left">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#62d6ff]/14 bg-[#62d6ff]/10 text-[#62d6ff]">
                      <Inbox size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Incoming support
                      </p>
                      <h2 className="text-xl font-extrabold text-white">Tips you received</h2>
                    </div>
                  </div>
                  <p className="landing-gradient text-4xl font-extrabold tracking-tight">
                    ◎ {totals.receivedVolume.toFixed(2)}
                  </p>
                  <p className="mt-3 text-sm text-[#8ba1a9]">{received.length} ledger entries tracked.</p>
                </div>
              </div>

              <div className="dashboard-panel flex flex-col relative text-left">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Transaction monitor
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-white">On-chain tip stream</h2>
                  </div>

                  {/* ── Segmented tab switcher ── */}
                  <div
                    className="flex gap-0 rounded-2xl p-1"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <button
                      onClick={() => setActiveTab("sent")}
                      className={`rounded-[1.25rem] px-5 py-2.5 text-sm font-bold transition ${
                        activeTab === "sent"
                          ? "text-white"
                          : "text-[#7e959d] hover:text-white"
                      }`}
                      style={
                        activeTab === "sent"
                          ? {
                              background:
                                "linear-gradient(rgba(139,92,246,0.18), rgba(98,214,255,0.05))",
                            }
                          : {}
                      }
                    >
                      Sent
                    </button>
                    <button
                      onClick={() => setActiveTab("received")}
                      className={`rounded-[1.25rem] px-5 py-2.5 text-sm font-bold transition ${
                        activeTab === "received"
                          ? "text-white"
                          : "text-[#7e959d] hover:text-white"
                      }`}
                      style={
                        activeTab === "received"
                          ? {
                              background:
                                "linear-gradient(rgba(139,92,246,0.18), rgba(98,214,255,0.05))",
                            }
                          : {}
                      }
                    >
                      Received
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="wallet-skeleton h-20 w-full rounded-[var(--radius-sm)]" />
                    ))}
                  </div>
                ) : activeTips.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Inbox size={64} className="text-[#5f747c]/40" />
                    <p className="text-sm text-[#5f747c]">No tips yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeTips.map((tip: any) => (
                      <ScrollReveal key={tip.id}>
                        <div className="tip-row group flex-col items-stretch md:flex-row md:items-center">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                activeTab === "sent"
                                  ? "border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]"
                                  : "border-[#62d6ff]/14 bg-[#62d6ff]/10 text-[#62d6ff]"
                              }`}
                            >
                              {activeTab === "sent" ? <Send size={18} /> : <Inbox size={18} />}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-white">
                                {activeTab === "sent"
                                  ? `To: ${tip.toCreator.displayName}`
                                  : `From: ${tip.fromUser.displayName || "Anonymous contributor"}`}
                              </p>
                              <p className="mt-1 text-[11px] text-[#5f747c]">
                                {fmtTime(tip.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="md:ml-auto md:text-right">
                            <p
                              className={`font-mono text-lg font-extrabold ${
                                activeTab === "sent" ? "text-[#fb7185]" : "text-[#4ade80]"
                              }`}
                            >
                              {activeTab === "sent" ? "-" : "+"}◎ {tip.amount.toFixed(4)}
                            </p>
                            <a
                              href={`https://explorer.solana.com/tx/${tip.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noreferrer"
                              className="solana-address mt-1 inline-flex items-center gap-1 text-[11px] transition-opacity hover:opacity-100"
                            >
                              {shortSig(tip.signature)}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
