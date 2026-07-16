import { postRepository } from "@/lib/content/repository"

export type { Post, PostSummary as PublishedPostListItem } from "@/lib/content/types"

export async function getPublishedPosts() {
  return postRepository.findPublished()
}

export async function getPublishedFeedPosts() {
  return postRepository.findPublishedWithContent()
}

export async function getLatestPublishedPosts(limit = 3) {
  const posts = await postRepository.findPublished()
  const featured = posts.filter((post) => post.featured)
  const source = featured.length > 0 ? featured : posts
  return source.slice(0, limit)
}

export async function getPublishedPostBySlug(slug: string) {
  return postRepository.findPublishedBySlug(slug)
}

export async function getPublishedPostSlugs() {
  return postRepository.findPublishedSlugs()
}

export async function getSitemapData() {
  const posts = await postRepository.findPublished()
  return posts.map((post) => ({ slug: post.slug, updatedAt: post.updatedAt }))
}
