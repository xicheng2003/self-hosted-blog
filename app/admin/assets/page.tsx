"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderOpen, Upload, Trash2, Copy, Loader2, Filter, CheckSquare, Square, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Asset {
    id: string
    url: string
    key: string
    filename: string
    mimeType: string
    size: number
    createdAt: string
    isUnused: boolean
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [showUnusedOnly, setShowUnusedOnly] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

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
            toast.error('Failed to load assets')
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
            // Reset input
            e.target.value = ''
        }
    }

    // Single Delete
    const handleDelete = async (asset: Asset) => {
        if (!asset.isUnused) {
            if (!confirm("⚠️ Warning: This asset is currently used in a post or setting! Are you sure you want to delete it?")) return
        } else {
            if (!confirm("Are you sure you want to delete this asset? This cannot be undone.")) return
        }

        setDeletingId(asset.id)
        try {
            const res = await fetch('/api/assets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: asset.id, key: asset.key }),
            })

            if (res.ok) {
                toast.success('Asset deleted')
                setAssets(prev => prev.filter(a => a.id !== asset.id))
                // Remove from selection if it was selected
                if (selectedIds.has(asset.id)) {
                    const newSelected = new Set(selectedIds)
                    newSelected.delete(asset.id)
                    setSelectedIds(newSelected)
                }
            } else {
                toast.error('Failed to delete asset')
            }
        } catch (error) {
            toast.error('Error deleting asset')
        } finally {
            setDeletingId(null)
        }
    }

    // Bulk Delete
    const handleBulkDelete = async () => {
        const assetsToDelete = assets.filter(a => selectedIds.has(a.id))
        const count = assetsToDelete.length
        if (count === 0) return

        // Check for used assets
        const usedCount = assetsToDelete.filter(a => !a.isUnused).length
        let message = `Are you sure you want to delete ${count} assets?`
        if (usedCount > 0) {
            message += `\n\n⚠️ WARNING: ${usedCount} of these assets are currently marked as USED in posts.`
        }

        if (!confirm(message)) return

        setIsBulkDeleting(true)
        try {
            const payload = assetsToDelete.map(a => ({ id: a.id, key: a.key }))

            const res = await fetch('/api/assets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                const result = await res.json()
                toast.success(`Successfully deleted ${result.deletedCount || count} assets`)
                setAssets(prev => prev.filter(a => !selectedIds.has(a.id)))
                setSelectedIds(new Set())
            } else {
                toast.error('Failed to delete assets')
            }
        } catch (error) {
            toast.error('Error during bulk deletion')
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredAssets.length && filteredAssets.length > 0) {
            setSelectedIds(new Set())
        } else {
            const newSelected = new Set<string>()
            filteredAssets.forEach(a => newSelected.add(a.id))
            setSelectedIds(newSelected)
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

    const filteredAssets = showUnusedOnly
        ? assets.filter(a => a.isUnused)
        : assets

    const allSelected = filteredAssets.length > 0 && selectedIds.size === filteredAssets.length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-medium tracking-tight">Asset Management</h1>
                    <p className="text-sm text-neutral-500">
                        Manage your uploaded files. {showUnusedOnly && <span className="text-amber-600 font-medium">(Showing unused files only)</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Selection Actions */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-5">
                            <span className="text-sm font-medium">{selectedIds.size} selected</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                            >
                                {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Selected
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds(new Set())}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        </div>
                    )}

                    <Button
                        variant={showUnusedOnly ? "secondary" : "outline"}
                        onClick={() => {
                            setShowUnusedOnly(!showUnusedOnly)
                            setSelectedIds(new Set()) // Clear selection when filter changes to avoid confusion
                        }}
                        className={showUnusedOnly ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : ""}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {showUnusedOnly ? "Show All" : "Filter Unused"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={toggleSelectAll}
                        disabled={filteredAssets.length === 0}
                    >
                        {allSelected ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                        {allSelected ? "Deselect All" : "Select All"}
                    </Button>

                    <div className="relative">
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
                            Upload
                        </Button>
                    </div>
                </div>
            </div>

            {/* Asset Grid */}
            {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 border-2 border-dashed rounded-lg">
                    <FolderOpen className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No assets yet</p>
                    <p className="text-sm">Upload your first file to get started.</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                    <p>No unused assets found.</p>
                    <Button variant="link" onClick={() => setShowUnusedOnly(false)}>View all assets</Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className={`group relative border rounded-lg overflow-hidden bg-white shadow-sm transition-all ${selectedIds.has(asset.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'}`}
                        >
                            <div className="aspect-square relative bg-neutral-100">
                                {/* Clickable Content Area */}
                                <div
                                    className="w-full h-full cursor-pointer"
                                    onClick={() => toggleSelection(asset.id)}
                                >
                                    {asset.mimeType.startsWith('image/') ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.filename}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FolderOpen className="h-10 w-10 text-neutral-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Selection Checkbox - Sibling to content */}
                                <div
                                    className="absolute top-2 left-2 z-20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Checkbox
                                        checked={selectedIds.has(asset.id)}
                                        onCheckedChange={() => toggleSelection(asset.id)}
                                        className={`bg-white/80 backdrop-blur-sm border-neutral-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 ${selectedIds.has(asset.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'} transition-opacity`}
                                    />
                                </div>

                                {/* Overlay with Actions - Sibling to content */}
                                <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                    <div
                                        className="pointer-events-auto flex gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => copyUrl(asset.url)}
                                            title="Copy URL"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => handleDelete(asset)}
                                            title="Delete"
                                            disabled={deletingId === asset.id}
                                        >
                                            {deletingId === asset.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Unused Badge */}
                                {asset.isUnused && (
                                    <div className="absolute top-2 right-2 z-10 pointer-events-none">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                                            Unused
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            <div
                                className="p-3 cursor-pointer"
                                onClick={() => toggleSelection(asset.id)}
                            >
                                <p className="text-sm font-medium truncate" title={asset.filename}>{asset.filename}</p>
                                <div className="flex justify-between items-center mt-1 text-xs text-neutral-400">
                                    <span>{formatFileSize(asset.size)}</span>
                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
