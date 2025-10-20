'use client'

import InfiniteSlider from '@/components/infite-slider'
import {useEffect, useRef, useState} from 'react'
import {gsap} from 'gsap'
import {SplitText} from 'gsap/SplitText'

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

interface HomePageProps {
  disciplines: DisciplineItem[]
}

export default function HomePage({ disciplines }: HomePageProps) {
  const textContainerRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(400)

  useEffect(() => {
    // Initialize custom cursor
    gsap.set('.cursor', { xPercent: -50, yPercent: -50 })

    const xTo = gsap.quickTo('.cursor', 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo('.cursor', 'y', { duration: 0.6, ease: 'power3' })

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    // Set initial width
    setSliderWidth(window.innerWidth * 0.25)

    // Update width on resize
    const handleResize = () => {
      setSliderWidth(window.innerWidth * 0.25)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!textContainerRef.current) return

    const elements = textContainerRef.current.querySelectorAll('.animate-text')
    const underline = textContainerRef.current.querySelector('.animate-underline')
    const splits: SplitText[] = []

    // Create timeline for sequential animation
    const tl = gsap.timeline()

    // Collect all lines from all elements
    elements.forEach((element) => {
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

    // Animate underline width
    if (underline) {
      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' })
      tl.to(underline, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power3.inOut',
      }, '-=0.2')
    }

    // Trigger slider animation after text completes
    tl.call(() => {
      const sliderAnimEvent = new CustomEvent('startSliderAnimation')
      window.dispatchEvent(sliderAnimEvent)
    })

    // Cleanup
    return () => {
      splits.forEach(split => split.revert())
    }
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pt-8">
        <InfiniteSlider items={disciplines} itemWidth={sliderWidth} />
      </div>

      <div className="flex-1" />

      <div className="flex w-full px-8 pb-12 text-white gap-8 flex-shrink-0">
        <div className="w-1/2">
          <p className="text-[clamp(0.875rem,1.5vw,1.125rem)]"></p>
        </div>
        <div ref={textContainerRef} className="w-1/2 flex flex-col justify-center gap-4">
          <div className="overflow-hidden">
            <p className="animate-text text-[1vw] tracking-wider font-barlow tracking-tight -mb-1">Otherwise</p>
          </div>
          <div className="overflow-hidden">
            <h2 className="animate-text text-[4vw] font-bold leading-none font-barlow tracking-tight uppercase">Aanders denken én anders doen.</h2>
          </div>
          <div className="overflow-hidden">
            <h3 className="animate-text text-[1.5vw] opacity-80 font-barlow tracking-tighter">Snel, secuur en altijd een oplossing</h3>
          </div>
          <div className="flex items-center justify-between gap-6 w-full">
            <div className="overflow-hidden">
              <button className="animate-text py-3 text-[1vw] font-barlow tracking-tight relative inline-block pb-2">
                All ons werk
                <span className="animate-underline absolute bottom-0 left-0 right-0 h-[1px] bg-white"></span>
              </button>
            </div>
            <div className="overflow-hidden">
              <span className="animate-text text-[.7vw]">(scroll)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
