import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconQR } from '@/components/ui/Icons'

export default function CeramotecaPage() {
  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Ceramoteca" />
      </div>

      {/* Hero Desktop */}
      <div className="hidden lg:block relative h-[400px] bg-neutral-900 pt-20">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
          alt="Ceramoteca"
          fill
          className="object-cover opacity-50"
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-5xl font-bold mb-4">Ceramoteca Digital</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Escanea muestras físicas y accede instantáneamente a toda la información del producto
          </p>
        </div>
      </div>

      {/* Contenido mobile */}
      <div className="lg:hidden flex flex-col items-center justify-center px-4 py-16">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <IconQR size={48} className="text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2 text-center">
          Ceramoteca Digital
        </h2>
        <p className="text-neutral-600 text-center max-w-sm mb-8">
          Próximamente podrás escanear muestras físicas y acceder directamente a la información del producto.
        </p>
      </div>

      {/* Contenido desktop */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-16">
        {/* Funcionalidades */}
        <div className="px-4 lg:px-0">
          <h2 className="hidden lg:block text-2xl font-bold text-neutral-900 mb-8 text-center">
            Funcionalidades
          </h2>
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            <FeatureCard
              title="Escaneo de muestras"
              description="Escanea el código QR de cualquier muestra física para acceder a su ficha completa"
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              }
            />
            <FeatureCard
              title="Información instantánea"
              description="Accede al stock en tiempo real, precio actualizado y todas las características técnicas"
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              }
            />
            <FeatureCard
              title="Añadir a pedido"
              description="Añade productos directamente a tu cesta desde el escáner con un solo toque"
              icon={
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Demo section desktop */}
        <div className="hidden lg:block mt-16 bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconQR size={64} className="text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            Próximamente disponible
          </h3>
          <p className="text-neutral-600 max-w-lg mx-auto mb-8">
            Estamos trabajando para traerte la mejor experiencia de escaneo de muestras.
            Pronto podrás usar la cámara de tu dispositivo para acceder a toda la información al instante.
          </p>
          <button className="px-8 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors">
            Notificarme cuando esté disponible
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="p-4 lg:p-8 bg-neutral-50 lg:bg-white rounded-lg lg:rounded-2xl lg:shadow-sm lg:text-center">
      {icon && (
        <div className="hidden lg:flex w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mx-auto mb-4 text-primary-600">
          {icon}
        </div>
      )}
      <h3 className="font-medium lg:font-semibold text-neutral-900 mb-1 lg:mb-2 lg:text-lg">{title}</h3>
      <p className="text-sm lg:text-base text-neutral-600">{description}</p>
    </div>
  )
}
