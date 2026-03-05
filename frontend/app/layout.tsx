import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import {Inter, Barlow} from 'next/font/google'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity'

import {SanityLive} from '@/sanity/lib/live'
import {handleError} from './client-utils'

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

  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} bg-white`}>
      <body className="overflow-hidden">
        {isDraftMode && <VisualEditing />}
        <SanityLive onError={handleError} />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
