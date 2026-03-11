import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "xjm and xb",
  description: "Real-time mutual fund estimation based on market movement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
