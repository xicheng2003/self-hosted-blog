import { MetadataRoute } from 'next'
import { getSitemapData } from '@/lib/posts'

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSitemapData()

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...postEntries,
  ]
}
