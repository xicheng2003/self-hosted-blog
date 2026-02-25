
import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { notFound } from "next/navigation"

interface PostWithRelations {
    id: string; title: string; slug: string; content: string;
    excerpt: string | null; coverImage: string | null;
    published: boolean; viewCount: number;
    createdAt: Date; updatedAt: Date;
    authorId: string; categoryId: string | null;
    author: { id: string; name: string | null; email: string; image: string | null };
    tags: { id: string; name: string; slug: string }[];
    category: { id: string; name: string; slug: string } | null;
}

export const getPost = cache(async (slug: string): Promise<PostWithRelations> => {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: { author: true, tags: true, category: true }
    })

    if (!post) {
        notFound()
    }

    return post as PostWithRelations
})

// Optional: Preload function pattern if needed in future
export const preloadPost = (slug: string) => {
    void getPost(slug)
}
