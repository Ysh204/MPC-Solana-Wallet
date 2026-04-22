function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  return "http://localhost:3000";
}

async function handle(res: Response) {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function signin(body: { email: string; password: string }): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    publicKey: string | null;
  };
}> {
  const res = await fetch(`${getBaseUrl()}/user/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await handle(res);
  return { token: j.token, user: j.user };
}

/* ── Profile ────────────────────────────────── */

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  publicKey: string | null;
  createdAt: string;
}

export async function getProfile(token: string): Promise<{ user: UserProfile }> {
  const res = await fetch(`${getBaseUrl()}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function updateProfile(token: string, body: { displayName: string; bio?: string; avatarUrl?: string }) {
  const res = await fetch(`${getBaseUrl()}/user/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return handle(res);
}

/* ── Wallet ─────────────────────────────────── */

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: string;
}

export async function getWallet(token: string): Promise<WalletInfo> {
  const res = await fetch(`${getBaseUrl()}/user/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function sendSol(token: string, body: { to: string; amount: number }): Promise<{ signature: string }> {
  const res = await fetch(`${getBaseUrl()}/user/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export interface Transaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string;
  err: boolean;
  memo: string | null;
}

export async function getTransactions(token: string): Promise<{ transactions: Transaction[] }> {
  const res = await fetch(`${getBaseUrl()}/user/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}
