'use client'

export default function Marquee({text}: {text: string}) {
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
    <div className="relative overflow-hidden bg-primary text-white py-2">
      <div className="flex items-center animate-marquee whitespace-nowrap">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
