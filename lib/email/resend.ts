import { Resend } from "resend"

import { getEmailConfig } from "./config"

let resendClient: Resend | null = null

export function getResend() {
  if (!resendClient) {
    resendClient = new Resend(getEmailConfig().apiKey)
  }

  return resendClient
}
