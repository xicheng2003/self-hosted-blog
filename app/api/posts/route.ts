import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"

// GET - Fetch all posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    const posts: Record<string, unknown>[] = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true, category: true, tags: true },
      ...(limit && { take: parseInt(limit) }),
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST - Create or Update a post
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, slug, published, categoryId, excerpt, coverImage, tags, createdAt } = body

    // Simple validation
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 })
    }

    // Use the logged in user's ID
    const authorId = session.user.id

    // Handle tags - create if not exists
    const tagConnections = tags && tags.length > 0
      ? await Promise.all(
        tags.map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
          })
          return { id: tag.id }
        })
      )
      : []

    const post = await prisma.post.upsert({
      where: { slug },
      update: {
        title,
        content,
        published,
        categoryId: categoryId || null,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        tags: {
          set: tagConnections,
        },
      },
      create: {
        title,
        content,
        slug,
        published: published || false,
        authorId,
        categoryId: categoryId || null,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        tags: {
          connect: tagConnections,
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Save post error:', error)
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }
}
