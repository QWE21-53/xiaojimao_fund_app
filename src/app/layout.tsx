import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '基金实时估值',
  description: '基于东方财富网数据的基金实时估值系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
