import {
  getEmailConfig,
  getPublicSiteUrl,
  getSubscriptionSecret,
} from "../lib/email/config"
import { getResend } from "../lib/email/resend"
import { verifySubscriptionToken } from "../lib/email/subscription-token"

function redirectTo(pathname: string) {
  return Response.redirect(new URL(pathname, getPublicSiteUrl()), 303)
}

async function addOrRestoreContact(email: string) {
  const resend = getResend()
  const config = getEmailConfig()
  const existing = await resend.contacts.get({ email })

  if (existing.error?.statusCode === 404) {
    const created = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: config.segmentId }],
      topics: [{ id: config.topicId, subscription: "opt_in" }],
    })

    if (created.error) throw new Error(created.error.message)
    return
  }

  if (existing.error) throw new Error(existing.error.message)

  const restored = await resend.contacts.update({ email, unsubscribed: false })
  if (restored.error) throw new Error(restored.error.message)

  const segments = await resend.contacts.segments.list({ email, limit: 100 })
  if (segments.error) throw new Error(segments.error.message)

  if (!segments.data?.data.some((segment) => segment.id === config.segmentId)) {
    const added = await resend.contacts.segments.add({
      email,
      segmentId: config.segmentId,
    })
    if (added.error) throw new Error(added.error.message)
  }

  const topicUpdate = await resend.contacts.topics.update({
    email,
    topics: [{ id: config.topicId, subscription: "opt_in" }],
  })
  if (topicUpdate.error) throw new Error(topicUpdate.error.message)
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")

  if (!token) return redirectTo("/subscribe/invalid")

  const email = verifySubscriptionToken(token, getSubscriptionSecret())
  if (!email) return redirectTo("/subscribe/invalid")

  try {
    await addOrRestoreContact(email)
    return redirectTo("/subscribe/confirmed")
  } catch (error) {
    console.error("Unable to confirm subscription", error)
    return redirectTo("/subscribe/invalid")
  }
}
