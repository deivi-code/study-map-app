import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { cookies } from 'next/headers'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_NAME = 'Study Map'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://estudio-mapa.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Interactive Knowledge Maps`,
    template: `%s — ${APP_NAME}`,
  },
  generator: 'v0.app',
  manifest: '/manifest.json',
  applicationName: APP_NAME,
  category: 'education',
  keywords: [
    'study map',
    'knowledge map',
    'concept map',
    'active learning',
    'interactive learning',
    'study tool',
    'knowledge tree',
    'academic progress',
    'mapa de estudio',
    'mapa de conocimiento',
    'aprendizaje interactivo',
    'árbol de conocimiento',
  ],
  authors: [{ name: 'Study Map' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: `${APP_NAME} — Interactive Knowledge Maps`,
    description: 'Turn your notes into an interactive knowledge tree. Learn actively with tests, visualize your progress, and discover exactly what you know.',
    url: APP_URL,
    siteName: APP_NAME,
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Interactive Knowledge Maps`,
    description: 'Turn your notes into an interactive knowledge tree. Learn actively with tests, visualize your progress, and discover exactly what you know.',
    images: ['/opengraph-image.png'],
    creator: '@studymap',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      en: `${APP_URL}/en`,
      es: `${APP_URL}/es`,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es'

  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
