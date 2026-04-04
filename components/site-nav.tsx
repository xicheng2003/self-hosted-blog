"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SiteNav({ animate = false }: { animate?: boolean }) {
  const pathname = usePathname()
  
  return (
    <nav className={cn(
      "max-w-3xl mx-auto px-6 py-12 flex justify-between items-center",
      animate && "animate-enter-up"
    )}>
      <Link href="/" className="flex flex-col">
        <h1 className="font-serif text-xl font-bold tracking-wide">AuraDawn</h1>
      </Link>

      <div className="flex gap-6 text-sm tracking-wide text-gray-500 font-sans">
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
