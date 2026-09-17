import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garba Workshop | Joy Kids Care",
  description: "Register for the Joy Kids Care Garba Workshop, 28–30 September 2026, 6–7 PM.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
