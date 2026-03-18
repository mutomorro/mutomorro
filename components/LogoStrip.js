import { client } from '../sanity/client'
import Image from 'next/image'

async function getLogoStripAssets() {
  return client.fetch(`
    *[_type == "sanity.imageAsset" && "logo-strip" in opt.media.tags[]->name.current] {
      _id,
      url,
      originalFilename
    }
  `)
}

export default async function LogoStrip() {
  const logos = await getLogoStripAssets()

  if (!logos || logos.length === 0) return null

  return (
    <section className="logo-strip" aria-label="Trusted organisations">
      <div className="logo-strip__track">
        {/* Render logos twice for seamless infinite scroll */}
        {[...logos, ...logos].map((logo, i) => (
          <div key={`${logo._id}-${i}`} className="logo-strip__item">
            <Image
              src={logo.url}
              alt={logo.originalFilename?.replace(/\.\w+$/, '').replace(/[-_]/g, ' ') || 'Client logo'}
              width={132}
              height={104}
              style={{ width: 'auto', height: 'auto', maxWidth: '132px', maxHeight: '104px', objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
