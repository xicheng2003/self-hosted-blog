export function buildAssetProxyPath(key: string) {
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`
}

export function buildAssetPublicUrl(key: string, publicDomain?: string) {
  const normalizedDomain = publicDomain?.replace(/\/+$/, "")

  if (!normalizedDomain) {
    return buildAssetProxyPath(key)
  }

  return `${normalizedDomain}/${key.split("/").map(encodeURIComponent).join("/")}`
}

export function resolveManagedAssetUrl(value: string, publicDomain?: string) {
  if (!value || value.startsWith("/api/files/")) {
    return value
  }

  if (!/^https?:\/\//.test(value) || !publicDomain) {
    return value
  }

  try {
    const assetUrl = new URL(value)
    const managedUrl = new URL(publicDomain)

    if (assetUrl.origin !== managedUrl.origin) {
      return value
    }

    const key = decodeURIComponent(assetUrl.pathname.replace(/^\/+/, ""))
    return key ? buildAssetProxyPath(key) : value
  } catch {
    return value
  }
}
