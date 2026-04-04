"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type TimelineItem = {
  date: string
  title: string
  status: string
  description: string
  stack: string
  link?: string
  linkLabel?: string
}

type AboutSiteSectionProps = {
  items: readonly TimelineItem[]
}

export function AboutSiteSection({ items }: AboutSiteSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = contentRef.current

    if (!element) {
      return
    }

    const updateHeight = () => {
      setContentHeight(element.scrollHeight)
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="mb-16 animate-enter-up delay-300">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="group flex w-full items-center gap-4 text-left text-gray-400 transition-colors duration-200 hover:text-gray-500"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-inherit">
            关于本站
          </h3>
          <ArrowRight
            size={14}
            className={cn(
              "shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isOpen ? "rotate-90 translate-x-0" : "translate-x-0 group-hover:translate-x-1",
            )}
          />
        </div>
        <div className="h-[1px] flex-1 bg-gray-200 transition-colors duration-200 group-hover:bg-gray-300" />
      </button>

      <div
        className="overflow-hidden transition-[max-height,margin-top] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          marginTop: isOpen ? "1.25rem" : "0rem",
          maxHeight: isOpen ? `${contentHeight}px` : "0px",
        }}
      >
        <div
          ref={contentRef}
          className={cn(
            "space-y-10 transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
          )}
        >
          {items.map((item) => {
            const isCurrent = item.status === "现行"

            return (
              <article
                key={item.title}
                className="grid grid-cols-1 gap-3 md:grid-cols-[110px_1fr] md:gap-8"
              >
                <div
                  className={cn(
                    "font-sans text-sm tabular-nums tracking-wide md:pt-1",
                    isCurrent ? "text-gray-500" : "text-gray-300",
                  )}
                >
                  {item.date}
                </div>

                <div
                  className={cn(
                    "relative space-y-3 pl-6 md:pl-8",
                    isCurrent ? "border-l border-gray-200" : "border-l border-gray-100",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-2 h-[9px] w-[9px] rounded-full ring-4 ring-[#fafafa]",
                      isCurrent
                        ? "-left-[5px] bg-gray-900"
                        : "-left-[6px] border border-gray-300 bg-[#fafafa]",
                    )}
                  />

                  <div className="flex items-center gap-3">
                    <h4
                      className={cn(
                        "font-serif text-xl leading-tight md:text-[1.5rem]",
                        isCurrent ? "text-gray-900" : "text-gray-700",
                      )}
                    >
                      {item.title}
                    </h4>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-sans tracking-[0.12em]",
                        isCurrent
                          ? "border border-gray-200 text-gray-400"
                          : "border border-gray-100 text-gray-300",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "font-serif text-[15px] leading-7 md:text-base md:leading-8",
                      isCurrent ? "text-gray-600" : "text-gray-500",
                    )}
                  >
                    {item.description}
                  </p>

                  <p
                    className={cn(
                      "font-sans text-[13px] leading-6 md:text-sm",
                      isCurrent ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    {item.stack}
                  </p>

                  {item.link && item.linkLabel && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[13px] text-gray-400 underline decoration-gray-200 underline-offset-4 transition-colors hover:text-gray-700 md:text-sm"
                    >
                      {item.linkLabel}
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
