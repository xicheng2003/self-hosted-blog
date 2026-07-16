"use client"

import { type FormEvent, useId, useState } from "react"

type FormStatus = "idle" | "submitting" | "success" | "error"

const subscribeEndpoint = process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT || "/api/subscribe"

export function SubscribeForm() {
  const emailId = useId()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<FormStatus>("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setMessage("")

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch(subscribeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: formData.get("website"),
        }),
      })
      const result = (await response.json().catch(() => ({}))) as { message?: string }

      if (!response.ok) throw new Error(result.message || "订阅请求失败。")

      setEmail("")
      setStatus("success")
      setMessage(result.message || "确认邮件已发送，请检查收件箱。")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "暂时无法订阅，请稍后再试。")
    }
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={emailId}>邮箱地址</label>
      <div className="subscribe-input-wrap">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3.75 5.75h16.5v12.5H3.75zM4.5 6.5l7.5 6 7.5-6" />
        </svg>
        <input
          id={emailId}
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="你的邮箱"
          autoComplete="email"
          inputMode="email"
          required
          disabled={status === "submitting"}
        />
      </div>
      <input
        className="subscribe-honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "发送中…" : "订阅"}
      </button>
      <p className={`subscribe-message${status === "error" ? " is-error" : ""}`} aria-live="polite">
        {message}
      </p>
    </form>
  )
}
