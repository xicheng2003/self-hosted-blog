import { MessageSquare } from "lucide-react"

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium tracking-tight">Comments</h1>
        <p className="text-sm text-neutral-500">
          Manage comments on your blog posts.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <MessageSquare className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Coming Soon</p>
        <p className="text-sm">Comment management will be available in a future update.</p>
      </div>
    </div>
  )
}
