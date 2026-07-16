import type { ComponentProps } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import type { Components, ExtraProps } from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import { common } from "lowlight"
import remarkGfm from "remark-gfm"

import { ExternalArrow } from "@/components/icons/external-arrow"
import { MediaCard } from "@/components/media-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { TableOfContents } from "@/components/table-of-contents"
import { getPublishedPostBySlug, getPublishedPostSlugs } from "@/lib/posts"
import { remarkMediaCard } from "@/lib/remark-media-card"

export const dynamicParams = false

interface PostPageProps {
  params: Promise<{ slug: string }>
}

type MediaCardMarkdownProps = ComponentProps<typeof MediaCard> & ExtraProps
type MarkdownImageProps = ComponentProps<"img"> & ExtraProps
type MarkdownBlockquoteProps = ComponentProps<"blockquote"> & ExtraProps
type MarkdownAnchorProps = ComponentProps<"a"> & ExtraProps

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function isExternalLink(href?: string) {
  return Boolean(href && /^https?:\/\//.test(href))
}

const markdownComponents = {
  "media-card": (props: MediaCardMarkdownProps) => {
    const { node, ...mediaCardProps } = props
    void node
    return <MediaCard {...(mediaCardProps as ComponentProps<typeof MediaCard>)} />
  },
  img: (props: MarkdownImageProps) => {
    const { node, src, alt, title } = props
    void node
    if (!src || typeof src !== "string") return null

    return (
      <span className="article-image">
        <Image
          src={src}
          alt={alt || ""}
          title={title}
          width={1440}
          height={960}
          sizes="(max-width: 768px) 100vw, 720px"
        />
        {title && <span className="article-image-caption">{title}</span>}
      </span>
    )
  },
  blockquote: (props: MarkdownBlockquoteProps) => {
    const { node, children, ...blockquoteProps } = props
    void node
    return <blockquote {...blockquoteProps}>{children}</blockquote>
  },
  a: (props: MarkdownAnchorProps) => {
    const { node, children, href, ...anchorProps } = props
    void node
    const external = isExternalLink(href)

    return (
      <a
        {...anchorProps}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
        {external && <span className="external-mark"><ExternalArrow /></span>}
      </a>
    )
  },
} as unknown as Components

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) notFound()

  return (
    <div className="site-shell">
      <SiteNav />

      <main className="article-page">
        <TableOfContents />

        <header className="article-header reveal">
          <p className="eyebrow">{post.category?.name ?? "Writing"}</p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="article-deck">{post.excerpt}</p>}
          <div className="article-meta">
            <time dateTime={post.publishedAt.toISOString()}>
              {dateFormatter.format(post.publishedAt).replaceAll("/", ".")}
            </time>
            <span>静态存档</span>
          </div>
        </header>

        {post.coverImage && (
          <figure className="article-cover reveal delay-1">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1440}
              height={900}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </figure>
        )}

        <article className="article-prose post-content reveal delay-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMediaCard]}
            rehypePlugins={[[rehypeHighlight, { languages: common }]]}
            components={markdownComponents}
          >
            {post.content.replace(/\\\[/g, "[").replace(/\\\]/g, "]")}
          </ReactMarkdown>
        </article>

        {post.tags.length > 0 && (
          <footer className="article-tags">
            {post.tags.map((tag) => <span key={tag.slug}>#{tag.name}</span>)}
          </footer>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
