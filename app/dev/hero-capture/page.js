import { notFound } from 'next/navigation'
import HeroCaptureClient from './HeroCaptureClient'

// Dev-only tool for producing static hero/OG/card stills from the canvas heroes.
export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function Page({ searchParams }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const sp = (await searchParams) || {}
  const num = (v, d) => (v != null && v !== '' ? Number(v) : d)
  const config = {
    single: sp.single === '1' || sp.single === 'true',
    slug: sp.slug || 'culture-change-consultancy',
    seed: num(sp.seed, 2),
    boost: num(sp.boost, 1.8),
    labels: sp.labels === '1' || sp.labels === 'true',
    time: num(sp.time, 20000),
    spreadX: num(sp.spreadX, 1),
    spreadY: num(sp.spreadY, 1),
    labelScale: num(sp.labelScale, 1),
    w: num(sp.w, 1280),
    h: num(sp.h, 720),
  }
  return <HeroCaptureClient config={config} />
}
