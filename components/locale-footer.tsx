"use client"

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LocaleFooter() {
  const locale = useLocale()
  const t = useTranslations('locale')
  const pathname = usePathname()
  const other = locale === 'es' ? 'en' : 'es'

  const strippedPath = pathname.replace(/^\/(en|es)/, '') || '/'

  return (
    <footer className="border-t border-border py-3 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-max items-center gap-1.5">
        <Link
          href={`/${other}${strippedPath}`}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          {t('switchTo')}
        </Link>
      </div>
    </footer>
  )
}
