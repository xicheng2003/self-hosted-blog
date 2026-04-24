import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

import { requireAdminApi } from "@/lib/auth"
import { buildAssetPublicUrl } from "@/lib/asset-url"

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
  "text/plain": "txt",
}

type UploadInput = {
  arrayBuffer: () => Promise<ArrayBuffer>
  size: number
  type: string
  name?: string
}

function isUploadInput(value: FormDataEntryValue | null): value is UploadInput {
  return !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
}

function inferExtensionFromMimeType(mimeType: string) {
  return MIME_EXTENSION_MAP[mimeType] || mimeType.split("/")[1]?.replace(/[^a-z0-9]+/gi, "") || "bin"
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi()
    if ("response" in admin) {
      return admin.response
    }

    const formData = await req.formData()
    const upload = formData.get("file")

    if (!isUploadInput(upload)) {
      return NextResponse.json({ error: "No file uploaded or invalid file" }, { status: 400 })
    }

    const file = upload

    // Validation: Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Validation: Allowed types
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'text/']
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type))
    if (!isAllowed) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fallbackFilename = `upload-${Date.now()}.${inferExtensionFromMimeType(file.type)}`
    const originalFilename = typeof file.name === "string" && file.name.trim().length > 0
      ? file.name
      : fallbackFilename
    // Sanitize filename: replace spaces and special chars with underscores
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
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
    const publicUrl = buildAssetPublicUrl(key, process.env.S3_PUBLIC_DOMAIN)

    // Save to Database
    const asset = await prisma.asset.create({
      data: {
        url: publicUrl,
        key: key,
        filename: originalFilename,
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
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
