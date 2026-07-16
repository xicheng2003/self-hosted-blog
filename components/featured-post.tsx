import Link from "next/link"

import { ExternalArrow } from "@/components/icons/external-arrow"
import type { PostSummary } from "@/lib/content/types"

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

type FeaturedPostProps = {
  post: PostSummary
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link className="featured-post" href={`/posts/${post.slug}`}>
      <div className="featured-post-meta">
        <span>Latest · 最新</span>
        <time dateTime={post.publishedAt.toISOString()}>
          {dateFormatter.format(post.publishedAt).replaceAll("/", ".")}
        </time>
      </div>
      <h3>{post.title}</h3>
      {post.excerpt ? <p>{post.excerpt}</p> : null}
      <div className="featured-post-footer">
        <span>{post.category?.name ?? "记录"}</span>
        <span className="featured-post-action">阅读全文 <ExternalArrow /></span>
      </div>
    </Link>
  )
}
