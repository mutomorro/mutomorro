import DriftAudit from '@/components/DriftAudit'

export const metadata = {
  title: 'Organisational Drift Audit',
  description: 'A short self-assessment to help leadership teams understand where organisational drift might be showing up. 12 questions, 6 dimensions, takes 5 minutes.',
  openGraph: {
    url: 'https://mutomorro.com/diagnostics/drift-audit',
    title: 'Organisational Drift Audit',
    description: 'A short self-assessment to help leadership teams understand where organisational drift might be showing up.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organisational Drift Audit',
    description: 'A short self-assessment to help leadership teams understand where organisational drift might be showing up.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: './',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Organisational Drift Audit',
  description: 'A short self-assessment to help leadership teams understand where organisational drift might be showing up.',
  url: 'https://mutomorro.com/diagnostics/drift-audit',
  publisher: {
    '@type': 'Organization',
    name: 'Mutomorro',
    url: 'https://mutomorro.com',
  },
}

export default function DriftAuditPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DriftAudit />
    </main>
  )
}
