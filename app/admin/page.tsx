"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FileText, Eye, Plus, Loader2, Download, Settings, X } from "lucide-react"
import { Editor } from "@/components/editor/editor"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  categoryId: string | null
  category?: { id: string; name: string } | null
  tags?: { id: string; name: string }[]
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

type TabType = 'content' | 'metadata'

export default function AdminDashboard() {
  const searchParams = useSearchParams()
  const slugParam = searchParams.get('slug')
  
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('content')
  
  // Content fields
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  
  // Metadata fields
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [published, setPublished] = useState(true)
  const [createdAt, setCreatedAt] = useState("")
  
  // New Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategorySlug, setNewCategorySlug] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadPost = useCallback((post: Post) => {
    setCurrentPostId(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setContent(post.content || '')
    setExcerpt(post.excerpt || '')
    setCoverImage(post.coverImage || '')
    setCategoryId(post.categoryId || '')
    setTags(post.tags?.map(t => t.name) || [])
    setPublished(post.published)
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    const date = new Date(post.createdAt)
    const formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16)
    setCreatedAt(formattedDate)
  }, [])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
        if (data.length > 0 && !slugParam) {
          loadPost(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [slugParam, loadPost])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [fetchPosts])

  // Load post from URL param
  useEffect(() => {
    if (slugParam && posts.length > 0) {
      const post = posts.find(p => p.slug === slugParam)
      if (post) {
        loadPost(post)
      }
    }
  }, [slugParam, posts, loadPost])

  const handleNewPost = () => {
    setCurrentPostId(null)
    setTitle('')
    setSlug('')
    setContent('')
    setExcerpt('')
    setCoverImage('')
    setCategoryId('')
    setTags([])
    setPublished(true)
    setActiveTab('content')
  }

  const handleDelete = async () => {
    if (!currentPostId || !slug) return
    if (!confirm('Are you sure you want to delete this post?')) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Post deleted')
      await fetchPosts()
      handleNewPost()
    } catch (error) {
      toast.error('Failed to delete post')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategorySlug) {
      toast.error('Name and slug are required')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, slug: newCategorySlug }),
      })

      if (!res.ok) throw new Error('Failed to create category')

      const newCategory = await res.json()
      setCategories([...categories, newCategory])
      setCategoryId(newCategory.id)
      setIsCreatingCategory(false)
      setNewCategoryName("")
      setNewCategorySlug("")
      toast.success('Category created')
    } catch (error) {
      toast.error('Failed to create category')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          coverImage: coverImage || null,
          categoryId: categoryId || null,
          tags,
          published,
          createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const savedPost = await res.json()
      toast.success('Post saved successfully')
      
      await fetchPosts()
      setCurrentPostId(savedPost.id)
    } catch (error) {
      toast.error('Failed to save post')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportMarkdown = () => {
    if (!title && !content) {
      toast.error('Nothing to export')
      return
    }

    // Build frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `slug: "${slug}"`,
      `date: "${new Date().toISOString()}"`,
      `published: ${published}`,
    ]
    
    if (excerpt) frontmatter.push(`excerpt: "${excerpt}"`)
    if (coverImage) frontmatter.push(`coverImage: "${coverImage}"`)
    if (tags.length > 0) frontmatter.push(`tags: [${tags.map(t => `"${t}"`).join(', ')}]`)
    
    frontmatter.push('---', '')

    const markdown = frontmatter.join('\n') + content

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug || 'untitled'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Markdown exported')
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-medium tracking-tight">Hi, Admin.</h1>
          <p className="text-sm text-neutral-500">
            {posts.length > 0 ? `You have ${posts.length} post(s)` : "Start writing your first post"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="bg-black text-white hover:bg-neutral-800"
            onClick={handleNewPost}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Posts List Sidebar */}
          <div className="w-64 shrink-0">
            <h3 className="text-sm font-medium text-neutral-500 mb-3">Posts</h3>
            <div className="space-y-1">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => loadPost(post)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentPostId === post.id
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-medium truncate">{post.title || 'Untitled'}</div>
                  <div className="text-xs text-neutral-400 truncate">/{post.slug}</div>
                </button>
              ))}
              {posts.length === 0 && (
                <p className="text-sm text-neutral-400 px-3 py-2">No posts yet</p>
              )}
            </div>
          </div>

          {/* Editor Section */}
          <div className="flex-1 max-w-3xl">
            {/* Tab Bar */}
            <div className="mb-8 flex items-center gap-2">
              <Button 
                variant={activeTab === 'content' ? 'outline' : 'ghost'} 
                size="sm" 
                className="h-8 rounded-md px-3 text-xs font-medium"
                onClick={() => setActiveTab('content')}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Content
              </Button>
              <Button 
                variant={activeTab === 'metadata' ? 'outline' : 'ghost'} 
                size="sm" 
                className="h-8 rounded-md px-3 text-xs font-medium text-neutral-500"
                onClick={() => setActiveTab('metadata')}
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                Metadata
              </Button>
              <div className="ml-auto flex items-center gap-2">
                {currentPostId && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    Delete
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleExportMarkdown}
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export MD
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 bg-black text-white hover:bg-neutral-800" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <>
                {/* Title Input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-4xl font-serif font-bold text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent mb-4"
                  placeholder="Post Title"
                />
                
                {/* Slug Input */}
                <div className="mb-8 flex items-center gap-2 text-sm text-neutral-400 font-mono">
                  <span>/post/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="outline-none bg-transparent text-neutral-500 w-full"
                    placeholder="url-slug"
                  />
                </div>

                <Editor value={content} onChange={setContent} />
              </>
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <div className="space-y-6">
                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt / Summary</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A brief summary of your post..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-neutral-500">
                    Displayed in post listings and SEO meta description.
                  </p>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {coverImage && (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Publish Date */}
                <div className="space-y-2">
                  <Label htmlFor="createdAt">Publish Date</Label>
                  <Input
                    id="createdAt"
                    type="datetime-local"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="flex gap-2">
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-neutral-200 bg-white text-sm outline-none focus:border-neutral-400"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {isCreatingCategory && (
                    <div className="p-3 border rounded-md bg-neutral-50 space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input 
                          value={newCategoryName} 
                          onChange={e => {
                            setNewCategoryName(e.target.value)
                            if (!newCategorySlug) {
                              setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                            }
                          }} 
                          placeholder="Category Name"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Slug</Label>
                        <Input 
                          value={newCategorySlug} 
                          onChange={e => setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                          placeholder="category-slug"
                          className="h-8"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsCreatingCategory(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleCreateCategory}>Create</Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Published Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="published"
                        checked={published}
                        onChange={() => setPublished(true)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="published"
                        checked={!published}
                        onChange={() => setPublished(false)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Draft</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
