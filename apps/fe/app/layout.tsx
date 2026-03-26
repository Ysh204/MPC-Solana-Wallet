import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TipJar — Creator Tipping Platform",
  description: "Support your favorite creators with instant SOL tips, secured by MPC wallets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
