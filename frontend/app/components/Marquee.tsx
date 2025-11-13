'use client'

import { usePathname } from 'next/navigation'

export default function Marquee({text}: {text: string}) {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const MarqueeContent = () => (
    <>
      {Array.from({length: 15}).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="mx-8 text-sm font-medium">{text}</span>
          <span className="text-sm">•</span>
        </span>
      ))}
    </>
  )

  return (
    <div className={`relative overflow-hidden py-2 ${isHomepage ? 'bg-primary text-white' : 'bg-gray-50 text-black'}`}>
      <div className="flex items-center animate-marquee whitespace-nowrap">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
