import { getPublishedPosts } from "@/lib/posts"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { format } from "date-fns"

export const revalidate = 3600

export default async function PostsPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200 animate-in fade-in duration-700">

      <SiteNav />

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20">

        <header className="mt-10 mb-14 md:mb-16">
          <div className="w-12 h-[1px] bg-gray-300 mb-8"></div>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4 font-medium text-gray-900">
            记录点滴
          </h2>
          <p className="font-serif text-base md:text-[1.05rem] text-gray-400 italic">
            渴望与你共鸣。
          </p>
        </header>

        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                <article className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-9">
                  <div className="w-32 shrink-0 text-[13px] md:text-sm text-gray-400 font-sans tracking-wide tabular-nums">
                    {format(post.createdAt, "yyyy-MM-dd")}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-serif text-xl md:text-[1.6rem] text-gray-800 mb-3 group-hover:text-black transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="font-serif text-[15px] text-gray-500 leading-7 line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      {post.category && (
                        <span className="text-[11px] font-sans uppercase tracking-[0.22em] text-gray-400">
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

      <SiteFooter />

    </div>
  )
}
