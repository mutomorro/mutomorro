import { getAllDimensions, getDimensionArticles } from '../../sanity/client'
import EmergentSidebar from '../../components/emergent/EmergentSidebar'
import './emergent-wiki.css'

export default async function EmergentLayout({ children }) {
  const dimensions = await getAllDimensions()

  // Fetch articles for each dimension (for sidebar navigation)
  const articlesByDimension = {}
  await Promise.all(
    dimensions.map(async (dimension) => {
      const articles = await getDimensionArticles(dimension.slug.current)
      articlesByDimension[dimension.slug.current] = articles
    })
  )

  return (
    <div className="ew-wrapper">
      <EmergentSidebar
        dimensions={dimensions}
        articles={articlesByDimension}
      />
      <div className="ew-main">
        {children}
      </div>
    </div>
  )
}
