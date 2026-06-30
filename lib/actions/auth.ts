"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"

export async function signInWithGoogleAction() {
  const res = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: "/" },
    headers: await headers(),
  })
  if (!res.url) throw new Error("No se pudo obtener la URL de redirección")
  redirect(res.url)
}

export async function signOutAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return

  await auth.api.signOut({ headers: await headers() })

  // Recreate anonymous session
  await authClient.signIn.anonymous()
  redirect("/")
}
