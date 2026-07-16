import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import type {
  Post,
  PostCategory,
  PostRepository,
  PostSummary,
  PostTag,
} from "@/lib/content/types"

type FrontMatter = Record<string, unknown>
type LocalPost = Post & { draft: boolean }

const postsDirectory = path.join(process.cwd(), "content", "posts")

function asRequiredString(value: unknown, field: string, filename: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing or invalid \"${field}\" in ${filename}`)
  }

  return value.trim()
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null
}

function asDate(value: unknown, field: string, filename: string) {
  const date = value instanceof Date ? value : new Date(String(value ?? ""))

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Missing or invalid \"${field}\" in ${filename}`)
  }

  return date
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
}

function toCategory(value: unknown): PostCategory | null {
  const name = asOptionalString(value)
  return name ? { name, slug: toSlug(name) } : null
}

function toTags(value: unknown): PostTag[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    .map((tag) => ({ name: tag.trim(), slug: toSlug(tag) }))
}

function parsePost(filename: string, source: string): LocalPost {
  const { data, content } = matter(source)
  const frontMatter = data as FrontMatter
  const fileSlug = path.basename(filename, path.extname(filename))
  const slug = asOptionalString(frontMatter.slug) ?? fileSlug
  const publishedAt = asDate(frontMatter.date, "date", filename)

  return {
    id: slug,
    slug,
    title: asRequiredString(frontMatter.title, "title", filename),
    excerpt: asOptionalString(frontMatter.excerpt) ?? "",
    publishedAt,
    updatedAt: frontMatter.updated
      ? asDate(frontMatter.updated, "updated", filename)
      : publishedAt,
    category: toCategory(frontMatter.category),
    tags: toTags(frontMatter.tags),
    coverImage: asOptionalString(frontMatter.cover),
    featured: frontMatter.featured === true,
    draft: frontMatter.draft === true,
    content: content.trim(),
  }
}

let postsPromise: Promise<LocalPost[]> | null = null

async function readLocalPosts() {
  if (!postsPromise) {
    postsPromise = (async () => {
      let filenames: string[]

      try {
        filenames = await fs.readdir(postsDirectory)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
        throw error
      }

      const markdownFiles = filenames.filter((filename) => /\.mdx?$/.test(filename))
      const posts = await Promise.all(
        markdownFiles.map(async (filename) => {
          const source = await fs.readFile(path.join(postsDirectory, filename), "utf8")
          return parsePost(filename, source)
        }),
      )

      return posts.sort(
        (left, right) => right.publishedAt.getTime() - left.publishedAt.getTime(),
      )
    })()
  }

  return postsPromise
}

function toSummary({ content: _content, draft: _draft, ...summary }: LocalPost) {
  void _content
  void _draft
  return summary satisfies PostSummary
}

function toPublishedPost({ draft: _draft, ...post }: LocalPost) {
  void _draft
  return post satisfies Post
}

export class LocalPostRepository implements PostRepository {
  async findPublished() {
    const posts = await readLocalPosts()
    return posts.filter((post) => !post.draft).map(toSummary)
  }

  async findPublishedWithContent() {
    const posts = await readLocalPosts()
    return posts.filter((post) => !post.draft).map(toPublishedPost)
  }

  async findPublishedBySlug(slug: string) {
    const posts = await readLocalPosts()
    const post = posts.find((candidate) => candidate.slug === slug && !candidate.draft)

    if (!post) return null

    const { draft: _draft, ...publishedPost } = post
    void _draft
    return publishedPost
  }

  async findPublishedSlugs() {
    const posts = await this.findPublished()
    return posts.map((post) => post.slug)
  }
}
