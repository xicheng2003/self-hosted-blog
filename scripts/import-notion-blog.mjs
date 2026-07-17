import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const NOTION_API_BASE = "https://app.notion.com/api/v3"
const SPACE_ID = "27468e68-d006-4a2d-b15d-673ece889e8f"
const COLLECTION_ID = "da7e0432-001f-4721-92dd-ab88c161eacf"
const COLLECTION_VIEW_ID = "4a111564-9142-4a02-9e29-84bc8de5be6d"

const postsDirectory = path.join(process.cwd(), "content", "posts")
const publicDirectory = path.join(process.cwd(), "public")

const SLUG_OVERRIDES = new Map([
  ["7db05bba-1aaa-4b59-9cdf-596ff5166d73", "bounding-box-coordinate-formats"],
  ["6bb227c4-8e1a-4be2-a3bc-0267d5e6d4b7", "yolo-helmet-detection"],
  ["ced5b141-bbc0-4200-ba18-6d7e2279f1d3", "matlab-magnetic-hysteresis-loop-fitting"],
  ["62c81122-c013-422a-b543-6d736b28923b", "add-waline-comments-to-nextjs-blog"],
  ["56878fb6-5755-4b00-81e4-7d2849d8ab4f", "aimless-travel"],
  ["bc3e5fc2-90b4-46b9-8a96-329589a03720", "new-bing-chatgpt-first-impressions"],
  ["36bfb6ee-ba25-49a9-bed1-ef4c433b9cc9", "article-written-by-new-bing"],
  [
    "2f4b7a97-d26f-49e1-966f-4776c7e466db",
    "install-apple-music-on-windows-subsystem-for-android",
  ],
])
const IMPORTED_SLUGS = [
  "journal-20",
  "journal-19",
  "journal-18",
  "journal-14",
  "journal-13",
  "journal-12",
  "journal-11",
  "journal-8",
  "journal-7",
  "journal-6",
  "journal-5",
  "bounding-box-coordinate-formats",
  "yolo-helmet-detection",
  "journal-4",
  "matlab-magnetic-hysteresis-loop-fitting",
  "add-waline-comments-to-nextjs-blog",
  "aimless-travel",
  "new-bing-chatgpt-first-impressions",
  "article-written-by-new-bing",
  "install-apple-music-on-windows-subsystem-for-android",
]

function unwrapRecord(record) {
  return record?.value?.value ?? record?.value ?? null
}

function plainText(property) {
  if (!Array.isArray(property)) return ""

  return property
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("")
    .trim()
}

function propertyDate(property) {
  if (!Array.isArray(property)) return ""

  for (const segment of property) {
    if (!Array.isArray(segment) || !Array.isArray(segment[1])) continue

    for (const annotation of segment[1]) {
      if (
        Array.isArray(annotation) &&
        annotation[0] === "d" &&
        typeof annotation[1]?.start_date === "string"
      ) {
        return annotation[1].start_date
      }
    }
  }

  return ""
}

