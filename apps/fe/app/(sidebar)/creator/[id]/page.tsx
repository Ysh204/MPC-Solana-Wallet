"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Heart, FileText, UserX, Zap } from "lucide-react";

import RequireAuth from "../../../../components/RequireAuth";
import StatusNotification from "../../../../components/StatusNotification";
import { useCreator } from "../../../../hooks/creators";
import { tipCreator } from "../../../../lib/api";

function shortSig(sig: string) {
  return sig.slice(0, 12) + "…" + sig.slice(-4);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { creator, loading, error, refresh } = useCreator(id);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ kind: "" as any, msg: "" });

  async function handleTip(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading", msg: "Signing and broadcasting tip..." });
    setSending(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await tipCreator(token, {
        toCreatorId: id,
        amount: parseFloat(amount),
        message: message || undefined,
      });
      setStatus({ kind: "success", msg: "Tip sent successfully! 🎉" });
      setAmount("");
      setMessage("");
      refresh();
    } catch (err: any) {
      setStatus({ kind: "error", msg: err?.message || "Tip failed" });
    } finally {
      setSending(false);
      setTimeout(() => setStatus({ kind: "", msg: "" }), 6000);
    }
  }

  // ── Loading state (brand-aligned) ──
  if (loading)
    return (
      <RequireAuth>
        <div className="flex flex-col items-center gap-4 py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#8b5cf6]/40 border-t-[#b58cff]" />
          <span className="text-xs font-bold uppercase tracking-[0.26em] text-[#b58cff]">
            Loading Profile...
          </span>
        </div>
      </RequireAuth>
    );

  // ── Error / not-found state ──
  if (error || !creator)
    return (
      <RequireAuth>
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <UserX size={48} className="text-[#fb7185]/50" />
          <h3 className="text-xl font-bold text-white">Profile Not Found</h3>
          <p className="text-[#8fa5ad]">
            {error || "This creator's details could not be retrieved."}
          </p>
        </div>
      </RequireAuth>
    );

  const initials = (creator.displayName || "?").slice(0, 2).toUpperCase();
  const quickAmounts = [0.1, 0.5, 1, 2];

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl" id="creator-profile">
        {/* ── Profile Header (palette-aligned) ── */}
        <header className="mb-12 flex flex-col items-center gap-8 md:flex-row">
          {/* Avatar ring: accent-gradient */}
          <div
            className="h-24 w-24 rounded-full p-[2px]"
            style={{
              background: "linear-gradient(to bottom right, #8b5cf6, #62d6ff)",
              boxShadow: "0 0 30px rgba(139,92,246,0.3)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#09090b] shadow-inner">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-white">{initials}</span>
              )}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="landing-gradient mb-2 text-4xl font-black">{creator.displayName}</h1>
            <p className="max-w-lg text-[#8fa5ad] line-clamp-2">
              {creator.bio || "No bio description provided."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
              <div className="dashboard-soft-panel flex flex-col rounded-[var(--radius-sm)] px-5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                  Total Received
                </span>
                <span className="mt-1 text-lg font-bold text-white">
                  ◎ {creator.totalTips.toFixed(4)} SOL
                </span>
              </div>
              <div className="dashboard-soft-panel flex flex-col rounded-[var(--radius-sm)] px-5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                  Support Count
                </span>
                <span className="mt-1 text-lg font-bold text-white">
                  {creator.tipCount} Tips
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* ── Tip Form ── */}
          <div className="card sticky top-6 h-fit">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
                <Heart size={18} />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-[0.26em]">Support</h2>
            </div>
            <form onSubmit={handleTip} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                  Amount (SOL)
                </label>
                <div className="relative">
                  <input
                    className="dashboard-input pr-14"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.05"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#6a7f87]">
                    SOL
                  </span>
                </div>
                {/* Quick-select buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickAmounts.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setAmount(String(qa))}
                      className="btn btn-ghost rounded-full border border-white/[0.08] px-3 py-1.5 text-xs"
                    >
                      {qa} SOL
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                  Message (Optional)
                </label>
                <textarea
                  className="dashboard-input min-h-[100px] resize-none"
                  style={{ fontFamily: "var(--sans)" }}
                  placeholder="Leave a nice comment..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                />
              </div>
              <button
                disabled={sending}
                className="btn btn-primary mt-2 w-full"
                type="submit"
              >
                <Zap size={16} />
                {sending
                  ? "Processing..."
                  : `Send Tip to ${(creator.displayName || "Creator").split(" ")[0]}`}
              </button>
            </form>
          </div>

          {/* ── Activity Feed ── */}
          <div className="card">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
                <FileText size={18} />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-[0.26em]">Activity Feed</h2>
            </div>
            {creator.tipsReceived.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <p className="text-sm">Be the first to support this creator!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {creator.tipsReceived.map((tip) => (
                  <div key={tip.id} className="tip-row flex-col items-stretch gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner">
                          {tip.fromUser.avatarUrl ? (
                            <img
                              src={tip.fromUser.avatarUrl}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-black text-white">
                              {(tip.fromUser.displayName || "A").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white transition-colors hover:text-[#b58cff]">
                            {tip.fromUser.displayName || "Anonymous contributor"}
                          </span>
                          <span className="text-[10px] text-[#5f747c]">
                            {fmtTime(tip.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-extrabold text-[#4ade80]">
                          ◎ {tip.amount.toFixed(4)}
                        </span>
                        {tip.signature && (
                          <a
                            href={`https://explorer.solana.com/tx/${tip.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="solana-address mt-1 flex items-center gap-1 text-[10px] opacity-70 transition-opacity hover:opacity-100"
                          >
                            {shortSig(tip.signature)}
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    {tip.message && (
                      <div
                        className="rounded-lg p-3"
                        style={{
                          background: "rgba(18,16,30,0.5)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <p className="text-xs italic text-[#d1d5db] line-clamp-3">
                          &ldquo;{tip.message}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <StatusNotification kind={status.kind} message={status.msg} />
      </div>
    </RequireAuth>
  );
}
