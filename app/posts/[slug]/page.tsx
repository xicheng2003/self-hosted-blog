import type { ComponentProps } from "react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import type { Components, ExtraProps } from "react-markdown"
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { common } from 'lowlight'
import Image from "next/image"
import { MediaCard } from "@/components/media-card"
import { remarkMediaCard } from "@/lib/remark-media-card"
import { ViewCounter } from "@/components/view-counter"
import {
  getAdminPostBySlug,
  getPublishedPostBySlug,
  getPublishedPostSlugs,
  type AdminPostDetail,
  type PublishedPost,
} from "@/lib/posts"
import { auth } from "@/auth"
import { TableOfContents } from "@/components/table-of-contents"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"

// Increase revalidation time for better cache hit rate
export const revalidate = 3600 // 1 hour
export const dynamicParams = true // Allow generating pages on demand (for new posts or drafts)

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

type RenderablePost = PublishedPost | AdminPostDetail
type MediaCardMarkdownProps = ComponentProps<typeof MediaCard> & ExtraProps
type MarkdownImageProps = ComponentProps<"img"> & ExtraProps
type MarkdownBlockquoteProps = ComponentProps<"blockquote"> & ExtraProps
type MarkdownAnchorProps = ComponentProps<"a"> & ExtraProps

function isRemoteImageSource(src?: string | null) {
  return typeof src === "string" && /^https?:\/\//.test(src)
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
      <figure className="my-8">
        <Image
          src={src}
          alt={alt || ""}
          width={800}
          height={450}
          unoptimized={isRemoteImageSource(src)}
          className="rounded-sm w-full h-auto"
        />
        {title && (
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
            {title}
          </figcaption>
        )}
      </figure>
    )
  },
  blockquote: (props: MarkdownBlockquoteProps) => {
    const { node, children, ...blockquoteProps } = props
    void node

    return (
      <blockquote className="post-blockquote" {...blockquoteProps}>
        {children}
      </blockquote>
    )
  },
  a: (props: MarkdownAnchorProps) => {
    const { node, children, ...anchorProps } = props
    void node

    return (
      <a
        {...anchorProps}
        className="text-neutral-800 hover:text-neutral-500 transition-colors underline decoration-neutral-300 underline-offset-4 decoration-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span className="text-[0.7em] ml-1 text-neutral-400 select-none">↗</span>
      </a>
    )
  },
} as unknown as Components

// Generate static params for all published posts at build time
export async function generateStaticParams() {
  const posts = await getPublishedPostSlugs()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const publishedPost = await getPublishedPostBySlug(slug)

  let post: RenderablePost | null = publishedPost

  if (!post) {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    if (isAdmin) {
      post = await getAdminPostBySlug(slug)
    }
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200 animate-in fade-in duration-700">

      <SiteNav />

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20 relative">
        <TableOfContents />

        {/* Article Header */}
        <header className="mt-8 mb-12">
          <div className="w-12 h-[1px] bg-gray-300 mb-8"></div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6 text-gray-900">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] md:text-sm text-gray-400 font-sans tracking-wide">
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, "yyyy-MM-dd")}
            </time>

            {post.category && (
              <span className="uppercase tracking-widest text-xs">
                {post.category.name}
              </span>
            )}

            <ViewCounter slug={post.slug} initialViews={post.viewCount} />
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-[300px] md:h-[400px] mb-12 overflow-hidden rounded-sm bg-gray-100">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              unoptimized={isRemoteImageSource(post.coverImage)}
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-neutral max-w-none prose-base prose-headings:font-serif prose-p:font-serif prose-p:text-[15px] prose-p:leading-8 prose-p:text-gray-600 prose-li:font-serif prose-li:text-[15px] prose-li:leading-8 prose-li:text-gray-600 prose-headings:text-gray-900 prose-h2:text-[1.65rem] prose-h3:text-[1.35rem] prose-h4:text-[1.15rem] prose-img:rounded-sm">
          <div className="post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMediaCard]}
              rehypePlugins={[[rehypeHighlight, { languages: common }]]}
              components={markdownComponents}
            >
              {post.content.replace(/\\\[/g, '[').replace(/\\\]/g, ']')}
            </ReactMarkdown>
          </div>
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag.id} className="inline-flex items-center text-xs font-sans text-gray-400 bg-gray-100 px-2.5 py-1 rounded-sm">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>

      <SiteFooter />

    </div>
  )
}
