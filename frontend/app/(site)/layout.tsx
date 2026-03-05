import type {Metadata} from 'next'
import {toPlainText} from 'next-sanity'
import {Toaster} from 'sonner'
import Link from 'next/link'

import DraftModeToast from '@/app/components/DraftModeToast'
import ViewportHeightFix from '@/app/components/ViewportHeightFix'
import Marquee from '@/app/components/Marquee'
import MobileMenu from '@/app/components/MobileMenu'
import ContactPanel from '@/app/components/ContactPanel'
import * as demo from '@/sanity/lib/demo'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {draftMode} from 'next/headers'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    stega: false,
  })
  const description = settings?.description || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | Otherwise`,
      default: 'Otherwise',
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <section className="flex flex-col overflow-hidden" style={{height: 'var(--app-height)'}}>
      <Toaster />
      {isDraftMode && <DraftModeToast />}
      <ViewportHeightFix />
      <Marquee text={settings?.marqueeText as string} />
      <div className="flex-shrink-0 px-8 py-2 md:py-6">
        <nav className="flex items-center justify-between text-sm font-medium">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-color.png"
              alt="Logo"
              className="h-18 md:h-16 w-auto -ml-6 md:ml-0"
            />
          </Link>
          <div className="hidden md:flex gap-10 text-lg">
            <ContactPanel content={settings?.contactContent} />
          </div>
          <MobileMenu />
        </nav>
      </div>
      <main className="flex-1 min-h-0">{children}</main>
    </section>
  )
}
