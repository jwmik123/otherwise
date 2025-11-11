'use client'

import {useEffect} from 'react'

export default function ViewportHeightFix() {
  useEffect(() => {
    // Function to set the viewport height CSS variable
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }

    // Set initial value
    setViewportHeight()

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return null
}
