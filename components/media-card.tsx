"use client"

import { Star, Book, Film, Music, Gamepad2, Tv } from "lucide-react"
import Image from "next/image"

interface MediaCardProps {
  type: "BOOK" | "MOVIE" | "MUSIC" | "GAME" | "TV"
  title: string
  cover?: string
  rating?: number
  comment?: string
  author?: string
  status?: string
}

export function MediaCard({ type, title, cover, rating, comment, author, status }: MediaCardProps) {
  const getIcon = () => {
    switch (type) {
      case "BOOK": return <Book className="w-3.5 h-3.5" />
      case "MOVIE": return <Film className="w-3.5 h-3.5" />
      case "MUSIC": return <Music className="w-3.5 h-3.5" />
      case "GAME": return <Gamepad2 className="w-3.5 h-3.5" />
      case "TV": return <Tv className="w-3.5 h-3.5" />
      default: return <Film className="w-3.5 h-3.5" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case "BOOK": return "读书"
      case "MOVIE": return "观影"
      case "MUSIC": return "听歌"
      case "GAME": return "游戏"
      case "TV": return "剧集"
      default: return "记录"
    }
  }

  const getTheme = () => {
    switch (type) {
      case "BOOK": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", iconBg: "bg-amber-100" }
      case "MOVIE": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", iconBg: "bg-blue-100" }
      case "MUSIC": return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", iconBg: "bg-rose-100" }
      case "GAME": return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", iconBg: "bg-purple-100" }
      case "TV": return { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", iconBg: "bg-teal-100" }
      default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", iconBg: "bg-gray-100" }
    }
  }

  const theme = getTheme()

  const getStatusColor = (s: string) => {
    if (s.includes("在") || s.includes("ing")) return "text-blue-600"
    if (s.includes("完") || s.includes("Done")) return "text-green-600"
    if (s.includes("想") || s.includes("Todo")) return "text-neutral-500"
    if (s.includes("弃") || s.includes("Drop")) return "text-red-600"
    return "text-neutral-600"
  }

  return (
    <div className="not-prose my-12 group">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* Cover Image - Sharp, Shadowed */}
        <div className="shrink-0 w-[100px] sm:w-[120px] relative aspect-[2/3] shadow-xl transition-transform duration-500 group-hover:-translate-y-1 bg-neutral-100">
          {cover ? (
            <img 
              src={cover} 
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              {getIcon()}
            </div>
          )}
        </div>
        
        {/* Content - Editorial Style */}
        <div className="flex-1 py-1 min-h-[150px] flex flex-col">
          {/* Header: Type | Status */}
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase mb-3">
            <span className="flex items-center gap-1.5">
               {getLabel()}
            </span>
            {status && (
              <>
                <span className="w-px h-3 bg-neutral-200"></span>
                <span className={getStatusColor(status)}>{status}</span>
              </>
            )}
            {(rating !== undefined && rating > 0) && (
                <>
                    <span className="w-px h-3 bg-neutral-200"></span>
                    <div className="flex items-center gap-0.5" title={`Rating: ${rating}`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-neutral-300"}`} 
                            />
                        ))}
                    </div>
                    <span className="text-amber-500 ml-0.5">{rating.toFixed(1)}</span>
                </>
            )}
          </div>
            
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight">
            {title}
          </h3>
            
          {author && (
            <p className="text-sm font-medium text-neutral-500 mb-4 tracking-wide">
              {author}
            </p>
          )}
            
          {comment && (
            <div className="mt-auto pt-4 border-t border-neutral-100">
              <div className="font-serif text-base text-neutral-600 italic leading-relaxed">
                {comment.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
