'use client'

import {useEffect, useRef} from 'react'
import {gsap} from 'gsap'
import {SplitText} from 'gsap/SplitText'
import Image from 'next/image'
import Link from 'next/link'

gsap.registerPlugin(SplitText)

interface DisciplineItem {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  coverImage: {
    url: string;
    alt?: string;
  };
}

interface SimplifiedHomePageProps {
  disciplines: DisciplineItem[]
}

export default function SimplifiedHomePage({ disciplines }: SimplifiedHomePageProps) {
  const textContainerRef = useRef<HTMLDivElement>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textContainerRef.current) return

    const elements = textContainerRef.current.querySelectorAll('.animate-text')
    const splits: SplitText[] = []

    // Create timeline for sequential animation
    const tl = gsap.timeline()

    // Collect all lines from all elements
    elements.forEach((element) => {
      // Set parent opacity to 1 immediately to allow GSAP to control child opacity
      gsap.set(element, { opacity: 1 })

      // Split each element into lines
      const split = new SplitText(element, { type: 'lines', linesClass: 'split-line' })
      splits.push(split)

      // Set initial state for this element's lines
      gsap.set(split.lines, { y: 100, opacity: 0 })
    })

    // Get all lines from all splits
    const allLines = splits.flatMap(split => split.lines)

    // Animate all lines at once
    tl.to(allLines, {
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: 'power2.inOut',
    })

    // Animate list items after text
    if (listContainerRef.current) {
      const listItems = listContainerRef.current.querySelectorAll('.discipline-item')
      gsap.set(listItems, { y: 60, opacity: 0 })

      tl.to(listItems, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.5')
    }

    // Cleanup
    return () => {
      splits.forEach(split => split.revert())
    }
  }, [])

  return (
    <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Title Section */}
      <div className="w-full px-8 pt-24 pb-12 flex-shrink-0">
        <div ref={textContainerRef} className="max-w-4xl mx-auto">

          <div className="overflow-hidden">
            <h1 className="animate-text text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none font-barlow tracking-tight uppercase opacity-0">
              Anders denken én anders doen
            </h1>
          </div>
          <div className="overflow-hidden mt-4">
            <h2 className="animate-text text-[clamp(1rem,1.5vw,1.25rem)] opacity-0 font-barlow tracking-tighter">
              Snel, secuur en altijd een oplossing
            </h2>
          </div>
        </div>
      </div>

      {/* Vertical List Section */}
      <div ref={listContainerRef} className="w-full px-8 pb-16 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {disciplines.map((item) => (
            <Link
              key={item._id}
              href={`/disciplines/${item.slug.current}`}
              className="discipline-item w-full group"
            >
              <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '5/3' }}>
                <Image
                  src={item.coverImage.url}
                  alt={item.coverImage.alt || item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1536px) 90vw, 1400px"
                />
              </div>
              <div className="pt-6">
                <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
