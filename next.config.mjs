/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Category pages → services overview
      {
        source: '/services/purpose-direction',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/structure-operations',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/people-capability',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/service-experience',
        destination: '/services',
        permanent: true,
      },
      // Service pages - old /services/[category]/[slug] → new /services/[slug]
      {
        source: '/services/purpose-direction/:slug',
        destination: '/services/:slug',
        permanent: true,
      },
      {
        source: '/services/structure-operations/:slug',
        destination: '/services/:slug',
        permanent: true,
      },
      {
        source: '/services/people-capability/:slug',
        destination: '/services/:slug',
        permanent: true,
      },
      {
        source: '/services/service-experience/:slug',
        destination: '/services/:slug',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;