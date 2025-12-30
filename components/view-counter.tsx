"use client"

import { useEffect, useState } from "react"

interface ViewCounterProps {
  slug: string
  initialViews: number
}

export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)
  const [hasIncremented, setHasIncremented] = useState(false)

  useEffect(() => {
    // Prevent double counting in React Strict Mode or re-renders
    if (hasIncremented) return

    const incrementView = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}/view`, {
          method: "POST",
        })
        
        if (res.ok) {
          const data = await res.json()
          setViews(data.viewCount)
          setHasIncremented(true)
        }
      } catch (error) {
        console.error("Failed to increment view count", error)
      }
    }

    incrementView()
  }, [slug, hasIncremented])

  return <span>{views} 阅读</span>
}
