const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

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

function backendUnavailableMessage(pathname: string) {
  return `Cannot reach backend at ${BASE}${pathname}. Make sure the backend server is running and NEXT_PUBLIC_BACKEND_URL is correct.`;
}

async function request(pathname: string, init?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${pathname}`, init);
    return handle(res);
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error(backendUnavailableMessage(pathname));
    }

    throw error;
  }
}

export async function signin(body: {
  email: string;
  password: string;
}): Promise<{ token: string }> {
  const j = await request("/user/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { token: j.token };
}

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: string;
}

export async function getWallet(token: string): Promise<WalletInfo> {
  return request("/user/wallet", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendSol(
  token: string,
  body: { to: string; amount: number }
): Promise<{ signature: string }> {
  return request("/user/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
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
  return request("/user/transactions", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
