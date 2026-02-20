import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook for triggering animations when element scrolls into view
 * Uses IntersectionObserver for optimal performance
 */
export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.3,
    rootMargin = '0px',
    triggerOnce = true,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true)
          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    ref,
    isVisible: triggerOnce ? hasBeenVisible : isVisible,
  }
}

/**
 * Hook for staggered animations on children
 * Returns array of delays for staggered effect
 */
export const useStaggerAnimation = (count: number, delayMs = 100) => {
  return Array.from({ length: count }, (_, i) => i * delayMs)
}
