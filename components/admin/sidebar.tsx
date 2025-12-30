"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Settings, 
  MessageSquare,
  Plus
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Post {
  id: string
  title: string
  slug: string
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  const fetchRecentPosts = async () => {
    try {
      const res = await fetch('/api/posts?limit=5')
      if (res.ok) {
        const data = await res.json()
        setRecentPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch recent posts:', error)
    }
  }

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      label: "Posts",
      icon: FileText,
      href: "/admin/posts",
    },
    {
      label: "Comments",
      icon: MessageSquare,
      href: "/admin/comments",
    },
    {
      label: "Files",
      icon: FolderOpen,
      href: "/admin/files",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ]

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-white", className)}>
      <div className="space-y-4 py-4">
        <div className="px-6 py-2">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <span className="font-serif font-bold text-xl">Backstage</span>
          </h2>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-neutral-500">
            Admin
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-normal h-9",
                    pathname === route.href 
                      ? "bg-neutral-100 text-neutral-900" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-neutral-500">
            Recent Posts
          </h2>
          <div className="space-y-1">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link key={post.id} href={`/admin?slug=${post.slug}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal h-8 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 truncate"
                  >
                    <FileText className="mr-2 h-3 w-3 shrink-0" />
                    <span className="truncate text-sm">{post.title || 'Untitled'}</span>
                  </Button>
                </Link>
              ))
            ) : (
              <p className="px-4 text-sm text-neutral-400">No posts yet</p>
            )}
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start h-8 text-neutral-400 hover:text-neutral-900 text-xs">
                <Plus className="mr-2 h-3 w-3" />
                New Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* User Profile at Bottom */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-100 cursor-pointer transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none truncate">Admin User</p>
            <p className="text-xs text-neutral-500 truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
