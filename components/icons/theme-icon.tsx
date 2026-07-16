export type ThemeIconName = "system" | "dark" | "light"

type ThemeIconProps = {
  theme: ThemeIconName
}

export function ThemeIcon({ theme }: ThemeIconProps) {
  if (theme === "system") {
    return (
      <svg
        className="theme-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2.75" y="3.75" width="18.5" height="14" rx="2.25" />
        <circle cx="12" cy="10.75" r="3" />
        <path
          d="M12 7.75a3 3 0 0 1 0 6Z"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="none"
        />
        <path d="M12 7.75v6M8.5 20.25h7M12 17.75v2.5" />
      </svg>
    )
  }

  if (theme === "dark") {
    return (
      <svg
        className="theme-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M19.35 15.15A7.9 7.9 0 0 1 8.85 4.65a8 8 0 1 0 10.5 10.5Z"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path d="M17.5 4.25v2.5M18.75 5.5h-2.5" />
      </svg>
    )
  }

  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3.75" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.45 5.45l1.4 1.4M17.15 17.15l1.4 1.4M18.55 5.45l-1.4 1.4M6.85 17.15l-1.4 1.4" />
    </svg>
  )
}
