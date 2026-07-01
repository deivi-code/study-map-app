import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://estudio-mapa.vercel.app"

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/dashboard" },
      { userAgent: "*", disallow: "/app" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
