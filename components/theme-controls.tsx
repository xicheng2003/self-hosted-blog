"use client"

import { useEffect, useState } from "react"

import { ThemeIcon } from "@/components/icons/theme-icon"

type Theme = "system" | "dark" | "light"

const storageKey = "home-page.theme"
const options: { ariaLabel: string; value: Theme }[] = [
  { ariaLabel: "跟随系统主题", value: "system" },
  { ariaLabel: "使用深色主题", value: "dark" },
  { ariaLabel: "使用浅色主题", value: "light" },
]

function isTheme(value: string | null): value is Theme {
  return value === "system" || value === "dark" || value === "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  if (theme === "system") root.removeAttribute("data-theme")
  else root.setAttribute("data-theme", theme)

  root.style.colorScheme = resolved
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? "#111110" : "#f8f8f6")
}

export function ThemeControls() {
  const [theme, setTheme] = useState<Theme>("system")
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey)
    const initialTheme = isTheme(savedTheme) ? savedTheme : "system"
    setTheme(initialTheme)
    applyTheme(initialTheme)
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return

    window.localStorage.setItem(storageKey, theme)
    applyTheme(theme)

    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => applyTheme("system")
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [isReady, theme])

  return (
    <div
      className="theme-controls"
      role="group"
      aria-label="颜色主题"
      data-active-index={options.findIndex((option) => option.value === theme)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
          onClick={() => setTheme(option.value)}
        >
          <ThemeIcon theme={option.value} />
        </button>
      ))}
    </div>
  )
}
