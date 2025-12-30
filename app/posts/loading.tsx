import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      <div className="max-w-[800px] mx-auto px-5 py-20">
        <header className="mb-24 text-left">
          <Skeleton className="h-12 w-48 mb-3" />
          <Skeleton className="h-6 w-24" />
        </header>

        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-baseline py-8 border-t border-border">
              <div className="w-[120px] shrink-0 mb-2 md:mb-0">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-16 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
