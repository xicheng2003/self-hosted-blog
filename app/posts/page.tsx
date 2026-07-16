import { PostList } from "@/components/post-list"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { getPublishedPosts } from "@/lib/posts"

export const metadata = {
  title: "Archive",
  description: "AuraDawn 的公开文章归档。",
}

export default async function PostsPage() {
  const posts = await getPublishedPosts()
  const years = posts.reduce((groups, post) => {
    const year = String(post.publishedAt.getFullYear())
    const yearPosts = groups.get(year) ?? []
    yearPosts.push(post)
    groups.set(year, yearPosts)
    return groups
  }, new Map<string, typeof posts>())

  return (
    <div className="site-shell">
      <SiteNav />

      <main className="site-content archive-page">
        <header className="page-header reveal">
          <p className="eyebrow">Writing · 写作归档</p>
          <h1>Archive</h1>
          <p>按时间收拢已完成的文章；草稿继续留在本地，直到真正准备好。</p>
        </header>

        <div className="year-groups">
          {[...years.entries()].map(([year, yearPosts]) => (
            <section className="year-group" key={year}>
              <div className="year-label">
                <h2>{year}</h2>
                <span>{yearPosts.length}</span>
              </div>
              <PostList posts={yearPosts} />
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
