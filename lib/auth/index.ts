import { betterAuth } from "better-auth"
import { anonymous, magicLink } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { Resend } from "resend"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        try {
          const { migrateAnonymousData } = await import("@/lib/auth/migration")
          await migrateAnonymousData(anonymousUser.user.id, newUser.user.id)
        } catch (error) {
          console.error("Failed to migrate anonymous data:", error)
        }
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@studymap.naria.es",
          to: email,
          subject: "Inicia sesión en Study Map",
          html: `
            <h1>Inicia sesión en Study Map</h1>
            <p>Haz clic en el siguiente enlace para iniciar sesión:</p>
            <a href="${url}">${url}</a>
            <p>Este enlace expirará en 5 minutos.</p>
          `,
        })
      },
    }),
  ],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})

export type Session = typeof auth.$Infer.Session
