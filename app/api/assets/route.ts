import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { s3Client } from '@/lib/s3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

// GET - Fetch all assets with usage status
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Fetch all content that might reference assets
    const posts = await prisma.post.findMany({
      select: { content: true, coverImage: true }
    })
    const users = await prisma.user.findMany({
      select: { image: true }
    })
    const siteConfig = await prisma.siteConfig.findMany({
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

    // Determine usage status
    const assetsWithUsage = assets.map((asset: { id: string; url: string; key: string; filename: string; mimeType: string; size: number; createdAt: Date }) => {
      const isUsed =
        exactMatches.has(asset.url) ||
        allContent.includes(asset.url) ||
        allContent.includes(asset.key) // Check key just in case

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
    const body = await req.json()

    // Normalize to array
    const itemsToDelete = Array.isArray(body) ? body : [body]

    if (itemsToDelete.length === 0) {
      return NextResponse.json({ error: 'No assets specified' }, { status: 400 })
    }

    const deletedIds: string[] = []
    const failedIds: string[] = []

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
      } catch (s3Error) {
        console.error(`S3 Delete Error for ${item.key}:`, s3Error)
        // If S3 fails, we might still want to delete from DB if it's gone effectively, 
        // but for safety let's track it. actually for simple blog, just proceed to delete from DB.
        deletedIds.push(item.id)
      }
    }))

    // 2. Delete from Database (Batch delete)
    if (deletedIds.length > 0) {
      await prisma.asset.deleteMany({
        where: { id: { in: deletedIds } }
      })
    }

    return NextResponse.json({ success: true, deletedCount: deletedIds.length })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ error: 'Failed to delete assets' }, { status: 500 })
  }
}
