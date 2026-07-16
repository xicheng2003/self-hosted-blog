import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"

export default function InvalidSubscriptionPage() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="site-content subscription-result">
        <p className="eyebrow">Subscription · 订阅</p>
        <h1>确认链接无效或已经过期。</h1>
        <p>请回到博客重新提交邮箱，我们会发送一封新的确认邮件。</p>
        <Link className="text-link" href="/#subscribe">重新订阅 <span>→</span></Link>
      </main>
      <SiteFooter />
    </div>
  )
}
