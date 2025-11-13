import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Inter, Barlow} from 'next/font/google'
import {draftMode} from 'next/headers'
import {VisualEditing, toPlainText} from 'next-sanity'
import {Toaster} from 'sonner'

import DraftModeToast from '@/app/components/DraftModeToast'
import ViewportHeightFix from '@/app/components/ViewportHeightFix'

import Marquee from '@/app/components/Marquee'
import MobileMenu from '@/app/components/MobileMenu'
import ContactPanel from '@/app/components/ContactPanel'
import * as demo from '@/sanity/lib/demo'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {handleError} from './client-utils'
import Link from 'next/link'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title
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
      default: "Otherwise",
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} bg-white`}>
      <body className="overflow-hidden">
        <ViewportHeightFix />
        {/* <div className="cursor"></div> */}
        <section className="flex flex-col overflow-hidden" style={{height: 'var(--app-height)'}}>
          {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
          <Toaster />
          {isDraftMode && (
            <>
              <DraftModeToast />
              {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
              <VisualEditing />
            </>
          )}
          {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
          <SanityLive onError={handleError} />
          <Marquee text={settings?.marqueeText as string} />
          <div className="flex-shrink-0 px-8 py-8">
            <nav className="flex items-center justify-between text-sm font-medium">
              <Link href="/" className="flex items-center">
                <img
                  src="/images/logo-color.png"
                  alt="Logo"
                  className="h-20 w-auto mr-6 -ml-6 md:ml-0"
                />
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-10 text-lg">
                <ContactPanel />
              </div>
              {/* Mobile Navigation */}
              <MobileMenu />
            </nav>
          </div>
          <main className="flex-1 min-h-0">{children}</main>
        </section>
        <SpeedInsights />
      </body>
    </html>
  )
}
