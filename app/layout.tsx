import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_NAME = 'Study Map'
const APP_DESCRIPTION =
  'Transforma tus apuntes en un árbol de conocimiento interactivo. Aprende activamente con tests, visualiza tu progreso y descubre exactamente qué dominas.'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://estudio-mapa.vercel.app'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Domina lo que estudias con mapas interactivos`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  generator: 'v0.app',
  manifest: '/manifest.json',
  applicationName: APP_NAME,
  category: 'education',
  keywords: [
    'mapa de estudio',
    'mapa conceptual',
    'aprendizaje activo',
    'organizador de estudio',
    'árbol de conocimiento',
    'tests de estudio',
    'apuntes online',
    'progreso académico',
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
    title: `${APP_NAME} — Domina lo que estudias con mapas interactivos`,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: 'es_ES',
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
    title: `${APP_NAME} — Domina lo que estudias con mapas interactivos`,
    description: APP_DESCRIPTION,
    images: ['/opengraph-image.png'],
    creator: '@estudiomapa',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
