"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProfile, updateProfile, UserProfile } from "../../../lib/api";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [status, setStatus] = useState<{
    kind: "success" | "error" | "loading" | "";
    msg: string;
  }>({ kind: "", msg: "" });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getProfile(token);
        if (data.user) {
          setProfile(data.user);
          setDisplayName(data.user.displayName || "");
          setBio(data.user.bio || "");
          setAvatarUrl(data.user.avatarUrl || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading", msg: "Updating profile..." });

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateProfile(token, {
        displayName,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      setStatus({ kind: "success", msg: "Profile updated successfully." });

      if (profile) {
        setProfile({ ...profile, displayName, bio, avatarUrl });
      }

      // Auto-clear success after 2s
      setTimeout(() => setStatus({ kind: "", msg: "" }), 2000);
    } catch (err: any) {
      setStatus({ kind: "error", msg: err?.message || "Failed to update profile" });
      setTimeout(() => setStatus({ kind: "", msg: "" }), 4000);
    }
  }

  // Button state styles
  const buttonStyles = (() => {
    if (status.kind === "loading") return "btn btn-primary opacity-60 px-8";
    if (status.kind === "success")
      return "btn px-8 bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/25";
    if (status.kind === "error")
      return "btn px-8 bg-[#fb7185]/20 text-[#fb7185] border border-[#fb7185]/25";
    return "btn btn-primary px-8";
  })();

  const buttonIcon = (() => {
    if (status.kind === "loading") return <Loader2 size={16} className="animate-spin" />;
    if (status.kind === "success") return <CheckCircle size={16} />;
    if (status.kind === "error") return <AlertCircle size={16} />;
    return <Save size={16} />;
  })();

  const buttonText = (() => {
    if (status.kind === "loading") return "Saving...";
    if (status.kind === "success") return "Saved!";
    if (status.kind === "error") return "Error";
    return "Save changes";
  })();

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1350px]" id="settings-page">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="dashboard-chip dashboard-chip-strong mb-4">
              <Sparkles size={14} />
              Profile Center
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Profile <span className="landing-gradient">Settings</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
              Customize your identity, avatar, and bio to stand out across the platform.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#8b5cf6]/40 border-t-[#b58cff]" />
            <span className="text-xs font-bold uppercase tracking-[0.26em] text-[#b58cff]">
              Loading profile
            </span>
          </div>
        ) : (
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="dashboard-panel">
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius)]"
                    style={{
                      border: "1px solid rgba(139,92,246,0.2)",
                      background: "#0f1822",
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">
                        {(displayName || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Public appearance
                    </p>
                    <h2 className="text-2xl font-extrabold text-white">
                      {displayName || profile?.displayName || "Unnamed profile"}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* ── Section 1: Identity ── */}
                  <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                        <UserRound size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Identity</p>
                        <p className="text-xs text-[#80969e]">How other users will recognize you.</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-[#8ba1a9]">
                      Keep your display name and avatar polished so creators and supporters immediately recognize your account.
                    </p>
                  </div>

                  {/* ── Section 2: About ── */}
                  <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                        <FileText size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">About</p>
                        <p className="text-xs text-[#80969e]">Your bio shown on your profile.</p>
                      </div>
                    </div>
                    <p className="break-all text-sm leading-6 text-[#8ba1a9]">
                      {bio || "No bio added yet. Add one in the form to make your profile compelling."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel">
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                  {/* ── Display name with character counter ── */}
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Display name
                    </label>
                    <div className="relative">
                      <input
                        className="dashboard-input pr-16"
                        placeholder="e.g. Solana Builder"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        minLength={1}
                        maxLength={40}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#5f747c]">
                        {displayName.length}/40
                      </span>
                    </div>
                  </div>

                  {/* ── Avatar URL with live preview ── */}
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Avatar URL
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="flex flex-col items-center gap-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5f747c]">
                          Preview
                        </p>
                        <div
                          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                          style={{
                            border: "1px solid rgba(139,92,246,0.2)",
                            background: "#0f1822",
                          }}
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <User size={24} className="text-white/40" />
                          )}
                        </div>
                      </div>
                      <input
                        className="dashboard-input flex-1"
                        type="url"
                        placeholder="https://example.com/avatar.png"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }} />

                  {/* ── Bio textarea with character counter ── */}
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                      Bio
                    </label>
                    <textarea
                      className="dashboard-input min-h-[100px] resize-none"
                      style={{ fontFamily: "var(--sans)", height: "auto" }}
                      placeholder="Tell supporters about yourself, your project, or what you create..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={280}
                      rows={4}
                    />
                    <p className="mt-1 text-right text-[10px] text-[#5f747c]">
                      {bio.length}/280
                    </p>
                  </div>

                  {/* ── Save button with states ── */}
                  <div className="flex flex-col gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        status.kind === "error"
                          ? "text-[#fb7185]"
                          : status.kind === "success"
                            ? "text-[#4ade80]"
                            : "text-[#8ba1a9]"
                      }`}
                    >
                      {status.msg || "Changes will update your public profile immediately."}
                    </span>

                    <button
                      type="submit"
                      disabled={status.kind === "loading"}
                      className={buttonStyles}
                    >
                      {buttonIcon}
                      {buttonText}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </RequireAuth>
  );
}
