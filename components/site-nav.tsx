"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SiteNav({ animate = false }: { animate?: boolean }) {
  const pathname = usePathname()
  
  return (
    <nav className={cn(
      "max-w-3xl mx-auto px-6 py-10 md:py-11 flex justify-between items-center",
      animate && "animate-enter-up"
    )}>
      <Link href="/" className="flex flex-col">
        <h1 className="font-serif text-lg md:text-[1.15rem] font-semibold tracking-[0.06em]">AuraDawn</h1>
      </Link>

      <div className="flex gap-5 text-[13px] md:text-sm tracking-[0.08em] text-gray-500 font-sans">
        <Link 
          href="/" 
          className={cn(
            "hover:text-black transition-colors",
            pathname === "/" ? "border-b border-black text-black" : "hover:border-b hover:border-gray-300"
          )}
        >
          首页
        </Link>
        <Link 
          href="/posts" 
          className={cn(
            "hover:text-black transition-colors",
            pathname.startsWith("/posts") ? "border-b border-black text-black" : "hover:border-b hover:border-gray-300"
          )}
        >
          文章
        </Link>
      </div>
    </nav>
  )
}
