"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  RefreshCcw,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import StatusNotification from "../../../components/StatusNotification";
import { useTransactions, useWallet } from "../../../hooks/wallet";
import { sendSol } from "../../../lib/api";

function shortAddr(addr: string) {
  return addr.slice(0, 8) + "..." + addr.slice(-4);
}

function fmtTime(unix: number | null) {
  if (!unix) return "—";
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

function AccountInfo({
  publicKey,
  balance,
  network,
  loading,
  onRefresh,
}: {
  publicKey: string;
  balance: number;
  network: string;
  loading: boolean;
  onRefresh: () => void;
}) {
  const approxUsd = balance * 182.5;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" id="account-info">
      <div className="dashboard-panel flex flex-col relative text-left dashboard-grid-bg min-h-[230px]">
        <div className="relative z-10 flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                  Main account
                </p>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                MPC Vault
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[#8da3ab]">
                A denser wallet summary with the same secure MPC-backed account details.
              </p>
            </div>
            <button
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/70 transition hover:border-[#b58cff]/20 hover:text-[#b58cff] ${
                loading ? "animate-spin" : ""
              }`}
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div>
            <div className="solana-address rounded-[var(--radius-sm)] border border-white/6 bg-[#071116] p-4 text-sm leading-7">
              {loading ? "Loading secure key..." : publicKey}
            </div>
            <p className="mt-2 text-[10px] text-[#5f747c]">44 characters · Solana base58</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!loading && <CopyButton text={publicKey} />}
            <div className="dashboard-chip">
              <ShieldCheck size={14} />
              {network}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="dashboard-panel flex flex-col relative text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Available balance
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-[#b58cff]">◎</span>
            <span className="landing-gradient font-mono text-5xl font-extrabold tracking-tight">
              {loading ? "..." : balance.toFixed(4)}
            </span>
            <span className="mb-1 text-sm font-bold text-[#b58cff]">SOL</span>
          </div>
          <p className="mt-3 text-sm text-[#8ba1a9]">
            ≈ ${loading ? "..." : approxUsd.toFixed(2)}{" "}
            <span className="text-xs text-[#5f747c]">· estimated</span>
          </p>
        </div>

        <div className="dashboard-panel flex flex-col relative text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Wallet status
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#4ade80] shadow-[0_0_18px_#4ade80]" />
            <span className="text-lg font-extrabold text-white">Connected</span>
          </div>
          <p className="mt-3 text-sm text-[#8ba1a9]">
            Enterprise-grade wallet controls with a tighter dashboard presentation.
          </p>
        </div>
      </div>
    </div>
  );
}

function SendForm({
  onStatus,
}: {
  onStatus: (kind: "success" | "error" | "loading" | "", msg: string) => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    onStatus("loading", "Signing and broadcasting transaction...");
    setSending(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const { signature } = await sendSol(token, { to, amount: parseFloat(amount) });
      onStatus("success", `Transaction confirmed: ${signature.slice(0, 14)}...`);
      setTo("");
      setAmount("");
    } catch (err: any) {
      onStatus("error", err?.message || "Transaction failed");
    } finally {
      setSending(false);
      setTimeout(() => onStatus("", ""), 6000);
    }
  }

  return (
    <div className="dashboard-panel flex flex-col relative text-left h-full" id="send-sol">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
          <Send size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Secure transfer
          </p>
          <h2 className="text-xl font-extrabold text-white">Send SOL</h2>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Recipient address
          </label>
          <input
            className="dashboard-input"
            placeholder="Enter Solana address (44 chars)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Amount
          </label>
          <div className="relative rounded-[var(--radius-sm)] border border-white/8 bg-[#071116] p-1">
            <input
              className="dashboard-input border-0 bg-transparent pr-16 text-2xl"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#5f747c]">
              SOL
            </span>
          </div>
        </div>

        <div className="dashboard-panel flex flex-col relative text-left rounded-[var(--radius-sm)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
            Execution notes
          </p>
          <p className="mt-2 text-sm leading-6 text-[#8ca1a8]">
            Transfers use the same backend wallet flow, now framed in the darker reference-inspired panel style.
          </p>
        </div>

        <button disabled={sending} className="btn btn-primary mt-2 w-full" type="submit">
          <Send size={16} />
          {sending ? "Processing..." : "Execute transfer"}
        </button>
      </form>
    </div>
  );
}

function TransactionList({
  transactions,
  loading,
}: {
  transactions: any[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    if (filter === "success") return transactions.filter((tx: any) => !tx.err);
    return transactions.filter((tx: any) => tx.err);
  }, [transactions, filter]);

  return (
    <div className="dashboard-panel flex flex-col relative text-left h-full" id="history">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
            <WalletCards size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Latest batches
            </p>
            <h2 className="text-xl font-extrabold text-white">Transaction history</h2>
          </div>
        </div>
        <div className="dashboard-chip">Devnet</div>
      </div>

      {/* ── Filter chips ── */}
      <div className="mb-4 flex gap-2">
        {(["all", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition ${
              filter === f
                ? "dashboard-chip-strong"
                : "text-[#81979f] hover:text-white"
            }`}
            style={
              filter === f
                ? {
                    background: "rgba(139,92,246,0.055)",
                    border: "1px solid rgba(139,92,246,0.12)",
                    color: "var(--accent)",
                  }
                : {
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="wallet-skeleton h-16 w-full rounded-[var(--radius-sm)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-white/10 py-14 text-center text-sm text-[#8ba1a9]">
          No wallet activity found yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((tx: any) => (
            <a
              key={tx.signature}
              href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="tip-row group"
            >
              <div className="min-w-0">
                <p className="solana-address text-sm">{shortAddr(tx.signature)}</p>
                <p className="mt-1 text-[11px] text-[#5f747c]">
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
                  className="text-white/50 transition group-hover:text-[#b58cff]"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
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
    refresh: refreshTx,
  } = useTransactions();
  const [status, setStatus] = useState({ kind: "" as any, msg: "" });

  const summary = useMemo(() => {
    const successful = transactions.filter((tx: any) => !tx.err).length;
    return {
      total: transactions.length,
      successful,
    };
  }, [transactions]);

  function handleRefresh() {
    refreshWallet();
    refreshTx();
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1500px]" id="wallet-dashboard">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-black/20 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/[0.04]">
          {/* ── Background Grid ── */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* ── Ambient Radial Glows ── */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

          <div className="relative z-10 w-full">
            <header className="mb-8">
              <div>
                <div className="dashboard-chip dashboard-chip-strong mb-4">Vault operations</div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Solana <span className="landing-gradient text-glow-staking">Wallet</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base text-[#8aa1a9]">
                  Powered by a secure MPC wallet, this dashboard provides a comprehensive view of your
                  account details, transaction history, and transfer capabilities.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="dashboard-chip dashboard-chip-strong">
                    <span className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_12px_#4ade80]" />
                    Solana Devnet
                  </div>
                  <div className="dashboard-chip">{summary.total} tracked transactions</div>
                  <div className="dashboard-chip">{summary.successful} successful</div>
                </div>
              </div>
            </header>

            {loadingOrNotFound(walletLoading, notFound, refreshWallet)}

            {walletError && !notFound && (
              <div className="status-bar status-error relative mb-6">{walletError}</div>
            )}
            {txError && !txLoading && (
              <div className="status-bar status-error relative mb-6">{txError}</div>
            )}

            {!notFound && !walletLoading && wallet && (
              <div className="grid grid-cols-1 gap-6">
                <ScrollReveal>
                  <AccountInfo
                    publicKey={wallet.publicKey}
                    balance={wallet.balance}
                    network={wallet.network}
                    loading={false}
                    onRefresh={handleRefresh}
                  />
                </ScrollReveal>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <ScrollReveal>
                    <SendForm onStatus={(kind, msg) => setStatus({ kind, msg })} />
                  </ScrollReveal>

                  <ScrollReveal className="h-full">
                    <TransactionList transactions={transactions} loading={txLoading} />
                  </ScrollReveal>
                </div>
              </div>
            )}

            <StatusNotification kind={status.kind} message={status.msg} />
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}

function loadingOrNotFound(loading: boolean, notFound: boolean, onRefresh: () => void) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#8b5cf6]/40 border-t-[#b58cff]" />
        <span className="text-xs font-bold uppercase tracking-[0.26em] text-[#b58cff]">
          Syncing vault data
        </span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col relative dashboard-panel mx-auto mt-12 max-w-2xl items-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <ShieldCheck size={30} className="text-white/45" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Vault not initialized</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#8ba1a9]">
            Your MPC wallet has not been provisioned yet. Contact an administrator and then refresh
            to verify access.
          </p>
        </div>
        <button className="btn btn-outline px-8" onClick={onRefresh}>
          Re-check wallet
        </button>
      </div>
    );
  }

  return null;
}
