import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import dotenv from "dotenv"
import matter from "gray-matter"
import { promises as fs } from "node:fs"
import path from "node:path"
import { Pool } from "pg"

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true })

const contentDirectory = path.join(process.cwd(), "content", "posts")
const imagesDirectory = path.join(process.cwd(), "public", "images", "posts")
const bucket = process.env.S3_BUCKET_NAME

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10_000,
})

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials:
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
      : undefined,
})

function encodedKey(key) {
  return key.split("/").map(encodeURIComponent).join("/")
}

function assetReferences(asset) {
  const key = encodedKey(asset.key)
  const references = new Set([asset.url, `/api/files/${key}`])

  for (const domain of [process.env.S3_PUBLIC_DOMAIN, process.env.S3_ENDPOINT]) {
    if (!domain) continue
    references.add(`${domain.replace(/\/+$/, "")}/${key}`)
    if (bucket) references.add(`${domain.replace(/\/+$/, "")}/${bucket}/${key}`)
  }

  return [...references].filter(Boolean)
}

function safeFilename(value, fallback) {
  const decoded = decodeURIComponent(value).split(/[?#]/)[0]
  const basename = path.basename(decoded)
  const cleaned = basename.replace(/[^a-zA-Z0-9._-]/g, "-")
  return cleaned && cleaned !== "." ? cleaned : fallback
}

async function streamToBuffer(body) {
  if (!body) throw new Error("Empty object body")
  return Buffer.from(await body.transformToByteArray())
}

async function downloadManagedAsset(asset) {
  if (!bucket) throw new Error("S3_BUCKET_NAME is required to migrate managed assets")
  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: asset.key }),
    { abortSignal: AbortSignal.timeout(15_000) },
  )
  return {
    bytes: await streamToBuffer(response.Body),
    contentType: response.ContentType,
  }
}

async function downloadExternalAsset(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? undefined,
  }
}

function extensionFor(contentType) {
  if (!contentType) return ""
  const type = contentType.split(";")[0].trim().toLowerCase()
  return {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
  }[type] ?? ""
}

function extractImageUrls(content) {
  const urls = new Set()
  const markdownImage = /!\[[^\]]*\]\((?:<)?([^\s)>]+)(?:>)?(?:\s+["'][^"']*["'])?\)/g
  const mediaCardImage = /\b(?:image|imageUrl)=["']([^"']+)["']/g

  for (const expression of [markdownImage, mediaCardImage]) {
    for (const match of content.matchAll(expression)) urls.add(match[1])
  }

  return [...urls]
}

function replaceAll(source, search, replacement) {
  return search ? source.split(search).join(replacement) : source
}

async function localizeImages(post, assets) {
  let content = post.content
  let cover = post.coverImage
  let migrated = 0
  const failures = []
  const postImagesDirectory = path.join(imagesDirectory, post.slug)
  const usedNames = new Set()

  await fs.mkdir(postImagesDirectory, { recursive: true })

  const references = new Set(extractImageUrls(content))
  if (cover) references.add(cover)

  for (const asset of assets) {
    if (assetReferences(asset).some((reference) => content.includes(reference) || cover === reference)) {
      references.add(asset.url)
    }
  }

  for (const reference of references) {
    if (!reference || reference.startsWith("/images/")) continue

    const managedAsset = assets.find((asset) => assetReferences(asset).includes(reference))
    const isRemote = /^https?:\/\//.test(reference)
    if (!managedAsset && !isRemote) continue

    try {
      const downloaded = managedAsset
        ? await downloadManagedAsset(managedAsset)
        : await downloadExternalAsset(reference)

      const fallback = `image-${migrated + 1}${extensionFor(downloaded.contentType)}`
      let filename = safeFilename(managedAsset?.key ?? new URL(reference).pathname, fallback)
      if (!path.extname(filename)) filename += extensionFor(downloaded.contentType)
      if (usedNames.has(filename)) filename = `${migrated + 1}-${filename}`
      usedNames.add(filename)

      await fs.writeFile(path.join(postImagesDirectory, filename), downloaded.bytes)
      const localUrl = `/images/posts/${post.slug}/${filename}`

      if (managedAsset) {
        for (const candidate of assetReferences(managedAsset)) {
          content = replaceAll(content, candidate, localUrl)
          if (cover === candidate) cover = localUrl
        }
      }

      content = replaceAll(content, reference, localUrl)
      if (cover === reference) cover = localUrl
      migrated += 1
    } catch (error) {
      failures.push(`${reference}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { content, cover, migrated, failures }
}

async function readDatabaseContent() {
  const [postsResult, categoriesResult, tagsResult, relationsResult, assetsResult] =
    await Promise.all([
      pool.query('SELECT * FROM "Post" ORDER BY "createdAt" DESC'),
      pool.query('SELECT id, name FROM "Category"'),
      pool.query('SELECT id, name FROM "Tag"'),
      pool.query('SELECT "A", "B" FROM "_PostToTag"'),
      pool.query('SELECT id, url, key, filename FROM "Asset"'),
    ])

  const categories = new Map(categoriesResult.rows.map((category) => [category.id, category]))
  const tags = new Map(tagsResult.rows.map((tag) => [tag.id, tag]))
  const tagIdsByPost = new Map()

  for (const relation of relationsResult.rows) {
    const postTags = tagIdsByPost.get(relation.A) ?? []
    postTags.push(relation.B)
    tagIdsByPost.set(relation.A, postTags)
  }

  const posts = postsResult.rows.map((post) => ({
    ...post,
    category: post.categoryId ? categories.get(post.categoryId) ?? null : null,
    tags: (tagIdsByPost.get(post.id) ?? [])
      .map((tagId) => tags.get(tagId))
      .filter(Boolean),
  }))

  return { posts, assets: assetsResult.rows }
}

async function main() {
  console.log("Preparing local content directories...")
  await fs.mkdir(contentDirectory, { recursive: true })
  await fs.mkdir(imagesDirectory, { recursive: true })

  console.log("Reading posts and asset metadata...")
  const { posts, assets } = await readDatabaseContent()

  let imageCount = 0
  const failures = []
  const publishedPosts = posts.filter((post) => post.published)
  const featuredSlugs = new Set(publishedPosts.slice(0, 3).map((post) => post.slug))

  for (const post of posts) {
    console.log(`Exporting ${post.slug}...`)
    const localized = await localizeImages(post, assets)
    imageCount += localized.migrated
    failures.push(...localized.failures.map((failure) => `${post.slug}: ${failure}`))

    const frontMatter = {
      title: post.title,
      slug: post.slug,
      date: post.createdAt.toISOString(),
      updated: post.updatedAt.toISOString(),
      excerpt: post.excerpt ?? "",
      category: post.category?.name ?? "",
      tags: post.tags.map((tag) => tag.name),
      cover: localized.cover ?? "",
      featured: featuredSlugs.has(post.slug),
      draft: !post.published,
    }

    const markdown = matter.stringify(`${localized.content.trim()}\n`, frontMatter)
    await fs.writeFile(path.join(contentDirectory, `${post.slug}.md`), markdown, "utf8")
  }

  console.log(`Exported ${posts.length} posts (${publishedPosts.length} published, ${posts.length - publishedPosts.length} drafts).`)
  console.log(`Localized ${imageCount} referenced images.`)

  if (failures.length > 0) {
    console.warn(`Could not localize ${failures.length} image references:`)
    failures.forEach((failure) => console.warn(`- ${failure}`))
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
