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
        "fixed top-32 left-[calc(50%+24rem)] hidden xl:block z-50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      <h4 className={cn(
          "font-serif text-lg mb-4 transition-opacity duration-300 text-gray-900",
          isHovered ? "opacity-100" : "opacity-0"
      )}>
        Table of Content
      </h4>

      <ul className="flex flex-col gap-3 relative">
        {headings.map((heading) => {
          const isActive = heading.id === activeId
          
          return (
            <li
              key={heading.id}
              className={cn(
                "transition-all duration-300",
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
                className={cn(
                    "flex items-center gap-3 group py-1 transition-opacity duration-300",
                    // Visibility Logic:
                    // Idle: Only active is visible. Others are invisible but take up space (opacity-0).
                    // Hover: All visible.
                    isHovered || isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {/* Indicator */}
                <span 
                    className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isActive 
                        ? "w-6 bg-gray-900" // Active: Longer & Darker
                        : "w-3 bg-gray-300 group-hover:bg-gray-400" // Inactive: Short & Light
                    )}
                />
                
                {/* Text */}
                <span
                  className={cn(
                    "text-sm font-serif transition-colors duration-300 whitespace-nowrap",
                    isActive ? "text-black font-medium" : "text-gray-500 group-hover:text-gray-700"
                  )}
                >
                  {heading.text}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
