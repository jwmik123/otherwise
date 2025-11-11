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
  const [sliderWidth, setSliderWidth] = useState(550)

  useEffect(() => {
    // Prevent all scrolling and pull-to-refresh on the homepage
    const preventScroll = (e: TouchEvent) => {
      // Allow touch events on the slider
      const target = e.target as HTMLElement
      if (target.closest('[data-slider]')) {
        return
      }
      e.preventDefault()
    }

    // Prevent touchmove events (iOS pull-to-refresh and overscroll)
    document.body.addEventListener('touchmove', preventScroll, { passive: false })

    // Prevent overscroll/bounce effect
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.removeEventListener('touchmove', preventScroll)
      document.body.style.overscrollBehavior = ''
      document.documentElement.style.overscrollBehavior = ''
    }
  }, [])

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

    // Cleanup
    return () => {
      splits.forEach(split => split.revert())
    }
  }, [])

  return (

    <div className="h-full flex flex-col overflow-hidden overflow-x-visible">

      <div className="flex-shrink-0 pt-8">
        <InfiniteSlider items={disciplines} />
      </div>

      <div className="flex-1" />

      <div className="flex flex-col lg:flex-row w-full px-8 pb-12 gap-8 flex-shrink-0" ref={textContainerRef}>
      <div  className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* <div className="overflow-hidden">
            <p className="animate-text text-[1.2vw] font-barlow tracking-tight -mb-1 opacity-0">Otherwise</p>
          </div> */}
          <div className="overflow-hidden">
            <h1 className="animate-text text-[clamp(2.5rem,5vw,5rem)] font-bold text-primary leading-none font-barlow tracking-tight uppercase opacity-0">Anders denken <br /> én anders doen.</h1>
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

        <div className="flex-1"/>
        
        <div className="w-full lg:w-1/2 hidden lg:block">
        <div className="overflow-hidden">
            <h3 className="animate-text opacity-0 tracking-tighter font-bold text-[clamp(0.875rem,1.7vw,1.125rem)]">Snel, secuur en altijd een oplossing</h3>
          </div>
          <p className="text-[clamp(0.575rem,1vw,1.1rem)] opacity-0 animate-text">
          Bij Otherwise geloven we dat elk probleem een creatieve oplossing heeft. Of je nu op zoek bent naar een opvallend verpakkingsontwerp, een effectieve direct mail campagne of een gestroomlijnde implementatie van een huisstijlhandboek, wij leveren snel en secuur. Met korte lijnen zorgen we ervoor dat er snel geschakeld kan worden, zonder concessies te doen aan de kwaliteit.
          </p>
        </div>
       
       
      </div>
    </div>

  )
}
