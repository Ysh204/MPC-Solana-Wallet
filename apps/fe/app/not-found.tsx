"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black text-slate-950">404 - Not Found</h2>
      <p className="mt-2 text-slate-600">
        Could not find the requested resource.
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        Return Home
      </Link>
    </div>
  );
}
