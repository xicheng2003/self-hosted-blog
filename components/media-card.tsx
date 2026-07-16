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

const labels: Record<MediaCardProps["type"], string> = {
  BOOK: "读书",
  MOVIE: "观影",
  MUSIC: "听歌",
  GAME: "游戏",
  TV: "剧集",
}

function normalizeCover(value?: string) {
  return value?.trim().replace(/^</, "").replace(/>\\?$/, "")
}

export function MediaCard({ type, title, cover, rating, comment, author, status }: MediaCardProps) {
  const coverSource = normalizeCover(cover)
  const roundedRating = rating ? Math.max(0, Math.min(5, Math.round(rating))) : 0

  return (
    <aside className="media-card">
      <div className="media-card-cover">
        {coverSource ? (
          <Image src={coverSource} alt={title} fill sizes="120px" />
        ) : (
          <span aria-hidden>{labels[type].slice(0, 1)}</span>
        )}
      </div>

      <div className="media-card-copy">
        <div className="media-card-meta">
          <span>{labels[type]}</span>
          {status && <span>{status}</span>}
          {roundedRating > 0 && (
            <span aria-label={`${roundedRating} / 5 分`}>
              {"★".repeat(roundedRating)}{"☆".repeat(5 - roundedRating)}
            </span>
          )}
        </div>
        <h3>{title}</h3>
        {author && <p className="media-card-author">{author}</p>}
        {comment && <p className="media-card-comment">{comment}</p>}
      </div>
    </aside>
  )
}
