'use client'

import dynamic from 'next/dynamic'
import { useIsDesktop } from '../hooks/useIsDesktop'

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

export default function HeroCanvasDesktop() {
  const isDesktop = useIsDesktop()
  if (!isDesktop) return null
  return <HeroCanvas />
}
