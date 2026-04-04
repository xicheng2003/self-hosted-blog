import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { s3Client } from '@/lib/s3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { requireAdminApi } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Fetch all assets with usage status
export async function GET() {
  try {
    const admin = await requireAdminApi()
    if ("response" in admin) {
      return admin.response
    }

    const assets: { id: string; url: string; key: string; filename: string; mimeType: string; size: number; createdAt: Date }[] = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Fetch all content that might reference assets
    const posts: { content: string | null; coverImage: string | null }[] = await prisma.post.findMany({
      select: { content: true, coverImage: true }
    })
    const users: { image: string | null }[] = await prisma.user.findMany({
      select: { image: true }
    })
    const siteConfig: { value: string }[] = await prisma.siteConfig.findMany({
      select: { value: true }
    })

    // Create a set of explicitly used URLs (cover images, avatars, config)
    const exactMatches = new Set<string>()
    posts.forEach((p: { content: string | null; coverImage: string | null }) => {
      if (p.coverImage) exactMatches.add(p.coverImage)
    })
    users.forEach((u: { image: string | null }) => {
      if (u.image) exactMatches.add(u.image)
    })
    siteConfig.forEach((c: { value: string }) => {
      exactMatches.add(c.value)
    })

    // Concatenate all markdown content for searching
    const allContent = posts.map((p: { content: string | null; coverImage: string | null }) => p.content || '').join(' ')
    
    // Extract all potential URLs and keys from content to speed up matching
    // This is much faster than doing .includes() for every asset on a giant string
    const contentParts = allContent.split(/[\s()\[\]'"]+/)
    const contentSegments = new Set(contentParts)

    // Determine usage status
    const assetsWithUsage = assets.map((asset: { id: string; url: string; key: string; filename: string; mimeType: string; size: number; createdAt: Date }) => {
      const isUsed =
        exactMatches.has(asset.url) ||
        contentSegments.has(asset.url) ||
        contentSegments.has(asset.key) ||
        allContent.includes(asset.url) // Fallback for cases where it's not cleanly separated by delimiters

      return {
        ...asset,
        isUnused: !isUsed
      }
    })

    return NextResponse.json(assetsWithUsage)
  } catch (error) {
    console.error('Fetch assets error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// DELETE - Delete assets (single or bulk)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminApi()
    if ("response" in admin) {
      return admin.response
    }

    const body = await req.json()

    // Normalize to array
    const itemsToDelete = Array.isArray(body) ? body : [body]

    if (itemsToDelete.length === 0) {
      return NextResponse.json({ error: 'No assets specified' }, { status: 400 })
    }

    const deletedIds: string[] = []
    const failed: { id: string, key: string, error: string }[] = []

    // 1. Delete from S3 (R2) in parallel
    await Promise.all(itemsToDelete.map(async (item: { id: string, key: string }) => {
      try {
        if (item.key) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: item.key,
          }))
        }
        deletedIds.push(item.id)
      } catch (s3Error: unknown) {
        console.error(`S3 Delete Error for ${item.key}:`, s3Error)
        const error = s3Error as Error
        failed.push({ id: item.id, key: item.key, error: error.message || 'S3 deletion failed' })
      }
    }))

    // 2. Delete from Database (Batch delete) - ONLY for those that succeeded in S3
    if (deletedIds.length > 0) {
      await prisma.asset.deleteMany({
        where: { id: { in: deletedIds } }
      })
    }

    return NextResponse.json({ 
      success: failed.length === 0, 
      deletedCount: deletedIds.length,
      failedCount: failed.length,
      failed: failed
    })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ error: 'Failed to delete assets' }, { status: 500 })
  }
}
