'use client'
import dynamic from 'next/dynamic'

const heroMap = {
  'culture-change-consultancy': dynamic(() => import('./CultureChangeHero')),
  'post-merger-integration-consultancy': dynamic(() => import('./PostMergerHero')),
  'change-management-consultancy': dynamic(() => import('./ChangeManagementHero')),
  'employee-experience-consultancy': dynamic(() => import('./EmployeeExperienceHero')),
  'organisational-restructuring-consultancy': dynamic(() => import('./OrgRestructuringHero')),
  'operational-effectiveness-consultancy': dynamic(() => import('./OperationalEffectivenessHero')),
  'organisational-design-consultancy': dynamic(() => import('./OrgDesignHero')),
  'organisational-purpose-consultancy': dynamic(() => import('./OrgPurposeHero')),
  'strategic-alignment-consultancy': dynamic(() => import('./StrategicAlignmentHero')),
  'organisational-capacity-building': dynamic(() => import('./OrgCapacityBuildingHero')),
  'organisational-development-consultancy': dynamic(() => import('./OrgDevelopmentHero')),
  'customer-experience-consultancy': dynamic(() => import('./CustomerExperienceHero')),
  'service-design-consultancy': dynamic(() => import('./ServiceDesignHero')),
  'scaling-operations-consultancy': dynamic(() => import('./ScalingOperationsHero')),
}

export default function ServiceHero({ slug }) {
  const HeroComponent = heroMap[slug]
  if (!HeroComponent) return null
  return <HeroComponent />
}
