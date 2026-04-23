"use client";

import Link from "next/link";
import {
  AlertCircle,
  AtSign,
  Lock,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { signin } from "../../lib/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token, user } = await signin({ email, password });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        className="fixed inset-0 z-0 pointer-events-none print:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.1) 0%, transparent 60%)",
        }}
      />
      <section className="dashboard-panel relative z-10 mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div
              className="animate-pulse-glow-staking relative mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,118,110,0.08))",
                border: "1px solid rgba(37,99,235,0.18)",
                boxShadow:
                  "0 0 30px rgba(37,99,235,0.1), 0 0 0 8px rgba(37,99,235,0.04)",
              }}
            >
              <img
                src="/logo.png"
                alt="MPC Wallet Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
            Sign in
          </h1>
          <p className="mt-2 text-slate-600">
            Access your MPC-protected Solana wallet.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Email address
            </label>
            <div className="relative">
              <AtSign
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="dashboard-input !pl-11"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-200/80" />

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="dashboard-input !pl-11"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            disabled={loading}
            className="btn btn-primary mt-2 w-full"
            type="submit"
          >
            <LockKeyhole size={16} />
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.12)",
            }}
          >
            <ShieldCheck size={14} className="text-[#2563eb]" />
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-slate-600">
              Protected by multi-party computation
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
