import { createHmac, timingSafeEqual } from "node:crypto"

type SubscriptionTokenPayload = {
  email: string
  exp: number
  purpose: "blog-subscription"
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url")
}

export function createSubscriptionToken(email: string, secret: string, now = Date.now()) {
  const hour = Math.floor(now / 3_600_000)
  const payload: SubscriptionTokenPayload = {
    email,
    exp: (hour + 24) * 3_600,
    purpose: "blog-subscription",
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")

  return `${encodedPayload}.${sign(encodedPayload, secret)}`
}

export function verifySubscriptionToken(token: string, secret: string, now = Date.now()) {
  const [encodedPayload, encodedSignature] = token.split(".")

  if (!encodedPayload || !encodedSignature) return null

  const expectedSignature = Buffer.from(sign(encodedPayload, secret))
  const receivedSignature = Buffer.from(encodedSignature)

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SubscriptionTokenPayload>

    if (
      payload.purpose !== "blog-subscription" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(now / 1_000)
    ) {
      return null
    }

    return payload.email
  } catch {
    return null
  }
}
