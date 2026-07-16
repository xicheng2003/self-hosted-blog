type ExternalArrowProps = {
  className?: string
}

export function ExternalArrow({ className }: ExternalArrowProps) {
  const classes = ["external-arrow", className].filter(Boolean).join(" ")

  return (
    <svg
      className={classes}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  )
}