function parseTags(property) {
  return plainText(property)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

async function notionRequest(endpoint, body) {
  const response = await fetch(`${NOTION_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Notion request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function queryCollection() {
  return notionRequest("queryCollection", {
    collection: {
      id: COLLECTION_ID,
      spaceId: SPACE_ID,
    },
    collectionView: {
      id: COLLECTION_VIEW_ID,
      spaceId: SPACE_ID,
    },
    loader: {
      type: "reducer",
      reducers: {
        collection_group_results: {
          type: "results",
          limit: 1000,
        },
        "table:uncategorized": {
          type: "results",
          limit: 1000,
        },
      },
      searchQuery: "",
      userTimeZone: "Asia/Shanghai",
    },
  })
}

async function loadPage(pageId) {
  return notionRequest("loadPageChunk", {
    pageId,
    limit: 100,
    cursor: {
      stack: [],
    },
    chunkNumber: 0,
    verticalColumns: false,
  })
}

async function syncBlocks(blockIds) {
  if (blockIds.length === 0) {
    return {
      recordMap: {
        block: {},
      },
    }
  }

  return notionRequest("syncRecordValues", {
    requests: blockIds.map((id) => ({
      pointer: {
        table: "block",
        id,
        spaceId: SPACE_ID,
      },
      version: -1,
    })),
  })
}

async function getSignedFileUrl(source, blockId) {
  const result = await notionRequest("getSignedFileUrls", {
    urls: [
      {
        permissionRecord: {
          table: "block",
          id: blockId,
          spaceId: SPACE_ID,
        },
        url: source,
      },
    ],
  })

  return result.signedUrls?.[0] ?? ""
}

async function readExistingPosts() {
  const filenames = await fs.readdir(postsDirectory)
  const posts = []

  for (const filename of filenames.filter((name) => /\.mdx?$/.test(name))) {
    const source = await fs.readFile(path.join(postsDirectory, filename), "utf8")
    const { data } = matter(source)

    posts.push({
      filename,
      slug: typeof data.slug === "string" ? data.slug : path.parse(filename).name,
      title: typeof data.title === "string" ? data.title : "",
    })
  }

  return posts
}

function slugForItem(item) {
  if (item.slug) return item.slug

  const journalMatch = item.title.match(/^Mon\.J0*(\d+)/i)
  if (journalMatch) return `journal-${Number(journalMatch[1])}`

  const override = SLUG_OVERRIDES.get(item.id)
  if (override) return override

  throw new Error(`No curated slug for Notion page: ${item.title} (${item.id})`)
}

function categoryForItem(item) {
  if (/^Mon\.J/i.test(item.title)) return "月刊"
  if (item.tags.some((tag) => ["Travel", "Photograph"].includes(tag))) return "旅行"

  if (
    item.tags.some((tag) =>
      [
        "Tech",
        "MATLAB",
        "Machine Learning",
        "Python",
        "Next.js",
        "Waline",
        "Windows",
        "Apple",
        "Chat GPT",
        "New Bing",
        "Research",
      ].includes(tag),
    )
  ) {
    return "技术"
  }

  return "随笔"
}

async function readInventory() {
  const [collectionResult, existingPosts] = await Promise.all([
    queryCollection(),
    readExistingPosts(),
  ])

  const resultIds =
    collectionResult.result?.reducerResults?.collection_group_results?.blockIds ?? []
  const blocks = collectionResult.recordMap?.block ?? {}
  const existingBySlug = new Map(existingPosts.map((post) => [post.slug, post]))
  const existingByTitle = new Map(existingPosts.map((post) => [post.title, post]))

  return resultIds
    .map((id) => {
      const block = unwrapRecord(blocks[id])
      return block ? toInventoryItem(id, block) : null
    })
    .filter((item) => item?.title)
    .map((item) => {
      const existing =
        (item.slug && existingBySlug.get(item.slug)) || existingByTitle.get(item.title)

      return {
        ...item,
        existingFile: existing?.filename ?? "",
      }
    })
    .sort((left, right) => {
      if (left.isPublic !== right.isPublic) return left.isPublic ? -1 : 1
      return right.date.localeCompare(left.date)
    })
}

function toInventoryItem(id, block) {
  const properties = block.properties ?? {}

  return {
    id,
    title: plainText(properties.title),
    description: plainText(properties["~]S<"]),
    date: propertyDate(properties["a<ql"]),
    updated: block.last_edited_time
      ? new Date(block.last_edited_time).toISOString()
      : "",
    status: plainText(properties[":k`@"]),
    isPublic: plainText(properties["==~K"]) === "Yes",
    featured: plainText(properties["=bhc"]) === "Yes",
    slug: plainText(properties["NVm^"]),
    tags: parseTags(properties["BN]P"]),
    cover: block.format?.page_cover ?? "",
    contentBlockCount: Array.isArray(block.content) ? block.content.length : 0,
  }
}

async function inventory() {
  const items = await readInventory()

  console.log(
    JSON.stringify(
      {
        total: items.length,
        public: items.filter((item) => item.isPublic).length,
        existing: items.filter((item) => item.existingFile).length,
        items,
      },
      null,
      2,
    ),
  )
}

function referencedChildIds(blocks, rootId) {
  const missing = new Set()
  const visited = new Set()

  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)

    const block = unwrapRecord(blocks[id])
    if (!block) {
      missing.add(id)
      return
    }

    for (const childId of block.content ?? []) {
      visit(childId)
    }
  }

  visit(rootId)
  return [...missing]
}

