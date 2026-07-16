import Link from "next/link"

import { ExternalArrow } from "@/components/icons/external-arrow"
import type { PostSummary } from "@/lib/content/types"

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return <p className="empty-note">还没有公开文章。</p>
  }

  return (
    <ol className="post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/posts/${post.slug}`} className="post-row">
            <time dateTime={post.publishedAt.toISOString()}>
              {dateFormatter.format(post.publishedAt).replaceAll("/", ".")}
            </time>
            <span className="post-row-copy">
              <span className="post-row-heading">
                <span className="post-row-title">{post.title}</span>
                {post.category && <span className="post-category">{post.category.name}</span>}
              </span>
              {post.excerpt && <span className="post-excerpt">{post.excerpt}</span>}
            </span>
            <span className="post-arrow"><ExternalArrow /></span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
