import type { Element, Properties, Root, RootContent } from "hast"
import { unified } from "unified"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"

import { remarkMediaCard } from "@/lib/remark-media-card"

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

const attributeNames: Record<string, string> = {
  className: "class",
  htmlFor: "for",
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function propertyText(value: unknown) {
  if (Array.isArray(value)) return value.join(" ")
  if (typeof value === "string" || typeof value === "number") return String(value)
  return ""
}

function absoluteUrl(value: string, baseUrl: string) {
  const normalized = value.trim()
  if (!normalized) return ""

  try {
    const url = new URL(normalized, baseUrl)
    if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) return ""
    return url.toString()
  } catch {
    return ""
  }
}

function serializeProperties(
  properties: Properties,
  tagName: string,
  baseUrl: string,
) {
  return Object.entries(properties)
    .map(([propertyName, value]) => {
      if (value === null || value === undefined || value === false) return ""
      if (/^on/i.test(propertyName)) return ""

      const name = attributeNames[propertyName] ?? propertyName
      if (!/^[a-zA-Z_:][a-zA-Z0-9:._-]*$/.test(name)) return ""
      if (value === true) return ` ${name}`

      let text = propertyText(value)
      if ((tagName === "a" && name === "href") || (tagName === "img" && name === "src")) {
        text = absoluteUrl(text, baseUrl)
      }

      return text ? ` ${name}="${escapeHtml(text)}"` : ""
    })
    .join("")
}

function serializeMediaCard(properties: Properties, baseUrl: string) {
  const type = propertyText(properties.type).toLowerCase()
  const title = propertyText(properties.title)
  const cover = absoluteUrl(propertyText(properties.cover), baseUrl)
  const author = propertyText(properties.author)
  const status = propertyText(properties.status)
  const rating = propertyText(properties.rating)
  const comment = propertyText(properties.comment)

  const details = [
    cover ? `<img src="${escapeHtml(cover)}" alt="" />` : "",
    title ? `<h3>${escapeHtml(title)}</h3>` : "",
    author ? `<p>作者 / 主创：${escapeHtml(author)}</p>` : "",
    status ? `<p>状态：${escapeHtml(status)}</p>` : "",
    rating && rating !== "0" ? `<p>评分：${escapeHtml(rating)} / 5</p>` : "",
    comment ? `<p>${escapeHtml(comment).replaceAll("\n", "<br />")}</p>` : "",
  ].join("")

  const typeAttribute = type ? ` data-media-type="${escapeHtml(type)}"` : ""
  return `<aside${typeAttribute}>${details}</aside>`
}

function serializeElement(element: Element, baseUrl: string): string {
  if (element.tagName === "media-card") {
    return serializeMediaCard(element.properties, baseUrl)
  }

  const tagName = /^[a-z][a-z0-9-]*$/i.test(element.tagName)
    ? element.tagName.toLowerCase()
    : "span"
  const properties = serializeProperties(element.properties, tagName, baseUrl)
  const children = element.children.map((child) => serializeNode(child, baseUrl)).join("")

  if (voidElements.has(tagName)) return `<${tagName}${properties} />`
  return `<${tagName}${properties}>${children}</${tagName}>`
}

function serializeNode(node: Root | RootContent, baseUrl: string): string {
  switch (node.type) {
    case "root":
      return node.children.map((child) => serializeNode(child, baseUrl)).join("")
    case "element":
      return serializeElement(node, baseUrl)
    case "text":
      return escapeHtml(node.value)
    case "doctype":
      return ""
    case "comment":
      return ""
    case "raw":
      return escapeHtml(node.value)
  }
}

export function renderFeedMarkdown(markdown: string, baseUrl: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMediaCard)
    .use(remarkRehype)
  const source = markdown.replace(/\\\[/g, "[").replace(/\\\]/g, "]")
  const tree = processor.runSync(processor.parse(source)) as Root

  return serializeNode(tree, baseUrl)
}
