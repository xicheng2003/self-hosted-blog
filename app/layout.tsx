import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'highlight.js/styles/github-dark.css';
import { Toaster } from "@/components/ui/sonner"
import NextTopLoader from 'nextjs-toploader';

const geistSans = localFont({
  src: "./fonts/Geist[wght].woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "sans-serif"],
})

const geistMono = localFont({
  src: "./fonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
})

const notoSerifSC = localFont({
  variable: "--font-noto-serif-sc",
  display: "swap",
  fallback: ["Source Han Serif SC", "Songti SC", "SimSun", "Times New Roman", "serif"],
  src: [
    {
      path: "./fonts/NotoSerifCJKsc-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifCJKsc-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifCJKsc-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifCJKsc-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
})

export const metadata: Metadata = {
  title: "晨曦的博客",
  description: "A self-hosted blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} antialiased`}>
        <NextTopLoader color="#2299DD" showSpinner={false} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
