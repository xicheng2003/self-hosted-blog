import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"

export default function SubscriptionConfirmedPage() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="site-content subscription-result">
        <p className="eyebrow">Subscription · 订阅</p>
        <h1>订阅已经确认。</h1>
        <p>下一篇文章发布后，我会把它送到你的邮箱。你可以随时通过邮件底部的链接取消订阅。</p>
        <Link className="text-link" href="/">返回博客 <span>→</span></Link>
      </main>
      <SiteFooter />
    </div>
  )
}
