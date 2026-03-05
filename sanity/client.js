import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export async function getAllProjects() {
  return await client.fetch(`*[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    clientSector,
    challenge
  }`)
}

export async function getProject(slug) {
  return await client.fetch(`*[_type == "project" && slug.current == $slug][0]`, { slug })
}