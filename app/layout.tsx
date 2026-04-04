import type { Metadata } from "next";
import "./globals.css";
import 'highlight.js/styles/github-dark.css';
import { Toaster } from "@/components/ui/sonner"
import NextTopLoader from 'nextjs-toploader';

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
      <body className="antialiased">
        <NextTopLoader color="#2299DD" showSpinner={false} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
