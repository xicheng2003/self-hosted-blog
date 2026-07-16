"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"

import { MenuIcon } from "@/components/icons/menu-icon"
import { siteConfig } from "@/content/site"

export function SiteNav({ animate = false }: { animate?: boolean }) {
  const pathname = usePathname()
  const menuId = useId()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuLabel = isMenuOpen ? "关闭导航菜单" : "打开导航菜单"

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header
      className={`site-topbar${animate ? " reveal" : ""}`}
      data-menu-open={isMenuOpen ? "true" : "false"}
    >
      <a className="site-brand" href={siteConfig.homeUrl} onClick={closeMenu}>
        {siteConfig.name}
      </a>

      <button
        type="button"
        className="nav-menu-toggle"
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={menuLabel}
        aria-controls={menuId}
        aria-expanded={isMenuOpen}
        title={menuLabel}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <MenuIcon />
      </button>

      <nav id={menuId} className="site-navigation" aria-label="主导航">
        <a href={siteConfig.homeUrl} onClick={closeMenu}>关于</a>
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          onClick={closeMenu}
        >
          博客
        </Link>
        <Link
          href="/posts"
          aria-current={pathname.startsWith("/posts") ? "page" : undefined}
          onClick={closeMenu}
        >
          归档
        </Link>
      </nav>
    </header>
  )
}