async function loadCompletePage(pageId) {
  const page = await loadPage(pageId)
  const blocks = {
    ...(page.recordMap?.block ?? {}),
  }

  for (let pass = 0; pass < 10; pass += 1) {
    const missingIds = referencedChildIds(blocks, pageId)
    if (missingIds.length === 0) return blocks

    for (let index = 0; index < missingIds.length; index += 100) {
      const batch = missingIds.slice(index, index + 100)
      const synced = await syncBlocks(batch)
      Object.assign(blocks, synced.recordMap?.block ?? {})
    }
  }

  return blocks
}

function collectDescendants(rootId, blocks) {
  const visited = new Set()
  const descendants = []

  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)

    const block = unwrapRecord(blocks[id])
    if (!block) {
      descendants.push({
        id,
        missing: true,
      })
      return
    }

    descendants.push({
      id,
      block,
    })

    for (const childId of block.content ?? []) {
      visit(childId)
    }
  }

  visit(rootId)
  return descendants
}

async function inspectTypes() {
  const items = (await readInventory()).filter(
    (item) => item.isPublic && !item.existingFile,
  )
  const typeCounts = new Map()
  const examples = new Map()
  const missingBlocks = []

  for (const item of items) {
    const page = await loadPage(item.id)
    const blocks = page.recordMap?.block ?? {}

    for (const descendant of collectDescendants(item.id, blocks)) {
      if (descendant.missing) {
        missingBlocks.push({
          page: item.title,
          id: descendant.id,
        })
        continue
      }

      const type = descendant.block.type ?? "unknown"
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)

      if (!examples.has(type)) {
        examples.set(type, {
          page: item.title,
          id: descendant.id,
          properties: descendant.block.properties ?? null,
          format: descendant.block.format ?? null,
        })
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        pages: items.length,
        types: Object.fromEntries(
          [...typeCounts.entries()].sort((left, right) => right[1] - left[1]),
        ),
        missingBlocks,
        examples: Object.fromEntries(examples),
      },
      null,
      2,
    ),
  )
}

function markdownEscape(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replace(/([*_[\]])/g, "\\$1")
}

function inlineCode(value) {
  const fence = value.includes("`") ? "``" : "`"
  return `${fence}${value}${fence}`
}

