'use client'

import InfiniteSlider from '@/components/infite-slider'
import {useEffect, useRef, useState} from 'react'
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

interface HomePageProps {
  disciplines: DisciplineItem[]
}

export default function HomePage({ disciplines }: HomePageProps) {
  const textContainerRef = useRef<HTMLDivElement>(null)
  const homePageRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(550)
  const [isCompactView, setIsCompactView] = useState(false)

  useEffect(() => {
    if (!homePageRef.current) return

    // Only prevent overscroll/bounce effect on mobile to avoid pull-to-refresh
    const homePageElement = homePageRef.current
    homePageElement.style.overscrollBehavior = 'none'

    return () => {
      homePageElement.style.overscrollBehavior = ''
    }
  }, [])

  // useEffect(() => {
  //   // Initialize custom cursor
  //   gsap.set('.cursor', { xPercent: -50, yPercent: -50 })

  //   const xTo = gsap.quickTo('.cursor', 'x', { duration: 0.6, ease: 'power3' })
  //   const yTo = gsap.quickTo('.cursor', 'y', { duration: 0.6, ease: 'power3' })

  //   const handleMouseMove = (e: MouseEvent) => {
  //     xTo(e.clientX)
  //     yTo(e.clientY)
  //   }

  //   window.addEventListener('mousemove', handleMouseMove)
  //   return () => window.removeEventListener('mousemove', handleMouseMove)
  // }, [])

  useEffect(() => {
    // Check if view should be compact based on viewport height and zoom
    const checkCompactView = () => {
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Detect zoom by comparing visual viewport to layout viewport
      const zoomLevel = window.visualViewport
        ? window.visualViewport.width / window.innerWidth
        : 1

      // Set compact view if:
      // - viewport height is small (< 600px)
      // - or zoomed in significantly (zoom < 0.85)
      // - or very narrow viewport with small height
      // - or medium laptop viewport (1400-1600px wide, < 1000px high) like MacBook scaled displays
      const shouldBeCompact =
        viewportHeight < 600 ||
        zoomLevel < 0.85 ||
        (viewportHeight < 700 && viewportWidth < 768) ||
        (viewportHeight <= 1000 && viewportWidth >= 1400 && viewportWidth <= 1600)

      setIsCompactView(shouldBeCompact)
      setSliderWidth(viewportWidth * 0.25)
    }

    // Set initial state
    checkCompactView()

    // Update on resize and zoom
    const handleResize = () => {
      checkCompactView()
    }

    const handleVisualViewportResize = () => {
      checkCompactView()
    }

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleVisualViewportResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize)
    }
  }, [])

  useEffect(() => {
    if (!textContainerRef.current) return

    const elements = textContainerRef.current.querySelectorAll('.animate-text')
    const underline = textContainerRef.current.querySelector('.animate-underline')
    let splits: SplitText[] = []
    let resizeTimeout: NodeJS.Timeout

    const initSplits = () => {
      // Clean up existing splits
      splits.forEach(split => split.revert())
      splits = []

      // Create timeline for sequential animation
      const tl = gsap.timeline()

      // Collect all lines from all elements
      elements.forEach((element) => {
        // Set parent opacity to 1 immediately to allow GSAP to control child opacity
        gsap.set(element, { opacity: 1 })

        // Split each element into lines
        const split = new SplitText(element, { type: 'lines', linesClass: 'split-line' })
        splits.push(split)

        // Wrap lines in overflow containers
        split.lines.forEach((line) => {
          const wrapper = document.createElement('div')
          wrapper.style.overflow = 'hidden'
          line.parentNode?.insertBefore(wrapper, line)
          wrapper.appendChild(line)

          // Reset white-space to allow natural wrapping after animation
          gsap.set(line, { whiteSpace: 'normal' })
        })

        // Set initial state for this element's lines
        gsap.set(split.lines, { y: 100, opacity: 0 })
      })

      // Get all lines from all splits
      const allLines = splits.flatMap(split => split.lines)

      // Animate lines one by one with stagger
      tl.to(allLines, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08, // Delay between each line
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
    }

    // Initialize on mount
    initSplits()

    // Handle resize with debounce
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        initSplits()
      }, 300) // Debounce for 300ms
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
      splits.forEach(split => split.revert())
    }
  }, [])

  return (

    <div ref={homePageRef} className="h-full flex flex-col overflow-y-auto overflow-x-visible">

      <div className="flex-shrink-0 pt-8">
        <InfiniteSlider items={disciplines} />
      </div>

      <div className="hidden md:block md:flex-1" />

      <div className={`flex flex-col lg:flex-row w-full pb-12 mt-8 md:mt-0 gap-8 flex-shrink-0 transition-all duration-300 ${
        isCompactView ? 'px-4 md:px-6' : 'px-8'
      }`} ref={textContainerRef}>
      <div  className="w-full lg:w-1/3 flex flex-col gap-2">
          <div className="overflow-hidden">
            <p className={`animate-text font-barlow tracking-tight opacity-0 leading-none transition-all duration-300 ${
              isCompactView ? 'text-[clamp(0.875rem,1.5vw,1.1rem)]' : 'text-[clamp(1rem,2vw,1.3rem)]'
            }`}>Otherwise</p>
          </div>
          <div className="overflow-hidden">
            <h1 className={`animate-text tracking-tighter leading-none font-bold text-primary font-barlow tracking-tight uppercase opacity-0 break-words transition-all duration-300 ${
              isCompactView
                ? 'text-[clamp(2rem,9vw,3.5rem)] md:text-[clamp(1.75rem,2.5vw,3rem)]'
                : 'text-[clamp(2.5rem,11vw,5rem)] md:text-[clamp(2rem,3vw,4rem)]'
            }`}>Anders denken <br /> én anders doen.</h1>
          </div>
          
          {/* <div className="flex items-center justify-between gap-6 w-full">
            <div className="overflow-hidden">
              <button className="animate-text py-3 text-[1vw] font-barlow tracking-tight relative inline-block pb-2 opacity-0">
                Bekijk al ons werk
                <span className="animate-underline absolute -bottom-1 left-0 right-0 h-[1px] bg-black"></span>
              </button>
            </div>
            <div className="overflow-hidden">
              <span className="animate-text text-[.7vw] opacity-0">(scroll)</span>
            </div>
          </div> */}
        </div>

        <div className="hidden lg:flex-1"/>
        
        <div className={`w-full lg:w-1/3 block home-text text-pretty break-words transition-all duration-300 ${
          isCompactView ? 'text-[clamp(0.75rem,0.9vw,0.875rem)]' : 'text-[clamp(0.7rem,0.9vw,.875rem)]'
        }`}>
        <div className="overflow-hidden">
            <p className="animate-text opacity-0 tracking-tighter font-bold">Snel, secuur en altijd een oplossing</p>
          </div>
          <p className="opacity-0 animate-text pb-2">
          Otherwise is een no-nonsense creatieve studio waar strategie, design en realisatie samenkomen. Van concept tot uitvoering maken wij alles wat merken laat stralen, snel, secuur en met oog voor detail. We houden van korte lijnen, duidelijkheid en een goed resultaat waar iedereen blij van wordt. In plaats van snel scoren richten we ons op duurzame relaties en langdurige resultaten.
          </p>
          <p className="font-bold animate-text">Creatieve oplossingen en sterke communicatie</p>

          <p className="opacity-0 animate-text">
Bij Otherwise geloven we dat elk vraagstuk een creatieve oplossing heeft. Of je nu op zoek bent naar een opvallend verpakkingsontwerp, een effectieve direct mail campagne of een sterk communicatiemiddel dat echt opvalt. Wij zorgen dat jouw merk overal opvalt en indruk maakt. Van flyer tot insert en van brochure tot online banner, we vertalen elk idee moeiteloos naar print en digitaal. Zo blijft je merk herkenbaar, krachtig en zichtbaar op elk kanaal, van de brievenbus tot het beeldscherm.</p>

        </div>
        <div className="w-full lg:w-1/3 flex items-center justify-center">
        <Link href="/otherprice-days" className="max-w-44 md:max-w-72 h-auto">
          <Image src="/images/ballon-otherprice-days.webp" alt="Otherwise" width={500} height={500} className="object-cover" />
          </Link>
        </div>
       
        
      </div>
    </div>

  )
}
