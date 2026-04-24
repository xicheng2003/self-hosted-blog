import { GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

import { s3Client } from "@/lib/s3"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{
    key: string[]
  }>
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { key: keyParts } = await context.params
  const key = keyParts.map(decodeURIComponent).join("/")

  if (!key) {
    return NextResponse.json({ error: "Missing file key" }, { status: 400 })
  }

  try {
    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    )

    const bytes = object.Body ? await object.Body.transformToByteArray() : new Uint8Array()
    const bodyBytes = Uint8Array.from(bytes)
    const contentType = object.ContentType || "application/octet-stream"
    const body = new Blob([bodyBytes], { type: contentType })

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": object.ContentLength?.toString() || body.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Asset proxy error:", error)
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
