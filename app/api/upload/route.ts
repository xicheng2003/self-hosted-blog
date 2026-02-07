import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Sanitize filename: replace spaces and special chars with underscores
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${uuidv4()}-${sanitizedFilename}`
    const key = filename // In root directory

    // Upload to MinIO
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    // Construct Public URL
    // For Cloudflare R2 with custom domain, the domain maps directly to the bucket.
    const publicUrl = `${process.env.S3_PUBLIC_DOMAIN}/${key}`

    // Save to Database
    const asset = await prisma.asset.create({
      data: {
        url: publicUrl,
        key: key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      url: publicUrl,
      id: asset.id
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
