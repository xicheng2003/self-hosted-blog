import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    })

    return NextResponse.json({ viewCount: post.viewCount })
  } catch (error) {
    console.error("Failed to increment view count:", error)
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    )
  }
}
