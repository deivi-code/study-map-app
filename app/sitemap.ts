import type { MetadataRoute } from "next"

const locales = ["en", "es"] as const
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://estudio-mapa.vercel.app"

const publicRoutes = ["", "/upload", "/login"] as const

type SitemapEntry = MetadataRoute.Sitemap[number]

function entry(path: string, priority: number): SitemapEntry {
  const alternates = locales.map((l) => ({
    href: `${baseUrl}/${l}${path}` as const,
    hreflang: l === "en" ? "en" : "es",
  }))

  return {
    url: `${baseUrl}/es${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "monthly" : "monthly",
    priority,
    alternates: {
      languages: Object.fromEntries(
        alternates.map((a) => [a.hreflang, a.href]),
      ),
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((r) =>
    entry(r, r === "" ? 1 : r === "/upload" ? 0.8 : 0.6),
  )
}
