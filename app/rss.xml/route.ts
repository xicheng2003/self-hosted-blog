import { siteConfig } from "@/content/site"
import { renderFeedMarkdown } from "@/lib/feed/render-markdown"
import { getPublishedFeedPosts } from "@/lib/posts"

export const dynamic = "force-static"

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function escapeCdata(value: string) {
  return value.replaceAll("]]>", "]]]]><![CDATA[>")
}

function plainTextSummary(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[#*_`~|\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)
}

export async function GET() {
  const posts = await getPublishedFeedPosts()
  const siteUrl = siteConfig.url.replace(/\/$/, "")
  const lastBuildDate = posts.reduce(
    (latest, post) => post.updatedAt > latest ? post.updatedAt : latest,
    new Date(0),
  )
  const items = posts
    .map((post) => {
      const postUrl = `${siteUrl}/posts/${post.slug}`
      const description = post.excerpt || plainTextSummary(post.content)
      const content = renderFeedMarkdown(post.content, postUrl)
      const categories = [post.category?.name, ...post.tags.map((tag) => tag.name)]
        .filter((value): value is string => Boolean(value))
        .map((value) => `      <category>${escapeXml(value)}</category>`)
        .join("\n")

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <dc:creator>${escapeXml(siteConfig.author)}</dc:creator>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${escapeCdata(content)}]]></content:encoded>
${categories}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <generator>AuraDawn static feed</generator>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
