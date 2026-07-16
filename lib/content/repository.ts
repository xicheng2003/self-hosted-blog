import type { PostRepository } from "@/lib/content/types"
import { LocalPostRepository } from "@/lib/content/local-post-repository"

// Public pages depend on this interface, not on the storage implementation.
// A future database/CMS adapter only needs to implement PostRepository.
export const postRepository: PostRepository = new LocalPostRepository()
