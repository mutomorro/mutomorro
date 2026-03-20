'use client'

import { useEffect } from 'react'

export default function ScrollObserver() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    function observeElements() {
      const elements = document.querySelectorAll('.scroll-in:not(.visible), .scroll-scale:not(.visible), .scroll-fade:not(.visible), .scroll-screenshot:not(.visible), .scroll-screenshot-flat:not(.visible)')
      elements.forEach((el) => {
        if (prefersReducedMotion) {
          el.classList.add('visible')
        } else {
          observer.observe(el)
        }
      })
    }

    observeElements()

    // Re-observe when new elements appear (route changes in Next.js app router)
    const mutation = new MutationObserver(observeElements)
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  return null
}
