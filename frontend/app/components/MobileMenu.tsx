'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import {SplitText} from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLAnchorElement[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const splitsRef = useRef<SplitText[]>([])
  const textTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textAnimsRef = useRef<gsap.core.Tween[]>([])

  useEffect(() => {
    // Create GSAP timeline for menu animation
    const tl = gsap.timeline({paused: true})

    // Animate menu panel sliding in
    tl.to(menuRef.current, {
      x: 0,
      duration: 0.5,
      ease: 'power3.inOut',
    })

    // Animate overlay fading in
    tl.to(
      overlayRef.current,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut',
      },
      0,
    )

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (timelineRef.current) {
      if (isOpen) {
        // Play the main timeline
        timelineRef.current.play()

        // Animate text with SplitText after menu slides in
        textTimeoutRef.current = setTimeout(() => {
          const splits: SplitText[] = []

          menuItemsRef.current.forEach((element) => {
            if (element) {
              // Set parent opacity to 1 immediately
              gsap.set(element, { opacity: 1 })

              // Split text into lines
              const split = new SplitText(element, { type: 'lines', linesClass: 'split-line' })
              splits.push(split)

              // Set initial state for lines
              gsap.set(split.lines, { y: 100, opacity: 0 })

              // Animate lines and store the tween
              const tween = gsap.to(split.lines, {
                y: 0,
                opacity: 1,
                duration: 1.5,
                ease: 'power2.inOut',
              })
              textAnimsRef.current.push(tween)
            }
          })

          splitsRef.current = splits
        }, 300)

        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden'
      } else {
        // Clear any pending timeout
        if (textTimeoutRef.current) {
          clearTimeout(textTimeoutRef.current)
          textTimeoutRef.current = null
        }

        // Kill all text animations immediately
        textAnimsRef.current.forEach(tween => tween.kill())
        textAnimsRef.current = []

        // Clean up splits and reset opacity
        splitsRef.current.forEach(split => split.revert())
        splitsRef.current = []

        // Reset link opacity to 0
        menuItemsRef.current.forEach((element) => {
          if (element) {
            gsap.set(element, { opacity: 0 })
          }
        })

        timelineRef.current.reverse()
        // Restore body scroll
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5"
        aria-label="Toggle menu"
      >
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? 'bg-white rotate-45 translate-y-2' : 'bg-black'
          }`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? 'bg-white opacity-0' : 'bg-black'
          }`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? 'bg-white -rotate-45 -translate-y-2' : 'bg-black'
          }`}
        />
      </button>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-30 md:hidden opacity-0 pointer-events-none"
        style={{opacity: 0, pointerEvents: isOpen ? 'auto' : 'none'}}
        onClick={closeMenu}
      />

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-screen w-4/5 max-w-sm bg-primary z-40 translate-x-full"
        style={{transform: 'translateX(100%)'}}
      >
        <nav className="flex flex-col items-start justify-center h-full px-12 gap-10">
          <div className="overflow-hidden">
            <Link
              href="/"
              onClick={closeMenu}
              ref={(el) => {
                if (el) menuItemsRef.current[0] = el
              }}
              className="text-white text-5xl font-bold uppercase tracking-tight hover:opacity-80 transition-opacity font-barlow opacity-0"
            >
              Home
            </Link>
          </div>
          <div className="overflow-hidden">
            <Link
              href="/disciplines"
              onClick={closeMenu}
              ref={(el) => {
                if (el) menuItemsRef.current[1] = el
              }}
              className="text-white text-5xl font-bold uppercase tracking-tight hover:opacity-80 transition-opacity font-barlow opacity-0"
            >
              Werk
            </Link>
          </div>
          <div className="overflow-hidden">
            <Link
              href="/contact"
              onClick={closeMenu}
              ref={(el) => {
                if (el) menuItemsRef.current[2] = el
              }}
              className="text-white text-5xl font-bold uppercase tracking-tight hover:opacity-80 transition-opacity font-barlow opacity-0"
            >
              Contact
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
