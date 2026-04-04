import { auth } from "@/auth"
import type { Session } from "next-auth"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

type AuthSession = Session

export async function requireAuth() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role !== "ADMIN") {
    redirect("/")
  }
  
  return session
}

export async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function getSession() {
  return await auth()
}

export async function requireAdminApi(): Promise<
  | { session: AuthSession }
  | { response: NextResponse }
> {
  const session = await auth()

  if (!session) {
    return { response: unauthorizedResponse() }
  }

  if (session.user.role !== "ADMIN") {
    return { response: forbiddenResponse() }
  }

  return { session }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
