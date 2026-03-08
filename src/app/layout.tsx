import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DESK AI — 男を磨くデスク診断",
  description:
    "AIがあなたの仕事環境を診断し、男を磨くデスクスコアを可視化。最適なアイテムTOP10ランキングを即時生成。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-neutral-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
