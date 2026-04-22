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
  Trash2,
  Plus,
  Percent
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProfile, updateProfile, UserProfile, getSplits, addSplit, deleteSplit, RevenueSplit } from "../../../lib/api";

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

  const [splits, setSplits] = useState<RevenueSplit[]>([]);
  const [newSplitLabel, setNewSplitLabel] = useState("");
  const [newSplitAddress, setNewSplitAddress] = useState("");
  const [newSplitPercentage, setNewSplitPercentage] = useState("");
  const [splitStatus, setSplitStatus] = useState<{
    kind: "success" | "error" | "loading" | "";
    msg: string;
  }>({ kind: "", msg: "" });

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [profileData, splitsData] = await Promise.all([
          getProfile(token).catch(e => { console.error(e); return { user: null }; }),
          getSplits(token).catch(e => { console.error(e); return { splits: [] }; })
        ]);
        
        if (profileData.user) {
          setProfile(profileData.user);
          setDisplayName(profileData.user.displayName || "");
          setBio(profileData.user.bio || "");
          setAvatarUrl(profileData.user.avatarUrl || "");
        }

        if (splitsData.splits) {
          setSplits(splitsData.splits);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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

  async function handleAddSplit(e: React.FormEvent) {
    e.preventDefault();
    setSplitStatus({ kind: "loading", msg: "Adding split..." });

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const percentage = parseFloat(newSplitPercentage);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        throw new Error("Invalid percentage");
      }
      const res = await addSplit(token, {
        collaboratorAddress: newSplitAddress,
        label: newSplitLabel,
        percentage
      });

      setSplits([...splits, res.split]);
      setNewSplitLabel("");
      setNewSplitAddress("");
      setNewSplitPercentage("");
      setSplitStatus({ kind: "success", msg: "Split added successfully." });
      setTimeout(() => setSplitStatus({ kind: "", msg: "" }), 2000);
    } catch (err: any) {
      setSplitStatus({ kind: "error", msg: err?.message || "Failed to add split" });
      setTimeout(() => setSplitStatus({ kind: "", msg: "" }), 4000);
    }
  }

  async function handleDeleteSplit(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Are you sure you want to remove this collaborator?")) return;

    try {
      await deleteSplit(token, id);
      setSplits(splits.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete split");
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
        <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-black/20 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/[0.04]">
          {/* ── Background Grid ── */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* ── Ambient Radial Glows ── */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

          <div className="relative z-10 w-full">
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

            {profile?.role === "CREATOR" && (
              <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                <div className="dashboard-panel">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius)]"
                      style={{
                        border: "1px solid rgba(168,85,247,0.2)",
                        background: "#0f1822",
                      }}
                    >
                      <Percent className="text-[#c084fc]" size={28} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Revenue Sharing
                      </p>
                      <h2 className="text-2xl font-extrabold text-white">
                        Revenue Splits
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                      <p className="text-sm leading-6 text-[#8ba1a9]">
                        Distribute a percentage of every tip you receive directly to collaborators, charities, or other wallets. The transaction is instantly split using Multi-Party Computation (MPC).
                      </p>
                    </div>
                    {splits.length > 0 && (
                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <p className="text-sm font-bold text-white mb-2">Current Breakdown</p>
                        <div className="space-y-2">
                          {splits.map(s => (
                             <div key={s.id} className="flex items-center justify-between text-sm p-3 bg-white/[0.02] rounded-md border border-white/5 transition-colors hover:bg-white/[0.04]">
                               <div>
                                 <p className="text-white font-medium">{s.label} <span className="text-[#8ba1a9]">({s.percentage}%)</span></p>
                                 <p className="text-[#5f747c] text-xs font-mono tracking-wider mt-1">{s.collaboratorAddress}</p>
                               </div>
                               <button onClick={() => handleDeleteSplit(s.id)} className="text-[#fb7185]/70 hover:text-[#fb7185] transition-colors p-2" title="Remove Collaborator">
                                 <Trash2 size={16} />
                               </button>
                             </div>
                          ))}
                          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-sm font-bold text-[#8ba1a9]">
                             <span>Total Allocated</span>
                             <span className={splits.reduce((a,b) => a+b.percentage, 0) > 100 ? "text-[#fb7185]" : "text-white"}>{splits.reduce((a,b) => a+b.percentage, 0)}%</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-[#8ba1a9]">
                             <span>Remaining for you</span>
                             <span className={splits.reduce((a,b) => a+b.percentage, 0) > 100 ? "text-[#fb7185]" : "text-[#4ade80]"}>{Math.max(0, 100 - splits.reduce((a,b) => a+b.percentage, 0))}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="dashboard-panel flex flex-col justify-center">
                  <form onSubmit={handleAddSplit} className="flex flex-col gap-5">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Collaborator Label
                      </label>
                      <input
                        className="dashboard-input"
                        placeholder="e.g. Co-Host, Charity Fund, Marketing Team"
                        value={newSplitLabel}
                        onChange={(e) => setNewSplitLabel(e.target.value)}
                        required
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Solana Address
                      </label>
                      <input
                        className="dashboard-input font-mono tracking-wider text-sm"
                        placeholder="e.g. 7X3k..."
                        value={newSplitAddress}
                        onChange={(e) => setNewSplitAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                        Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="dashboard-input"
                        placeholder="e.g. 15"
                        value={newSplitPercentage}
                        onChange={(e) => setNewSplitPercentage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          splitStatus.kind === "error"
                            ? "text-[#fb7185]"
                            : splitStatus.kind === "success"
                              ? "text-[#4ade80]"
                              : "text-[#8ba1a9]"
                        }`}
                      >
                        {splitStatus.msg || "Add to your on-chain revenue split."}
                      </span>

                      <button
                        type="submit"
                        disabled={splitStatus.kind === "loading" || splits.reduce((a,b) => a+b.percentage, 0) + parseFloat(newSplitPercentage || "0") > 100}
                        className={`btn px-8 ${splitStatus.kind === "loading" ? "btn-primary opacity-60" : "btn-primary"} ${splits.reduce((a,b) => a+b.percentage, 0) + parseFloat(newSplitPercentage || "0") > 100 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                         {splitStatus.kind === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                         {splitStatus.kind === "loading" ? "Adding..." : "Add Split"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </ScrollReveal>
        )}
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
