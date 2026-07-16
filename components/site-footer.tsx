import Image from "next/image"

import { ThemeControls } from "@/components/theme-controls"
import { siteConfig } from "@/content/site"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-meta">
        <p className="footer-copyright">
          <span>©</span>
          <span className="footer-brand">{siteConfig.name}</span>
          <span>since 2023</span>
        </p>
        <div className="footer-records">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
            {siteConfig.icpRecord}
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/foot-ga.png" alt="" aria-hidden width={14} height={16} />
            <span>{siteConfig.publicSecurityRecord}</span>
          </a>
        </div>
      </div>

      <ThemeControls />
    </footer>
  )
}
