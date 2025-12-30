import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

interface CalloutProps {
  icon?: string
  children?: React.ReactNode
  type?: "default" | "warning" | "danger" | "info"
  className?: string
}

export function Callout({
  children,
  className,
  type = "default",
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn(
        "my-6 flex items-start rounded-md border border-l-4 p-4",
        {
          "border-neutral-200 bg-neutral-50 text-neutral-900": type === "default",
          "border-red-900/50 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-200":
            type === "danger",
          "border-yellow-900/50 bg-yellow-50 text-yellow-900 dark:border-yellow-500/30 dark:bg-yellow-950/50 dark:text-yellow-200":
            type === "warning",
          "border-blue-900/50 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-200":
            type === "info",
        },
        className
      )}
      {...props}
    >
      <div className="mr-4 mt-0.5 text-muted-foreground">
        <Quote className="h-5 w-5 opacity-50" />
      </div>
      <div className="text-sm leading-7 font-serif italic opacity-90">
        {children}
      </div>
    </div>
  )
}
