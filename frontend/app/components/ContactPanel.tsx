'use client'

import {useEffect, useRef, useState} from 'react'
import gsap from 'gsap'
import {type BlockContent} from '@/sanity.types'
import CustomPortableText from './PortableText'

interface ContactPanelProps {
  content?: BlockContent
}

export default function ContactPanel({content}: ContactPanelProps) {
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
        className="text-lg cursor-pointer hover:opacity-80 transition-all duration-200 hover:text-primary"
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
          {content && content.length > 0 ? (
            <CustomPortableText
              value={content}
              className="text-white text-sm prose-p:my-1 prose-a:text-white prose-a:font-bold prose-headings:text-white prose-strong:text-white whitespace-nowrap"
            />
          ) : (
            <p className="text-white text-sm">No contact information available.</p>
          )}
        </div>
      </div>
    </>
  )
}
