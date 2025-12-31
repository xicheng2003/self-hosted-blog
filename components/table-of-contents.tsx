"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TableOfContentsProps {
  className?: string
}

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".post-content h1, .post-content h2"))
    const items = elements.map((elem) => {
      if (!elem.id) {
        elem.id = elem.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "") || ""
      }
      return {
        id: elem.id,
        text: elem.textContent || "",
        level: Number(elem.tagName.substring(1)),
      }
    })
    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0% 0% -80% 0%" }
    )

    elements.forEach((elem) => observer.observe(elem))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav
      className={cn(
        "fixed right-8 top-1/2 -translate-y-1/2 hidden xl:block transition-all duration-300 ease-in-out",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Title */}
        <h4 className={cn(
            "font-serif text-lg mb-4 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
        )}>
          Table of Content
        </h4>

        <ul className="space-y-3 relative">
          {headings.map((heading) => {
            const isActive = heading.id === activeId
            // Logic: Show if hovered OR if it's the active item
            // But user asked: "not hover state shows current H1 and H2"
            // Actually, usually "current" means the active one. 
            // Let's interpret "current" as the active one.
            // If not hovered, we hide non-active items to mimic the "collapsed" look, 
            // or maybe we just dim them?
            // Looking at the reference image 1 (collapsed): It shows 4 items, but they look like dashes. One has an icon and text.
            // Reference image 2 (expanded): Shows title "Table of Content" and items with icons/text.
            
            // Let's try to replicate the visual style:
            // Collapsed: Just dashes for inactive, Icon+Text for active.
            // Expanded: Text for all.
            
            return (
              <li
                key={heading.id}
                className={cn(
                  "transition-all duration-300 flex items-center gap-3 cursor-pointer",
                  heading.level === 2 ? "ml-4" : ""
                )}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                    setActiveId(heading.id)
                  }}
                  className="flex items-center gap-3 group"
                >
                  {/* The Dash / Indicator */}
                  <span 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      isActive 
                        ? "w-8 bg-gray-400" // Active dash style
                        : "w-4 bg-gray-700/30 group-hover:bg-gray-400" // Inactive dash style
                    )}
                  />
                  
                  {/* The Text - Visible if hovered OR if active */}
                  <span
                    className={cn(
                      "text-sm font-serif transition-all duration-300 whitespace-nowrap",
                      isActive ? "text-black font-medium opacity-100 translate-x-0" : "text-gray-500",
                      !isHovered && !isActive ? "opacity-0 -translate-x-4 pointer-events-none absolute left-6" : "opacity-100 translate-x-0"
                    )}
                  >
                    {heading.text}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