function normalizedPageId(value) {
  const compact = value.replaceAll("-", "")
  if (!/^[a-f0-9]{32}$/i.test(compact)) return ""

  return [
    compact.slice(0, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
    compact.slice(20),
  ].join("-")
}

function pageIdFromLink(value) {
  const match = value.match(/([a-f0-9]{32})(?:[?#/]|$)/i)
  return match ? normalizedPageId(match[1]) : ""
}

function rewriteLink(value, pageIdToSlug) {
  const pageId = pageIdFromLink(value)
  const slug = pageIdToSlug.get(pageId)
  return slug ? `/posts/${slug}` : value
}

function splitEdgeWhitespace(value) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/)

  return {
    leading: match?.[1] ?? "",
    core: match?.[2] ?? value,
    trailing: match?.[3] ?? "",
  }
}

function styledText(rawText, annotationTypes) {
  if (annotationTypes.has("c")) return inlineCode(rawText)

  const { leading, core, trailing } = splitEdgeWhitespace(rawText)
  if (!core) return rawText

  let rendered = markdownEscape(core)

  if (annotationTypes.has("b")) rendered = `**${rendered}**`
  if (annotationTypes.has("i")) rendered = `*${rendered}*`
  if (annotationTypes.has("s")) rendered = `~~${rendered}~~`

  return `${leading}${rendered}${trailing}`
}

function richTextToMarkdown(property, pageIdToSlug) {
  if (!Array.isArray(property)) return ""

  const pieces = property
    .map((segment) => {
      if (!Array.isArray(segment)) return ""

      const rawText = String(segment[0] ?? "")
      if (rawText.trim() === "‣") return null

      const annotations = Array.isArray(segment[1]) ? segment[1] : []
      const annotationTypes = new Set(
        annotations
          .filter(Array.isArray)
          .map((annotation) => annotation[0]),
      )
      const linkAnnotation = annotations.find(
        (annotation) =>
          Array.isArray(annotation) &&
          (annotation[0] === "a" || annotation[0] === "p"),
      )

      return {
        content: styledText(rawText, annotationTypes),
        target: linkAnnotation
          ? linkAnnotation[0] === "p"
            ? `/posts/${pageIdToSlug.get(normalizedPageId(String(linkAnnotation[1]))) ?? ""}`
            : rewriteLink(String(linkAnnotation[1] ?? ""), pageIdToSlug)
          : "",
      }
    })
    .filter((piece) => piece && piece.content)

  const grouped = []

  for (const piece of pieces) {
    const previous = grouped.at(-1)

    if (piece.target && previous?.target === piece.target) {
      previous.content += piece.content
    } else {
      grouped.push({ ...piece })
    }
  }

  return grouped
    .map(({ content, target }) => {
      if (target && target !== "/posts/") {
        const { leading, core, trailing } = splitEdgeWhitespace(content)
        return core ? `${leading}[${core}](${target})${trailing}` : content
      }

      return content
    })
    .join("")
}

function plainFilename(source) {
  if (source.startsWith("attachment:")) {
    return source.split(":").slice(2).join(":")
  }

  try {
    return decodeURIComponent(path.basename(new URL(source, "https://app.notion.com").pathname))
  } catch {
    return "asset"
  }
}

function safeFilename(value) {
  const cleaned = value
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")

  return cleaned || "asset"
}

function extensionForContentType(contentType) {
  const normalized = contentType.split(";")[0].trim().toLowerCase()
  const extensions = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  }

  return extensions[normalized] ?? ""
}

async function fetchWithRetry(url, options = {}) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: "follow",
      })

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      return response
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 350))
      }
    }
  }

  throw lastError
}

