
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-gray-200">

            {/* ---------------- Navigation Skeleton ---------------- */}
            <nav className="max-w-3xl mx-auto px-6 py-12 flex justify-between items-center">
                <Skeleton className="h-8 w-32 bg-gray-200" />
                <div className="flex gap-6">
                    <Skeleton className="h-4 w-12 bg-gray-200" />
                    <Skeleton className="h-4 w-12 bg-gray-200" />
                    <Skeleton className="h-4 w-12 bg-gray-200" />
                </div>
            </nav>

            {/* ---------------- Main Content Skeleton ---------------- */}
            <main className="max-w-3xl mx-auto px-6 pb-20 relative">

                {/* Article Header Skeleton */}
                <header className="mt-8 mb-12">
                    <div className="w-12 h-[1px] bg-gray-300 mb-8"></div>

                    {/* Title */}
                    <Skeleton className="h-12 w-3/4 mb-4 bg-gray-200" />
                    <Skeleton className="h-12 w-1/2 mb-6 bg-gray-200" />

                    {/* Metadata */}
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24 bg-gray-200" />
                        <Skeleton className="h-4 w-20 bg-gray-200" />
                        <Skeleton className="h-4 w-16 bg-gray-200" />
                    </div>
                </header>

                {/* Cover Image Skeleton */}
                <Skeleton className="w-full h-[300px] md:h-[400px] mb-12 rounded-sm bg-gray-200" />

                {/* Article Content Skeleton using multiple paragraphs */}
                <article className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-2/3 bg-gray-200" />
                    </div>

                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-5/6 bg-gray-200" />
                        <Skeleton className="h-4 w-full bg-gray-200" />
                    </div>

                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-32 w-full bg-gray-200 rounded-sm" />
                    </div>
                </article>

            </main>
        </div>
    )
}
