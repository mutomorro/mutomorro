'use client'

import Link from 'next/link'
import ServiceFilter from '../../components/ServiceFilter'

export default function ProjectsGrid({ items }) {
  return (
    <ServiceFilter
      items={items}
      contentType="case studies"
      renderCard={(project) => (
        <Link
          href={`/projects/${project.slug.current}`}
          className="card-a"
          style={{ overflow: 'hidden' }}
        >
          {project.heroImageUrl && (
            <div style={{
              width: '100%',
              height: '200px',
              overflow: 'hidden',
            }}>
              <img
                src={`${project.heroImageUrl}?w=600&h=400&fit=crop`}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          <div className="card-a__corner" />
          <div className="card-a__body">
            {project.clientSector && (
              <span className="card-a__tag">{project.clientSector}</span>
            )}
            <div className="card-a__title">{project.title}</div>
            <p className="card-a__text">
              {project.shortSummary || project.challenge}
            </p>
          </div>
          <div className="card-a__footer">
            <div className="card-a__footer-bg" />
            <div className="card-a__action">
              Read case study <span className="arrow">→</span>
            </div>
          </div>
        </Link>
      )}
    />
  )
}
