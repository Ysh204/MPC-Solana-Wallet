"use client";

import Link from "next/link";
import { AlertCircle, AtSign, Lock, LockKeyhole, ShieldCheck } from "lucide-react";
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
      <div className="fixed inset-0 z-0 bg-[#050507]/80" />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        }}
      />
      <section className="dashboard-panel relative z-10 mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div
              className="animate-pulse-glow-staking relative mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius)]"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(98,214,255,0.1))",
                border: "1px solid rgba(139,92,246,0.25)",
                boxShadow: "0 0 40px rgba(139,92,246,0.2), 0 0 0 8px rgba(139,92,246,0.06)",
              }}
            >
              <img src="/logo.png" alt="MPC Wallet Logo" className="h-12 w-12 object-contain" />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-[#9aa3b2]">Access your MPC-protected Solana wallet.</p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Email address
            </label>
            <div className="relative">
              <AtSign
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f747c]"
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

          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }} />

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f747c]"
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
            <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button disabled={loading} className="btn btn-primary mt-2 w-full" type="submit">
            <LockKeyhole size={16} />
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: "rgba(98,214,255,0.04)",
              border: "1px solid rgba(98,214,255,0.1)",
            }}
          >
            <ShieldCheck size={14} className="text-[#62d6ff]" />
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#7db8c0]">
              Protected by multi-party computation
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
