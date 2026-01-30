import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl text-neutral-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        Página no encontrada
      </h1>
      <p className="text-neutral-600 text-center mb-8">
        La página que buscas no existe o ha sido movida
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
