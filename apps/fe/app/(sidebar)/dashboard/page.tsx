"use client";

import RequireAuth from "../../../components/RequireAuth";
import { useCreators } from "../../../hooks/creators";
import Link from "next/link";

function CreatorCard({ creator }: { creator: any }) {
  const initials = (creator.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <Link href={`/creator/${creator.id}`} className="creator-card group" id={`creator-${creator.id}`}>
      <div className="flex items-start justify-between">
        <div className="creator-card-avatar">
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">{initials}</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#00f0ff] font-bold">Creator</span>
          <span className="text-xs text-[#a0a0b0] opacity-50">#{creator.id.slice(0, 4)}</span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
          {creator.displayName || "Unnamed"}
        </h3>
        <p className="text-sm text-[#a0a0b0] line-clamp-2 mt-1 min-h-[40px]">
          {creator.bio || "No bio description available for this creator."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#a0a0b0] font-bold">Earnings</span>
          <span className="text-sm font-bold text-white">{creator.totalTips.toFixed(2)} SOL</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#a0a0b0] font-bold">Tips</span>
          <span className="text-sm font-bold text-white">{creator.tipCount || 0}</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export default function DashboardPage() {
  const { creators, loading } = useCreators();

  return (
    <RequireAuth>
      <div id="feed-page" className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl landing-gradient">
            Discover Creators
          </h1>
          <p className="text-[#a0a0b0] mt-2 font-medium">Support the community with instant devnet SOL tips</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="creator-card opacity-50">
                <div className="wallet-skeleton w-12 h-12 rounded-full mb-4" />
                <div className="wallet-skeleton h-6 w-3/4 mb-2" />
                <div className="wallet-skeleton h-4 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="wallet-skeleton h-8 w-full" />
                  <div className="wallet-skeleton h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="card text-center py-20 flex flex-col items-center gap-4">
            <span className="text-4xl opacity-50">🎨</span>
            <h3 className="text-xl font-bold">No creators found</h3>
            <p className="text-[#a0a0b0]">The platform is currently waiting for the first wave of creators.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
