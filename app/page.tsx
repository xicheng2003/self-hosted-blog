import Link from "next/link"

import { FeaturedPost } from "@/components/featured-post"
import { ExternalArrow } from "@/components/icons/external-arrow"
import { RssIcon } from "@/components/icons/rss-icon"
import { PostList } from "@/components/post-list"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { SubscribeForm } from "@/components/subscribe-form"
import { siteConfig } from "@/content/site"
import { getPublishedPosts } from "@/lib/posts"

export default async function Home() {
  const posts = await getPublishedPosts()
  const [featuredPost, ...remainingPosts] = posts
  const latestPosts = remainingPosts.slice(0, 3)

  return (
    <div className="site-shell">
      <SiteNav animate />

      <main className="site-content">
        <section className="blog-hero reveal delay-1">
          <p className="eyebrow">Blog · 个人博客</p>
          <h1>在严谨逻辑之外，记录具体而鲜活的瞬间。</h1>
          <p className="hero-description">
            我是{siteConfig.author}。这里保存技术实践、长跑、阅读与生活观察，也保留那些仍在形成中的想法。
          </p>
        </section>

        <section className="blog-section reveal delay-2">
          <div className="section-heading">
            <h2>最近文章</h2>
            <span>{posts.length} 篇文章</span>
          </div>
          {featuredPost ? (
            <>
              <FeaturedPost post={featuredPost} />
              {latestPosts.length > 0 ? <PostList posts={latestPosts} /> : null}
            </>
          ) : (
            <PostList posts={[]} />
          )}
          <Link className="text-link" href="/posts">浏览归档 <span>→</span></Link>
        </section>

        <section className="subscribe-section reveal delay-3" id="subscribe">
          <p>
            你可以通过{" "}
            <a className="rss-feed-link" href="/rss.xml">
              <span className="rss-feed-underlined">
                <RssIcon />
                <span className="rss-feed-label">RSS feed</span>
              </span>
              <ExternalArrow />
            </a>
            ，
            或者在下面输入邮箱订阅我的博客。
          </p>
          <SubscribeForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
