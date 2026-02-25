
import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { notFound } from "next/navigation"

// Cached function to get post by slug
// This will dedup requests within the same render cycle (e.g. metadata + page)
export const getPost = cache(async (slug: string) => {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: { author: true, tags: true, category: true }
    })

    if (!post) {
        notFound()
    }

    return post
})

// Optional: Preload function pattern if needed in future
export const preloadPost = (slug: string) => {
    void getPost(slug)
}
