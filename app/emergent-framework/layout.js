import { getAllDimensions, getDimensionArticles } from '../../sanity/client'
import EmergentSidebar from '../../components/emergent/EmergentSidebar'

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
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 70px)',
    }}>
      <EmergentSidebar
        dimensions={dimensions}
        articles={articlesByDimension}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
