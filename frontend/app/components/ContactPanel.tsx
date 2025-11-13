'use client'

import {useEffect, useRef, useState} from 'react'
import gsap from 'gsap'

export default function ContactPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    // Create GSAP timeline for panel animation
    const tl = gsap.timeline({paused: true})

    // Animate panel expanding from top right (small square size)
    tl.fromTo(
      panelRef.current,
      {
        width: 0,
        height: 0,
      },
      {
        width: 'auto',
        height: 'auto',
        duration: 0.6,
        ease: 'power3.inOut',
      },
    )

    // Fade in content after panel starts expanding
    tl.fromTo(
      contentRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut',
      },
      0.2,
    )

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (timelineRef.current) {
      if (isOpen) {
        timelineRef.current.play()
      } else {
        timelineRef.current.reverse()
      }
    }
  }, [isOpen])

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  // Handle click outside to close panel
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Contact Button */}
      <button
        ref={buttonRef}
        onClick={togglePanel}
        className="text-lg cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Toggle contact panel"
      >
        Contact
      </button>

      {/* Contact Panel - Small square that expands from top right */}
      <div
        ref={panelRef}
        className="fixed top-[4.5rem] right-8 bg-primary z-50 overflow-hidden rounded-sm font-light"
        style={{width: 0, height: 0}}
      >
        {/* Content */}
        <div
          ref={contentRef}
          className="p-8 opacity-0"
        >
          <div className="text-white text-sm space-y-1 whitespace-nowrap">
            <p>Algemeen</p>
            <p>
              <a href="tel:0205707875" className="text-white font-bold hover:opacity-80">
                020 570 78 75
              </a>
            </p>
            <p>Rogier | Operations manager</p>
            <p>
              <a href="tel:0651178778" className="text-white font-bold hover:opacity-80">
                06 51 17 87 78
              </a>
            </p>
            <p>
              <a href="mailto:projects@otherwise.amsterdam" className="text-white font-bold hover:opacity-80">
                projects@otherwise.amsterdam
              </a>
            </p>

            <div className="pt-4">
              <p className="font-semibold">Adres</p>
              <p>Meeuwenlaan 98-100</p>
              <p>1021 JL Amsterdam</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
