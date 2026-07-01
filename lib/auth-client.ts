import { createAuthClient } from "better-auth/react"
import { anonymousClient, magicLinkClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [anonymousClient(), magicLinkClient()],
})
