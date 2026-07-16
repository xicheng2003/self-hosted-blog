import { createHash } from "node:crypto"

import {
  getEmailConfig,
  getPublicSiteUrl,
  getSubscriptionSecret,
} from "../lib/email/config"
import { getResend } from "../lib/email/resend"
import { createSubscriptionToken } from "../lib/email/subscription-token"
import { createConfirmationEmail } from "../lib/email/templates"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null

  const email = value.trim().toLowerCase()
  return email.length <= 254 && emailPattern.test(email) ? email : null
}

export async function POST(request: Request) {
  let body: { email?: unknown; website?: unknown }

  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "请求内容无效。" }, { status: 400 })
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ message: "请检查邮箱中的确认链接。" })
  }

  const email = normalizeEmail(body.email)
  if (!email) {
    return Response.json({ message: "请输入有效的邮箱地址。" }, { status: 400 })
  }

  try {
    const token = createSubscriptionToken(email, getSubscriptionSecret())
    const confirmationUrl = new URL("/api/subscribe-confirm", getPublicSiteUrl())
    confirmationUrl.searchParams.set("token", token)

    const emailContent = createConfirmationEmail({
      confirmationUrl: confirmationUrl.toString(),
    })
    const config = getEmailConfig()
    const hour = Math.floor(Date.now() / 3_600_000)
    const emailHash = createHash("sha256").update(email).digest("hex").slice(0, 24)
    const { error } = await getResend().emails.send(
      {
        from: config.from,
        replyTo: config.replyTo,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      },
      { idempotencyKey: `blog-subscribe-${emailHash}-${hour}` },
    )

    if (error) throw new Error(error.message)

    return Response.json({ message: "确认邮件已发送，请检查收件箱。" })
  } catch (error) {
    console.error("Unable to send subscription confirmation", error)
    return Response.json(
      { message: "暂时无法发送确认邮件，请稍后再试。" },
      { status: 503 },
    )
  }
}
