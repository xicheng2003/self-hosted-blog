import type { Metadata, Viewport } from "next"
import Script from "next/script"
import NextTopLoader from "nextjs-toploader"

import { siteConfig } from "@/content/site"
import "./globals.css"
import "highlight.js/styles/github-dark.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteConfig.url}/rss.xml` },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
}

const themeScript = `
  try {
    const theme = localStorage.getItem('home-page.theme');
    const resolved = theme === 'dark' || theme === 'light'
      ? theme
      : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = resolved;
  } catch {}
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <NextTopLoader color="#969691" showSpinner={false} shadow={false} />
        {children}
      </body>
    </html>
  )
}
