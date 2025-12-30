"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderOpen, Upload, Trash2, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Asset {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

export default function FilesPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets')
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        toast.success('File uploaded successfully')
        fetchAssets()
      } else {
        toast.error('Failed to upload file')
      }
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-tight">Files</h1>
          <p className="text-sm text-neutral-500">
            Manage your uploaded files and images.
          </p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
          />
          <Button 
            className="bg-black text-white hover:bg-neutral-800"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 border-2 border-dashed rounded-lg">
          <FolderOpen className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No files yet</p>
          <p className="text-sm">Upload your first file to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="group relative border rounded-lg overflow-hidden bg-neutral-50"
            >
              {asset.mimeType.startsWith('image/') ? (
                <img 
                  src={asset.url} 
                  alt={asset.filename}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center">
                  <FolderOpen className="h-8 w-8 text-neutral-400" />
                </div>
              )}
              <div className="p-2">
                <p className="text-sm font-medium truncate">{asset.filename}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(asset.size)}</p>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => copyUrl(asset.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
