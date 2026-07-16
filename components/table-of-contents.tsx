"use client"

import { useEffect, useState } from "react"

type Heading = {
  id: string
  text: string
  level: number
}

function headingId(element: Element, index: number) {
  const base =
    element.textContent
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fff-]/g, "") || `section-${index + 1}`
  return `${base}-${index + 1}`
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".post-content h2, .post-content h3"))
    const items = elements.map((element, index) => {
      if (!element.id) element.id = headingId(element, index)
      return {
        id: element.id,
        text: element.textContent || "",
        level: Number(element.tagName.slice(1)),
      }
    })
    setHeadings(items)
    setActiveId(items[0]?.id ?? "")

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: "-15% 0% -70% 0%" },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="article-toc" aria-label="文章目录">
      <p>On this page</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
