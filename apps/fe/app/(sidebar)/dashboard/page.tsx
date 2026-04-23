"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProfile, type UserProfile } from "../../../lib/api";
import { useTransactions, useWallet } from "../../../hooks/wallet";

function shortAddr(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function fmtTime(unix: number | null) {
  if (!unix) return "Pending";
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="btn btn-ghost px-3 py-2 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Copy size={14} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const {
    wallet,
    loading: walletLoading,
    error: walletError,
    notFound,
    refresh: refreshWallet,
  } = useWallet();
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refresh: refreshTransactions,
  } = useTransactions();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getProfile(token)
      .then((res) => setProfile(res.user))
      .catch((error: Error) => setProfileError(error.message));
  }, []);

  const summary = useMemo(() => {
    const successful = transactions.filter((tx) => !tx.err).length;

    return {
      total: transactions.length,
      successful,
      failed: transactions.length - successful,
    };
  }, [transactions]);

  function handleRefresh() {
    refreshWallet();
    refreshTransactions();
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1500px]" id="wallet-overview">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/78 p-8 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] print:hidden [background-image:linear-gradient(to_right,rgba(15,23,42,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-0 print:hidden bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.09),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.07),transparent_60%)]" />

          <div className="relative z-10 w-full">
            <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="dashboard-chip dashboard-chip-strong mb-4">
                  <ShieldCheck size={14} />
                  Wallet command center
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  MPC wallet <span className="landing-gradient">overview</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-600">
                  This workspace is now focused on MPC-backed wallet operations:
                  account provisioning, balance checks, secure transfers, and
                  transaction visibility.
                </p>
              </div>

              <button
                className={`flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900 ${
                  walletLoading || txLoading ? "opacity-70" : ""
                }`}
                onClick={handleRefresh}
                disabled={walletLoading || txLoading}
              >
                <RefreshCcw
                  size={15}
                  className={walletLoading || txLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </header>

            {(walletError || txError || profileError) && (
              <div className="status-bar status-error relative mb-6">
                {walletError || txError || profileError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <ScrollReveal>
                <div className="dashboard-panel flex flex-col gap-6 text-left">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Account
                      </p>
                      <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                        {profile?.displayName ||
                          profile?.email ||
                          "Wallet user"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {wallet?.publicKey
                          ? "Your public key was aggregated from MPC participants and is ready for transfers."
                          : "An administrator still needs to provision your MPC wallet."}
                      </p>
                    </div>
                    <div className="dashboard-chip">
                      {wallet?.network || "devnet"}
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-sm)] border border-slate-200 bg-white/90 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Public key
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <code className="solana-address text-sm">
                        {wallet?.publicKey ||
                          profile?.publicKey ||
                          "Wallet not initialized"}
                      </code>
                      {(wallet?.publicKey || profile?.publicKey) && (
                        <CopyButton
                          text={wallet?.publicKey || profile?.publicKey || ""}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Balance
                      </p>
                      <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {walletLoading
                          ? "..."
                          : wallet
                            ? wallet.balance.toFixed(4)
                            : "0.0000"}
                        <span className="ml-2 text-sm text-slate-600">SOL</span>
                      </p>
                    </div>
                    <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Transactions
                      </p>
                      <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {txLoading ? "..." : summary.total}
                      </p>
                    </div>
                    <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Successful
                      </p>
                      <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {txLoading ? "..." : summary.successful}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="dashboard-panel flex h-full flex-col justify-between text-left">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Quick actions
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                      Open the wallet workspace
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Jump into transfers, review the latest signatures, or
                      update your profile metadata.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Link href="/wallet" className="tip-row group">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Wallet operations
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Send SOL and inspect recent on-chain history.
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="ml-auto text-[#2563eb] transition group-hover:translate-x-1"
                      />
                    </Link>

                    <Link href="/settings" className="tip-row group">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Profile settings
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Update the display name, avatar, and bio attached to
                          your account.
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="ml-auto text-[#2563eb] transition group-hover:translate-x-1"
                      />
                    </Link>
                  </div>

                  <div className="mt-6 rounded-[var(--radius-sm)] border border-slate-200 bg-white/90 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Provisioning
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      If your wallet is missing, ask an admin to create the
                      account through the backend provisioning flow and then
                      refresh this page.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <ScrollReveal>
                <div className="dashboard-panel flex h-full flex-col text-left">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                      <WalletCards size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Recent activity
                      </p>
                      <h2 className="text-xl font-extrabold text-slate-950">
                        Latest transactions
                      </h2>
                    </div>
                  </div>

                  {notFound ? (
                    <div className="rounded-[var(--radius)] border border-dashed border-slate-300 py-14 text-center text-sm text-slate-600">
                      Wallet provisioning is still pending.
                    </div>
                  ) : txLoading ? (
                    <div className="flex flex-col gap-3">
                      {[...Array(4)].map((_, index) => (
                        <div
                          key={index}
                          className="wallet-skeleton h-16 w-full rounded-[var(--radius-sm)]"
                        />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="rounded-[var(--radius)] border border-dashed border-slate-300 py-14 text-center text-sm text-slate-600">
                      No transactions have been signed yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {transactions.slice(0, 5).map((tx) => (
                        <a
                          key={tx.signature}
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="tip-row group"
                        >
                          <div className="min-w-0">
                            <p className="solana-address text-sm">
                              {shortAddr(tx.signature)}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {fmtTime(tx.blockTime)}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                tx.err
                                  ? "border-[#fb7185]/20 bg-[#fb7185]/10 text-[#fb7185]"
                                  : "border-[#4ade80]/20 bg-[#4ade80]/10 text-[#4ade80]"
                              }`}
                            >
                              {tx.err ? "Failed" : "Success"}
                            </span>
                            <ExternalLink
                              size={14}
                              className="text-slate-400 transition group-hover:text-[#2563eb]"
                            />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="dashboard-panel flex h-full flex-col text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                    MPC flow
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    How this wallet signs transfers
                  </h2>
                  <div className="mt-6 grid gap-4">
                    {[
                      "An admin provisions a wallet user and the MPC node stores a single key share for that account.",
                      "The backend collects nonce commitments and partial signatures from the configured MPC participants.",
                      "The aggregated signature is broadcast to Solana and the wallet UI surfaces the resulting transaction history.",
                    ].map((step, index) => (
                      <div
                        key={step}
                        className="dashboard-soft-panel rounded-[var(--radius-md)] p-4"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Step {index + 1}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
