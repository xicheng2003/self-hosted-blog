import { siteConfig } from "../../content/site"

function requireEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getEmailConfig() {
  return {
    apiKey: requireEnv("RESEND_API_KEY"),
    from: requireEnv("RESEND_FROM_EMAIL"),
    replyTo: process.env.RESEND_REPLY_TO?.trim() || undefined,
    segmentId: requireEnv("RESEND_SEGMENT_ID"),
    topicId: requireEnv("RESEND_TOPIC_ID"),
  }
}

export function getSubscriptionSecret() {
  return requireEnv("SUBSCRIBE_SECRET")
}

export function getPublicSiteUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || siteConfig.url
  return url.replace(/\/$/, "")
}
