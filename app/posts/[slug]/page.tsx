import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import Link from "next/link"
import Image from "next/image"
import { MediaCard } from "@/components/media-card"
import { remarkMediaCard } from "@/lib/remark-media-card"
import { ViewCounter } from "@/components/view-counter"
import { auth } from "@/auth"
import { TableOfContents } from "@/components/table-of-contents"

// Increase revalidation time for better cache hit rate
export const revalidate = 3600 // 1 hour
export const dynamicParams = true // Allow generating pages on demand (for new posts or drafts)

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all published posts at build time
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  })
 
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
  })
  if (!post || !post.published) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, tags: true, category: true }
  })

  if (!post) {
    notFound()
  }

  // Only check session if post is not published to avoid dynamic rendering on public posts
  if (!post.published) {
    const session = await auth()
    if (!session) {
      notFound()
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200 animate-in fade-in duration-700">
      
      {/* ---------------- Navigation ---------------- */}
      <nav className="max-w-3xl mx-auto px-6 py-12 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="font-serif text-xl font-bold tracking-wide">AuraDawn</h1>
        </div>
        
        <div className="flex gap-6 text-sm tracking-wide text-gray-500 font-sans">
          <Link href="/" className="hover:text-black transition-colors">首页</Link>
          <Link href="/posts" className="hover:text-black transition-colors border-b border-black text-black">博客</Link>
          <Link href="/admin" className="hover:text-black transition-colors">管理</Link>
        </div>
      </nav>

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20 relative">
        <TableOfContents />
        
        {/* Article Header */}
        <header className="mt-8 mb-12">
          <div className="w-12 h-[1px] bg-gray-300 mb-8"></div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 font-sans tracking-wide">
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
                  className="object-cover"
                  priority
                />
            </div>
        )}

        {/* Article Content */}
        <article className="prose prose-neutral max-w-none prose-headings:font-serif prose-p:font-serif prose-p:text-gray-600 prose-headings:text-gray-900 prose-img:rounded-sm">
            <div className="post-content">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMediaCard]} 
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        // @ts-ignore
                        'media-card': ({node, ...props}) => {
                            return <MediaCard {...(props as any)} />
                        },
                        img: ({node, ...props}) => {
                            if (!props.src) return null;
                            return (
                                <figure className="my-8">
                                    <Image
                                        src={props.src as string}
                                        alt={props.alt || ''}
                                        width={800}
                                        height={450}
                                        className="rounded-sm w-full h-auto"
                                    />
                                    {props.title && (
                                        <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                                            {props.title}
                                        </figcaption>
                                    )}
                                </figure>
                            )
                        },
                        blockquote: ({node, children, ...props}) => {
                            return (
                                <blockquote className="post-blockquote" {...props}>
                                    {children}
                                </blockquote>
                            )
                        },
                        a: ({node, children, ...props}) => {
                            return (
                                <a 
                                    {...props} 
                                    className="text-neutral-800 hover:text-neutral-500 transition-colors underline decoration-neutral-300 underline-offset-4 decoration-1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {children}
                                    <span className="text-[0.7em] ml-1 text-neutral-400">↗</span>
                                </a>
                            )
                        }
                    }}
                >
                    {post.content}
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

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-sans tracking-wider">
        <p>&copy; {new Date().getFullYear()} AuraDawn. All rights reserved.</p>
        <p className="mt-2 md:mt-0">至繁归于至简。</p>
      </footer>

    </div>
  )
}
