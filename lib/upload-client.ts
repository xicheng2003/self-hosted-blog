const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
}

function inferExtensionFromMimeType(mimeType: string) {
  return MIME_EXTENSION_MAP[mimeType] || mimeType.split("/")[1]?.replace(/[^a-z0-9]+/gi, "") || "bin"
}

export function normalizeUploadFile(file: File) {
  if (file.name.trim().length > 0) {
    return file
  }

  const extension = inferExtensionFromMimeType(file.type)
  const filename = `editor-upload-${Date.now()}.${extension}`

  return new File([file], filename, {
    type: file.type,
    lastModified: file.lastModified || Date.now(),
  })
}

export async function uploadAsset(file: File) {
  const formData = new FormData()
  formData.append("file", normalizeUploadFile(file))

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  let payload: { error?: string; url?: string; id?: string } | null = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || "Upload failed")
  }

  return payload
}
