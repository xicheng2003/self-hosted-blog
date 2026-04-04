import { Prisma } from "@prisma/client"
import { cache } from "react"
import { prisma } from "@/lib/prisma"

const publishedPostDetailSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  coverImage: true,
  published: true,
  viewCount: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  tags: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.PostSelect

const latestPublishedPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  createdAt: true,
} satisfies Prisma.PostSelect

const publishedPostListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  createdAt: true,
  category: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.PostSelect

const adminPostSummarySelect = {
  id: true,
  title: true,
  slug: true,
  published: true,
  viewCount: true,
  createdAt: true,
  category: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.PostSelect

const adminPostDetailSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  coverImage: true,
  published: true,
  viewCount: true,
  categoryId: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  tags: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.PostSelect

export type PublishedPost = Prisma.PostGetPayload<{
  select: typeof publishedPostDetailSelect
}>

export type LatestPublishedPost = Prisma.PostGetPayload<{
  select: typeof latestPublishedPostSelect
}>

export type PublishedPostListItem = Prisma.PostGetPayload<{
  select: typeof publishedPostListSelect
}>

export type AdminPostSummary = Prisma.PostGetPayload<{
  select: typeof adminPostSummarySelect
}>

export type AdminPostDetail = Prisma.PostGetPayload<{
  select: typeof adminPostDetailSelect
}>

export const getPublishedPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug, published: true },
    select: publishedPostDetailSelect,
  })
})

export const getAdminPostBySlug = async (slug: string) => {
  return prisma.post.findUnique({
    where: { slug },
    select: adminPostDetailSelect,
  })
}

export const getLatestPublishedPosts = cache(async (limit = 3) => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: latestPublishedPostSelect,
  })
})

export const getPublishedPosts = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: publishedPostListSelect,
  })
})

export const getPublishedPostSlugs = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  })
})

export const getSitemapData = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })
})

export const getAdminPostSummaries = async (limit?: number) => {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: adminPostSummarySelect,
    ...(limit ? { take: limit } : {}),
  })
}
