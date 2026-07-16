export type PostTag = {
  name: string
  slug: string
}

export type PostCategory = {
  name: string
  slug: string
}

export type PostSummary = {
  id: string
  slug: string
  title: string
  excerpt: string
  publishedAt: Date
  updatedAt: Date
  category: PostCategory | null
  tags: PostTag[]
  coverImage: string | null
  featured: boolean
}

export type Post = PostSummary & {
  content: string
}

export interface PostRepository {
  findPublished(): Promise<PostSummary[]>
  findPublishedWithContent(): Promise<Post[]>
  findPublishedBySlug(slug: string): Promise<Post | null>
  findPublishedSlugs(): Promise<string[]>
}
