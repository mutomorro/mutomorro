'use client'
import dynamic from 'next/dynamic'

const cardMap = {
  'post-merger-integration-consultancy': [
    dynamic(() => import('./PostMerger1')),
    dynamic(() => import('./PostMerger2')),
    dynamic(() => import('./PostMerger3')),
    dynamic(() => import('./PostMerger4')),
  ],
  'change-management-consultancy': [
    dynamic(() => import('./ChangeMgmt1')),
    dynamic(() => import('./ChangeMgmt2')),
    dynamic(() => import('./ChangeMgmt3')),
    dynamic(() => import('./ChangeMgmt4')),
  ],
  'employee-experience-consultancy': [
    dynamic(() => import('./EmployeeExp1')),
    dynamic(() => import('./EmployeeExp2')),
    dynamic(() => import('./EmployeeExp3')),
    dynamic(() => import('./EmployeeExp4')),
  ],
  'organisational-restructuring-consultancy': [
    dynamic(() => import('./Restructuring1')),
    dynamic(() => import('./Restructuring2')),
    dynamic(() => import('./Restructuring3')),
    dynamic(() => import('./Restructuring4')),
  ],
  'operational-effectiveness-consultancy': [
    dynamic(() => import('./OpEffectiveness1')),
    dynamic(() => import('./OpEffectiveness2')),
    dynamic(() => import('./OpEffectiveness3')),
    dynamic(() => import('./OpEffectiveness4')),
  ],
  'organisational-design-consultancy': [
    dynamic(() => import('./OrgDesign1')),
    dynamic(() => import('./OrgDesign2')),
    dynamic(() => import('./OrgDesign3')),
    dynamic(() => import('./OrgDesign4')),
  ],
  'organisational-purpose-consultancy': [
    dynamic(() => import('./OrgPurpose1')),
    dynamic(() => import('./OrgPurpose2')),
    dynamic(() => import('./OrgPurpose3')),
    dynamic(() => import('./OrgPurpose4')),
  ],
  'strategic-alignment-consultancy': [
    dynamic(() => import('./StrategicAlignment1')),
    dynamic(() => import('./StrategicAlignment2')),
    dynamic(() => import('./StrategicAlignment3')),
    dynamic(() => import('./StrategicAlignment4')),
  ],
  'organisational-capacity-building': [
    dynamic(() => import('./Capacity1')),
    dynamic(() => import('./Capacity2')),
    dynamic(() => import('./Capacity3')),
    dynamic(() => import('./Capacity4')),
  ],
  'organisational-development-consultancy': [
    dynamic(() => import('./OrgDev1')),
    dynamic(() => import('./OrgDev2')),
    dynamic(() => import('./OrgDev3')),
    dynamic(() => import('./OrgDev4')),
  ],
  'customer-experience-consultancy': [
    dynamic(() => import('./CustomerExp1')),
    dynamic(() => import('./CustomerExp2')),
    dynamic(() => import('./CustomerExp3')),
    dynamic(() => import('./CustomerExp4')),
  ],
  'service-design-consultancy': [
    dynamic(() => import('./ServiceDesign1')),
    dynamic(() => import('./ServiceDesign2')),
    dynamic(() => import('./ServiceDesign3')),
    dynamic(() => import('./ServiceDesign4')),
  ],
  'scaling-operations-consultancy': [
    dynamic(() => import('./Scaling1')),
    dynamic(() => import('./Scaling2')),
    dynamic(() => import('./Scaling3')),
    dynamic(() => import('./Scaling4')),
  ],
  'culture-change-consultancy': [
    dynamic(() => import('./CultureChange1')),
    dynamic(() => import('./CultureChange2')),
    dynamic(() => import('./CultureChange3')),
    dynamic(() => import('./CultureChange4')),
  ],
}

export default function RecognitionCard({ slug, index }) {
  const cards = cardMap[slug]
  if (!cards || !cards[index]) return null
  const CardComponent = cards[index]
  return <CardComponent />
}
