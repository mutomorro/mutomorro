import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import project from './sanity/schemas/project'
import tool from './sanity/schemas/tool'
import dimension from './sanity/schemas/dimension'
import dimensionArticle from './sanity/schemas/dimensionArticle'
import article from './sanity/schemas/article'
import course from './sanity/schemas/course'
import service from './sanity/schemas/service'
import frameworkOverview from './sanity/schemas/frameworkOverview'

export default defineConfig({
  name: 'mutomorro',
  title: 'Mutomorro',
  basePath: '/studio',
  projectId: 'c6pg4t4h',
  dataset: 'production',
  plugins: [structureTool(), media()],
  schema: {
    types: [project, tool, dimension, dimensionArticle, article, course, service, frameworkOverview],
  },
})