function isNotionHostedAsset(source) {
  if (source.startsWith("attachment:")) return true
  if (!/^https?:\/\//.test(source)) return false

  const hostname = new URL(source).hostname
  return (
    hostname.endsWith("notion-static.com") ||
    hostname.endsWith("notionusercontent.com") ||
    hostname.endsWith("amazonaws.com") ||
    hostname === "file.notion.so" ||
    hostname === "file.notion.com"
  )
}

async function sourceDownloadUrl(source, blockId) {
  if (source.startsWith("/")) return `https://app.notion.com${source}`
  if (isNotionHostedAsset(source)) {
    return (await getSignedFileUrl(source, blockId)) || source
  }
  return source
}

async function downloadAsset({
  source,
  blockId,
  slug,
  kind,
  preferredName,
}) {
  if (!source) return ""

  const downloadUrl = await sourceDownloadUrl(source, blockId)
  const response = await fetchWithRetry(downloadUrl)
  const contentType = response.headers.get("content-type") ?? ""
  const sourceName = preferredName || plainFilename(source)
  const parsedName = path.parse(safeFilename(sourceName))
  const extension = parsedName.ext || extensionForContentType(contentType)
  const basename = parsedName.name || kind
  const filename = `${basename}${extension}`
  const relativeDirectory =
    kind === "image" ? path.join("images", "posts", slug) : path.join("files", "posts", slug)
  const targetDirectory = path.join(publicDirectory, relativeDirectory)
  const targetPath = path.join(targetDirectory, filename)

  await fs.mkdir(targetDirectory, {
    recursive: true,
  })

  try {
    await fs.access(targetPath)
  } catch {
    const bytes = Buffer.from(await response.arrayBuffer())
    await fs.writeFile(targetPath, bytes)
  }

  return `/${path.join(relativeDirectory, filename).split(path.sep).join("/")}`
}

function prefixLines(value, prefix) {
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n")
}

function joinRenderedBlocks(rendered) {
  let result = ""
  let previousType = ""

  for (const entry of rendered.filter((candidate) => candidate.markdown.trim())) {
    const bothLists =
      ["bulleted_list", "numbered_list"].includes(previousType) &&
      previousType === entry.type
    const separator = result ? (bothLists ? "\n" : "\n\n") : ""
    result += `${separator}${entry.markdown}`
    previousType = entry.type
  }

  return result
}

function assetSource(block) {
  return (
    plainText(block.properties?.source) ||
    block.format?.display_source ||
    block.format?.original_url ||
    ""
  )
}

async function renderPage({
  item,
  slug,
  blocks,
  pageIdToSlug,
  warnings,
}) {
  const root = unwrapRecord(blocks[item.id])

  async function renderChildren(block) {
    const rendered = []

    for (const childId of block.content ?? []) {
      rendered.push(await renderBlock(childId))
    }

    return joinRenderedBlocks(rendered)
  }

  async function renderBlock(id) {
    const block = unwrapRecord(blocks[id])

    if (!block) {
      warnings.push(`${item.title}: missing block ${id}`)
      return {
        type: "missing",
        markdown: "*[未能读取的 Notion 内容块]*",
      }
    }

    const type = block.type ?? "unknown"
    const title = richTextToMarkdown(block.properties?.title, pageIdToSlug)
    const children = await renderChildren(block)

    if (type === "text") {
      return {
        type,
        markdown: [title, children].filter(Boolean).join("\n\n"),
      }
    }

    if (type === "header" || type === "sub_header" || type === "sub_sub_header") {
      const level = {
        header: "#",
        sub_header: "##",
        sub_sub_header: "###",
      }[type]
      const heading = markdownEscape(plainText(block.properties?.title))

      return {
        type,
        markdown: [`${level} ${heading}`, children].filter(Boolean).join("\n\n"),
      }
    }

    if (type === "bulleted_list" || type === "numbered_list") {
      const marker = type === "bulleted_list" ? "-" : "1."
      const nested = children ? `\n${prefixLines(children, "  ")}` : ""

      return {
        type,
        markdown: `${marker} ${title}${nested}`,
      }
    }

    if (type === "quote") {
      const body = [title, children].filter(Boolean).join("\n\n")
      return {
        type,
        markdown: prefixLines(body, "> "),
      }
    }

    if (type === "callout") {
      const pageIcon = block.format?.page_icon ?? ""
      const icon =
        pageIcon && !pageIcon.startsWith("/") && !/^https?:\/\//.test(pageIcon)
          ? `${pageIcon} `
          : ""
      const body = [`${icon}${title}`, children].filter(Boolean).join("\n\n")
      return {
        type,
        markdown: prefixLines(body, "> "),
      }
    }

    if (type === "code") {
      const language = plainText(block.properties?.language).toLowerCase()
      const code = plainText(block.properties?.title).replace(/\n$/, "")
      return {
        type,
        markdown: `\`\`\`${language}\n${code}\n\`\`\``,
      }
    }

    if (type === "divider") {
      return {
        type,
        markdown: "---",
      }
    }

    if (type === "image") {
      const source = assetSource(block)
      const caption = plainText(block.properties?.caption)
      const originalName = plainText(block.properties?.title) || plainFilename(source)

      try {
        const localPath = await downloadAsset({
          source,
          blockId: id,
          slug,
          kind: "image",
          preferredName: `${id.slice(0, 8)}-${originalName}`,
        })

        return {
          type,
          markdown: localPath
            ? `![${markdownEscape(caption || originalName)}](${localPath}${
                caption ? ` "${caption.replaceAll('"', '\\"')}"` : ""
              })`
            : "",
        }
      } catch (error) {
        warnings.push(`${item.title}: image ${originalName} failed: ${error.message}`)
        return {
          type,
          markdown: `*[图片未能本地化：${markdownEscape(caption || originalName)}]*`,
        }
      }
    }

    if (type === "file") {
      const source = assetSource(block)
      const originalName = plainText(block.properties?.title) || plainFilename(source)

      try {
        const localPath = await downloadAsset({
          source,
          blockId: id,
          slug,
          kind: "file",
          preferredName: `${id.slice(0, 8)}-${originalName}`,
        })

        return {
          type,
          markdown: localPath
            ? `[${markdownEscape(originalName)}](${localPath})`
            : "",
        }
      } catch (error) {
        warnings.push(`${item.title}: file ${originalName} failed: ${error.message}`)
        return {
          type,
          markdown: `[${markdownEscape(originalName)}](${source})`,
        }
      }
    }

    if (type === "bookmark") {
      const link = plainText(block.properties?.link)
      const bookmarkTitle = plainText(block.properties?.title) || link
      const description = plainText(block.properties?.description)

      return {
        type,
        markdown: [
          link ? `[${markdownEscape(bookmarkTitle)}](${rewriteLink(link, pageIdToSlug)})` : "",
          description ? `> ${markdownEscape(description)}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      }
    }

    if (type === "external_object_instance") {
      const link = block.format?.original_url || block.format?.uri || ""
      const externalTitle =
        block.format?.attributes?.find((attribute) => attribute.id === "title")?.values?.[0] ||
        link

      return {
        type,
        markdown: link
          ? `[${markdownEscape(String(externalTitle))}](${rewriteLink(link, pageIdToSlug)})`
          : "",
      }
    }

    if (type === "embed") {
      const link =
        plainText(block.properties?.source) ||
        block.format?.display_source ||
        block.format?.original_url ||
        ""

      return {
        type,
        markdown: link ? `[嵌入内容](${rewriteLink(link, pageIdToSlug)})` : children,
      }
    }

    if (type === "toggle") {
      return {
        type,
        markdown: [`**${title}**`, children].filter(Boolean).join("\n\n"),
      }
    }

    if (type === "column_list" || type === "column") {
      return {
        type,
        markdown: children,
      }
    }

    if (type === "page" && id === item.id) {
      return {
        type,
        markdown: children,
      }
    }

    warnings.push(`${item.title}: unsupported block type ${type} (${id})`)
    return {
      type,
      markdown: [title, children].filter(Boolean).join("\n\n"),
    }
  }

  return (await renderBlock(item.id)).markdown.trim()
}

async function importPosts() {
  const inventoryItems = await readInventory()
  const publicItems = inventoryItems.filter((item) => item.isPublic)
  const pageIdToSlug = new Map(
    publicItems.map((item) => [
      item.id,
      item.existingFile ? path.parse(item.existingFile).name : slugForItem(item),
    ]),
  )
  const items = publicItems.filter((item) => !item.existingFile)
  const warnings = []
  const imported = []

  console.log(`Importing ${items.length} public Notion posts as drafts.`)

  for (const [index, item] of items.entries()) {
    const slug = slugForItem(item)
    const filename = `${slug}.md`
    const targetPath = path.join(postsDirectory, filename)

    try {
      await fs.access(targetPath)
      console.log(`[${index + 1}/${items.length}] Skip existing ${filename}`)
      continue
    } catch {
      // The target is available for a new import.
    }

    console.log(`[${index + 1}/${items.length}] Reading ${item.title}`)
    const blocks = await loadCompletePage(item.id)
    const body = await renderPage({
      item,
      slug,
      blocks,
      pageIdToSlug,
      warnings,
    })

    let cover = ""
    if (item.cover) {
      try {
        const coverName = plainFilename(item.cover)
        const coverExtension = path.extname(coverName)
        cover = await downloadAsset({
          source: item.cover,
          blockId: item.id,
          slug,
          kind: "image",
          preferredName: `cover${coverExtension}`,
        })
      } catch (error) {
        warnings.push(`${item.title}: cover failed: ${error.message}`)
      }
    }

    const source = matter.stringify(body, {
      title: item.title,
      slug,
      date: `${item.date}T00:00:00.000+08:00`,
      updated: item.updated,
      excerpt: item.description,
      category: categoryForItem(item),
      tags: item.tags,
      cover,
      featured: item.featured,
      draft: true,
    })

    await fs.writeFile(targetPath, source, {
      encoding: "utf8",
      flag: "wx",
    })

    imported.push({
      title: item.title,
      slug,
      filename,
    })
    console.log(`[${index + 1}/${items.length}] Wrote ${filename}`)
  }

  console.log(
    JSON.stringify(
      {
        imported,
        warnings,
      },
      null,
      2,
    ),
  )
}

function markdownDestinations(source) {
  const destinations = []

  for (let start = source.indexOf("]("); start !== -1; start = source.indexOf("](", start + 2)) {
    let depth = 1
    let escaped = false
    let end = start + 2

    for (; end < source.length; end += 1) {
      const character = source[end]

      if (escaped) {
        escaped = false
        continue
      }

      if (character === "\\") {
        escaped = true
        continue
      }

      if (character === "(") depth += 1
      if (character === ")") depth -= 1
      if (depth === 0) break
    }

    if (depth !== 0) continue

    const rawDestination = source.slice(start + 2, end)
    const destination = rawDestination.match(/^(\S+?)(?:\s+"[^"]*")?$/)?.[1]
    if (destination) destinations.push(destination)
  }

  return destinations
}

async function verifyImport() {
  const errors = []
  let localAssetReferences = 0

  for (const slug of IMPORTED_SLUGS) {
    const filename = `${slug}.md`
    const filePath = path.join(postsDirectory, filename)
    let source

    try {
      source = await fs.readFile(filePath, "utf8")
    } catch {
      errors.push(`Missing imported post: ${filename}`)
      continue
    }

    const { data, content } = matter(source)

    if (data.slug !== slug) errors.push(`${filename}: frontmatter slug mismatch`)
    if (typeof data.draft !== "boolean") {
      errors.push(`${filename}: missing boolean draft field`)
    }
    if (!data.title) errors.push(`${filename}: missing title`)
    if (Number.isNaN(new Date(String(data.date ?? "")).getTime())) {
      errors.push(`${filename}: invalid date`)
    }
    if (!content.trim()) errors.push(`${filename}: empty body`)

    const localPaths = [
      ...(typeof data.cover === "string" && data.cover.startsWith("/")
        ? [data.cover]
        : []),
      ...markdownDestinations(content).filter(
        (destination) =>
          destination.startsWith("/images/") || destination.startsWith("/files/"),
      ),
    ]

    for (const localPath of localPaths) {
      localAssetReferences += 1

      try {
        await fs.access(path.join(publicDirectory, localPath.replace(/^\//, "")))
      } catch {
        errors.push(`${filename}: missing local asset ${localPath}`)
      }
    }
  }

  const result = {
    posts: IMPORTED_SLUGS.length,
    localAssetReferences,
    errors,
  }

  console.log(JSON.stringify(result, null, 2))

  if (errors.length > 0) {
    process.exitCode = 1
  }
}

const command = process.argv[2] ?? "inventory"

if (command === "inventory") {
  await inventory()
} else if (command === "inspect-types") {
  await inspectTypes()
} else if (command === "import") {
  await importPosts()
} else if (command === "verify") {
  await verifyImport()
} else {
  throw new Error(`Unsupported command: ${command}`)
}
