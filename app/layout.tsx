import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jadwal Kuliah Semester 5 | Angga Baihaki Yudistira',
  description:
    'Jadwal Kuliah Semester 5 Program Studi Teknologi Informasi S1 — Angga Baihaki Yudistira (NIM 24051130093)',
  keywords: ['jadwal kuliah', 'semester 5', 'teknologi informasi', 'UNY'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
