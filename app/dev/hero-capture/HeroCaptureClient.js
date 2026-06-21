'use client'
import { useEffect } from 'react'
import CultureChangeHero from '../../../components/heroes/CultureChangeHero'
import PostMergerHero from '../../../components/heroes/PostMergerHero'
import ChangeManagementHero from '../../../components/heroes/ChangeManagementHero'
import EmployeeExperienceHero from '../../../components/heroes/EmployeeExperienceHero'
import OrgRestructuringHero from '../../../components/heroes/OrgRestructuringHero'
import OperationalEffectivenessHero from '../../../components/heroes/OperationalEffectivenessHero'
import OrgDesignHero from '../../../components/heroes/OrgDesignHero'
import OrgPurposeHero from '../../../components/heroes/OrgPurposeHero'
import StrategicAlignmentHero from '../../../components/heroes/StrategicAlignmentHero'
import OrgCapacityBuildingHero from '../../../components/heroes/OrgCapacityBuildingHero'
import OrgDevelopmentHero from '../../../components/heroes/OrgDevelopmentHero'
import CustomerExperienceHero from '../../../components/heroes/CustomerExperienceHero'
import ServiceDesignHero from '../../../components/heroes/ServiceDesignHero'
import ScalingOperationsHero from '../../../components/heroes/ScalingOperationsHero'

// Keyed by real service slug (matches scripts/capture-heroes.mjs + the live heroMap).
const HERO_MAP = {
  'culture-change-consultancy': CultureChangeHero,
  'post-merger-integration-consultancy': PostMergerHero,
  'change-management-consultancy': ChangeManagementHero,
  'employee-experience-consultancy': EmployeeExperienceHero,
  'organisational-restructuring-consultancy': OrgRestructuringHero,
  'operational-effectiveness-consultancy': OperationalEffectivenessHero,
  'organisational-design-consultancy': OrgDesignHero,
  'organisational-purpose-consultancy': OrgPurposeHero,
  'strategic-alignment-consultancy': StrategicAlignmentHero,
  'organisational-capacity-building': OrgCapacityBuildingHero,
  'organisational-development-consultancy': OrgDevelopmentHero,
  'customer-experience-consultancy': CustomerExperienceHero,
  'service-design-consultancy': ServiceDesignHero,
  'scaling-operations-consultancy': ScalingOperationsHero,
}

function HeroBox({ slug, seed, boost, labels, time, width, dpr = 2 }) {
  const Hero = HERO_MAP[slug] || CultureChangeHero
  return (
    <div style={{ position: 'relative', width, aspectRatio: '16 / 9', background: '#221C2B', borderRadius: 10, overflow: 'hidden' }}>
      <Hero seed={seed} alphaBoost={boost} showLabels={labels} freezeTime={time} dprOverride={dpr} />
    </div>
  )
}

function Figure({ caption, ...box }) {
  return (
    <figure style={{ margin: 0 }}>
      <HeroBox {...box} />
      <figcaption style={{ font: '12px/1.4 ui-monospace, SFMono-Regular, monospace', color: '#888', marginTop: 8 }}>{caption}</figcaption>
    </figure>
  )
}

// Full-bleed single render — the URL Puppeteer screenshots.
function SingleCapture({ config }) {
  const Hero = HERO_MAP[config.slug] || CultureChangeHero
  useEffect(() => {
    let cancelled = false
    const markReady = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => { if (!cancelled) window.__heroCaptureReady = true }, 150)
    }))
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markReady)
    else markReady()
    return () => { cancelled = true }
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#221C2B', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div data-hero-capture style={{ position: 'relative', width: config.w, height: config.h, flexShrink: 0, background: '#221C2B', overflow: 'hidden' }}>
        <Hero seed={config.seed} alphaBoost={config.boost} showLabels={config.labels} freezeTime={config.time} dprOverride={2} spreadX={config.spreadX} spreadY={config.spreadY} labelScale={config.labelScale} />
      </div>
    </div>
  )
}

const wrap = { display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 40 }
const h2 = { font: '600 18px/1.2 system-ui, sans-serif', margin: '0 0 4px' }
const sub = { font: '14px/1.5 system-ui, sans-serif', color: '#555', margin: '0 0 16px', maxWidth: 720 }

export default function HeroCaptureClient({ config }) {
  if (config.single) return <SingleCapture config={config} />

  const slug = 'culture-change-consultancy'
  const T = 20000 // Culture Change's own declared settle time
  const W = 440

  return (
    <div style={{ padding: '40px 48px 80px', maxWidth: 1500, margin: '0 auto' }}>
      <h1 style={{ font: '700 24px/1.2 system-ui, sans-serif', margin: '0 0 6px' }}>Hero capture - Culture Change</h1>
      <p style={{ ...sub, marginBottom: 32 }}>
        Static 16:9 frames rendered from the live canvas hero. Compare clarity (alpha boost), labels on/off,
        and seed (shape variety). The Puppeteer script renders the chosen variants to PNG at 2560x1440.
      </p>

      <h2 style={h2}>A · Clarity sweep <span style={{ color: '#888', fontWeight: 400 }}>(seed 2, no labels)</span></h2>
      <p style={sub}>How far to turn up the deliberately-faint alphas so it reads as a still rather than ambient background.</p>
      <div style={wrap}>
        <Figure caption="boost 1.0 (as-is)" slug={slug} seed={2} boost={1.0} labels={false} time={T} width={W} />
        <Figure caption="boost 1.8" slug={slug} seed={2} boost={1.8} labels={false} time={T} width={W} />
        <Figure caption="boost 2.6" slug={slug} seed={2} boost={2.6} labels={false} time={T} width={W} />
      </div>

      <h2 style={h2}>B · Labels on vs off <span style={{ color: '#888', fontWeight: 400 }}>(seed 2, boost 1.8)</span></h2>
      <p style={sub}>The orbiting phrases are legible at hero size but turn to noise at OG/card size. Pure shape vs shape+labels.</p>
      <div style={wrap}>
        <Figure caption="labels ON" slug={slug} seed={2} boost={1.8} labels={true} time={T} width={W} />
        <Figure caption="labels OFF" slug={slug} seed={2} boost={1.8} labels={false} time={T} width={W} />
      </div>

      <h2 style={h2}>C · Shape variety by seed <span style={{ color: '#888', fontWeight: 400 }}>(boost 1.8, no labels)</span></h2>
      <p style={sub}>Each seed is a different but on-brand composition - pick the one that reads as the strongest "hero shape".</p>
      <div style={wrap}>
        <Figure caption="seed 1" slug={slug} seed={1} boost={1.8} labels={false} time={T} width={W} />
        <Figure caption="seed 3" slug={slug} seed={3} boost={1.8} labels={false} time={T} width={W} />
        <Figure caption="seed 7" slug={slug} seed={7} boost={1.8} labels={false} time={T} width={W} />
      </div>
    </div>
  )
}
