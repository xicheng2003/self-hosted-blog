import { promises as fs } from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import matter from "gray-matter"

import { getEmailConfig, getPublicSiteUrl } from "../lib/email/config"
import { getResend } from "../lib/email/resend"
import { createNewPostEmail } from "../lib/email/templates"

dotenv.config({ path: [".env.local", ".env"] })

type NewsletterPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: Date
}

function requiredString(value: unknown, name: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required frontmatter field: ${name}`)
  }

  return value.trim()
}

async function readPost(slug: string): Promise<NewsletterPost> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("Slug may only contain lowercase letters, numbers, and hyphens.")
  }

  const filename = path.join(process.cwd(), "content", "posts", `${slug}.md`)
  const source = await fs.readFile(filename, "utf8")
  const { data } = matter(source)

  if (data.draft !== false) {
    throw new Error(`Refusing to send a draft post: ${slug}`)
  }

  const publishedAt = new Date(String(data.date ?? ""))
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error("Missing or invalid frontmatter field: date")
  }

  return {
    slug: requiredString(data.slug, "slug"),
    title: requiredString(data.title, "title"),
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : "",
    publishedAt,
  }
}

async function findBroadcastByName(name: string) {
  const resend = getResend()
  let after: string | undefined

  for (let page = 0; page < 10; page += 1) {
    const result = await resend.broadcasts.list({ limit: 100, after })
    if (result.error) throw new Error(result.error.message)

    const match = result.data?.data.find((broadcast) => broadcast.name === name)
    if (match) return match

    if (!result.data?.has_more || result.data.data.length === 0) return null
    after = result.data.data.at(-1)?.id
  }

  throw new Error("Unable to finish checking existing broadcasts.")
}

async function main() {
  const args = process.argv.slice(2)
  const slug = args.find((argument) => !argument.startsWith("--"))
  const dryRun = args.includes("--dry-run")

  if (!slug) {
    throw new Error("Usage: npm run newsletter:send -- <slug> [--dry-run]")
  }

  const post = await readPost(slug)
  if (post.slug !== slug) {
    throw new Error(`Filename slug (${slug}) does not match frontmatter slug (${post.slug}).`)
  }

  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(post.publishedAt)
    .replaceAll("/", ".")
  const postUrl = `${getPublicSiteUrl()}/posts/${post.slug}`
  const email = createNewPostEmail({
    title: post.title,
    excerpt: post.excerpt,
    postUrl,
    publishedAt: dateLabel,
  })
  const broadcastName = `post:${post.slug}:${post.publishedAt.toISOString()}`

  if (dryRun) {
    console.log(JSON.stringify({ broadcastName, postUrl, subject: email.subject }, null, 2))
    return
  }

  const existing = await findBroadcastByName(broadcastName)
  if (existing?.status === "sent" || existing?.status === "queued") {
    console.log(`Newsletter already ${existing.status}: ${existing.id}`)
    return
  }

  const resend = getResend()
  let broadcastId = existing?.id

  if (!broadcastId) {
    const config = getEmailConfig()
    const created = await resend.broadcasts.create({
      name: broadcastName,
      segmentId: config.segmentId,
      topicId: config.topicId,
      from: config.from,
      replyTo: config.replyTo,
      subject: email.subject,
      previewText: email.previewText,
      html: email.html,
      text: email.text,
    })

    if (created.error || !created.data?.id) {
      throw new Error(created.error?.message || "Unable to create broadcast.")
    }

    broadcastId = created.data.id
    console.log(`Created broadcast draft: ${broadcastId}`)
  }

  const sent = await resend.broadcasts.send(broadcastId)
  if (sent.error) throw new Error(sent.error.message)

  console.log(`Newsletter queued: ${broadcastId}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
