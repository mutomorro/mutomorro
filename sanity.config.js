import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import project from './sanity/schemas/project'

export default defineConfig({
  name: 'mutomorro',
  title: 'Mutomorro',
  basePath: '/studio',
  projectId: 'c6pg4t4h',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [project],
  },
})