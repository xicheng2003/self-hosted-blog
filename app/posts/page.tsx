import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight } from 'lucide-react'

export const revalidate = 60

export default async function PostsPage() {
  const posts: {
    id: string; title: string; slug: string; excerpt: string | null;
    createdAt: Date; coverImage: string | null; published: boolean;
    tags: { id: string; name: string; slug: string }[];
    category: { id: string; name: string; slug: string } | null;
  }[] = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { tags: true, category: true }
  })

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200 animate-in fade-in duration-700">

      {/* ---------------- Navigation ---------------- */}
      <nav className="max-w-3xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="flex flex-col">
          <h1 className="font-serif text-xl font-bold tracking-wide">AuraDawn</h1>
        </Link>

        <div className="flex gap-6 text-sm tracking-wide text-gray-500 font-sans">
          <Link href="/" className="hover:text-black transition-colors">首页</Link>
          <Link href="/posts" className="hover:text-black transition-colors border-b border-black text-black">博客</Link>
        </div>
      </nav>

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20">

        <header className="mt-12 mb-16">
          <div className="w-12 h-[1px] bg-gray-300 mb-8"></div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4 font-medium text-gray-900">
            记录点滴
          </h2>
          <p className="font-serif text-lg text-gray-400 italic">
            渴望与你共鸣。
          </p>
        </header>

        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                <article className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10">
                  <div className="w-32 shrink-0 text-sm text-gray-400 font-sans tracking-wide tabular-nums">
                    {format(post.createdAt, "yyyy-MM-dd")}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-gray-800 mb-3 group-hover:text-black transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="font-serif text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      {post.category && (
                        <span className="text-xs font-sans uppercase tracking-widest text-gray-400">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 italic font-serif">暂无文章</p>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-sans tracking-wider">
        <p>&copy; {new Date().getFullYear()} AuraDawn. All rights reserved.</p>
        <p className="mt-2 md:mt-0">至繁归于至简。</p>
      </footer>

    </div>
  )
}
