import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'
import { HeroSectionMobile, HeroSectionDesktop } from '@/components/home/HeroSection'

// Datos de ambientes/habitaciones con cerámica
const ambientes = [
  {
    id: 1,
    titulo: 'Baños de Diseño',
    descripcion: 'Porcelánico de alta gama para espacios de bienestar',
    imagen: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
    categoria: 'Mármol',
  },
  {
    id: 2,
    titulo: 'Cocinas Modernas',
    descripcion: 'Superficies resistentes y elegantes para el corazón del hogar',
    imagen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    categoria: 'Cemento',
  },
  {
    id: 3,
    titulo: 'Salones Elegantes',
    descripcion: 'Grandes formatos que transforman espacios',
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    categoria: 'Madera',
  },
  {
    id: 4,
    titulo: 'Exteriores',
    descripcion: 'Pavimentos antideslizantes para terrazas y jardines',
    imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    categoria: 'Piedra',
  },
]

// Categorías destacadas
const categorias = [
  {
    nombre: 'Porcelánico',
    imagen: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&q=80',
    descripcion: 'Máxima resistencia y durabilidad',
  },
  {
    nombre: 'Gres',
    imagen: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80',
    descripcion: 'Versatilidad y calidad',
  },
  {
    nombre: 'Azulejo',
    imagen: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&q=80',
    descripcion: 'Tradición y diseño',
  },
  {
    nombre: 'Mosaico',
    imagen: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400&q=80',
    descripcion: 'Detalles únicos',
  },
]

export default function HomePage() {
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
                Catálogo
              </Link>
              <Link
                href="/ceramoteca"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                Ceramoteca
              </Link>
              <Link
                href="/cuenta"
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                Mi Cuenta
              </Link>
              <Link
                href="/cesta"
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-full hover:bg-primary-700 transition-colors font-medium"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cesta
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section dinámico */}
        <HeroSectionDesktop />

        {/* Sección Ambientes */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Inspiración para cada Espacio
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Descubre cómo nuestras cerámicas transforman hogares y proyectos profesionales
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {ambientes.map((ambiente) => (
                <Link
                  key={ambiente.id}
                  href={`/productos?aspecto=${ambiente.categoria}`}
                  className="group relative h-[400px] rounded-2xl overflow-hidden"
                >
                  <Image
                    src={ambiente.imagen}
                    alt={ambiente.titulo}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block px-3 py-1 bg-primary-600 text-white text-sm rounded-full mb-3">
                      {ambiente.categoria}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {ambiente.titulo}
                    </h3>
                    <p className="text-white/80">{ambiente.descripcion}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Sección Categorías */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Nuestras Colecciones
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Materiales de primera calidad para todo tipo de proyectos
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {categorias.map((cat) => (
                <Link
                  key={cat.nombre}
                  href={`/productos?calidad=${cat.nombre}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={cat.imagen}
                      alt={cat.nombre}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {cat.nombre}
                    </h3>
                    <p className="text-neutral-600">{cat.descripcion}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Sección CTA */}
        <section className="py-24 bg-primary-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para empezar tu proyecto?
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              Accede a nuestro catálogo completo con precios exclusivos para profesionales
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-3 bg-white text-primary-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-primary-50 transition-all hover:scale-105"
            >
              Ver Catálogo Completo
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer Desktop */}
        <footer className="bg-neutral-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-4 gap-12">
              {/* Logo y descripción */}
              <div className="col-span-2">
                <div className="mb-6">
                  <Logo size="lg" href={undefined} textColor="light" />
                </div>
                <p className="text-neutral-400 max-w-md">
                  Líder en distribución de cerámica de alta calidad para profesionales.
                  Más de 20 años de experiencia en el sector.
                </p>
              </div>

              {/* Enlaces */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Catálogo</h4>
                <ul className="space-y-3 text-neutral-400">
                  <li>
                    <Link href="/productos?calidad=Porcelánico" className="hover:text-white transition-colors">
                      Porcelánico
                    </Link>
                  </li>
                  <li>
                    <Link href="/productos?calidad=Gres" className="hover:text-white transition-colors">
                      Gres
                    </Link>
                  </li>
                  <li>
                    <Link href="/productos?calidad=Azulejo" className="hover:text-white transition-colors">
                      Azulejo
                    </Link>
                  </li>
                  <li>
                    <Link href="/productos" className="hover:text-white transition-colors">
                      Ver todo
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Contacto</h4>
                <ul className="space-y-3 text-neutral-400">
                  <li>info@spheratile.com</li>
                  <li>+34 900 123 456</li>
                  <li>Lunes - Viernes: 8:00 - 18:00</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-500">
              <p>© 2024 SPHERA TILE. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
