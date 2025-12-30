"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

interface SiteConfig {
  site_title: string
  site_description: string
  author_name: string
  author_email: string
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>({
    site_title: '',
    site_description: '',
    author_name: '',
    author_email: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (res.ok) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
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
          <h1 className="text-2xl font-serif font-medium tracking-tight">Settings</h1>
          <p className="text-sm text-neutral-500">
            Manage your blog settings.
          </p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-neutral-800"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Separator />

      <div className="max-w-2xl space-y-8">
        {/* Site Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Site Information</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={config.site_title}
                onChange={(e) => setConfig({ ...config, site_title: e.target.value })}
                placeholder="My Blog"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Input
                id="site_description"
                value={config.site_description}
                onChange={(e) => setConfig({ ...config, site_description: e.target.value })}
                placeholder="A personal blog about..."
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Author Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Author Information</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name</Label>
              <Input
                id="author_name"
                value={config.author_name}
                onChange={(e) => setConfig({ ...config, author_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_email">Author Email</Label>
              <Input
                id="author_email"
                type="email"
                value={config.author_email}
                onChange={(e) => setConfig({ ...config, author_email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
