import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitch } from '@/components/ui/LanguageSwitch'
import { HeroSectionMobile, HeroSectionDesktop } from '@/components/home/HeroSection'

// Datos de ambientes/habitaciones con cerámica (keys for translation)
const ambientes = [
  {
    id: 1,
    titleKey: 'ambientBathroom',
    descKey: 'ambientBathroomDesc',
    imagen: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
    categoriaKey: 'categoryMarble',
    categoriaFilter: 'Mármol',
  },
  {
    id: 2,
    titleKey: 'ambientKitchen',
    descKey: 'ambientKitchenDesc',
    imagen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    categoriaKey: 'categoryCement',
    categoriaFilter: 'Cemento',
  },
  {
    id: 3,
    titleKey: 'ambientLiving',
    descKey: 'ambientLivingDesc',
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    categoriaKey: 'categoryWood',
    categoriaFilter: 'Madera',
  },
  {
    id: 4,
    titleKey: 'ambientOutdoor',
    descKey: 'ambientOutdoorDesc',
    imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    categoriaKey: 'categoryStone',
    categoriaFilter: 'Piedra',
  },
]

// Categorías destacadas (keys for translation)
const categorias = [
  {
    key: 'categoryPorcelain',
    descKey: 'categoryPorcelainDesc',
    imagen: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&q=80',
    filter: 'Porcelánico',
  },
  {
    key: 'categoryStoneware',
    descKey: 'categoryStonewareDesc',
    imagen: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80',
    filter: 'Gres',
  },
  {
    key: 'categoryTile',
    descKey: 'categoryTileDesc',
    imagen: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&q=80',
    filter: 'Azulejo',
  },
  {
    key: 'categoryMosaic',
    descKey: 'categoryMosaicDesc',
    imagen: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400&q=80',
    filter: 'Mosaico',
  },
]

export default async function HomePage() {
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')
  const tFooter = await getTranslations('footer')
  return (
    <>
      {/* ==================== VERSIÓN MÓVIL ==================== */}
      <div className="lg:hidden min-h-screen bg-black">
        <HeroSectionMobile />
      </div>

      {/* ==================== VERSIÓN ESCRITORIO ==================== */}
      <div className="hidden lg:block">
        {/* Navegación Desktop */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <Logo size="lg" />

            {/* Links de navegación */}
            <div className="flex items-center gap-8">
              <Link
                href="/productos"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {tNav('products')}
              </Link>
              <Link
                href="/ceramoteca"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {tNav('ceramoteca')}
              </Link>
              <Link
                href="/cuenta"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {tNav('account')}
              </Link>
              <LanguageSwitch variant="dark" />
              <Link
                href="/cesta"
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-full hover:bg-primary-700 transition-colors font-medium"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {tNav('cart')}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section dinámico */}
        <HeroSectionDesktop />

        {/* Footer Desktop */}
        <footer className="bg-neutral-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-12">
              {/* Logo y descripción */}
              <div className="col-span-2">
                <div className="mb-6">
                  <Logo size="lg" href={undefined} />
                </div>
                <p className="text-neutral-400 max-w-md">
                  {tFooter('description')}
                </p>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="font-semibold text-lg mb-4">{tFooter('contact')}</h4>
                <ul className="space-y-3 text-neutral-400">
                  <li>info@spheratile.es</li>
                  <li>sales@spheratile.es</li>
                  <li>+34 633 909 095</li>
                  <li>{tFooter('schedule')}</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-500">
              <p>© 2026 SPHERA TILE. {tFooter('rights')}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
