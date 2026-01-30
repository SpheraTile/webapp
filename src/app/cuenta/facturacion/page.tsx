'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconCheck } from '@/components/ui/Icons'

interface UserProfile {
  id: string
  email: string
  nombre: string
  telefono?: string
  empresa?: string
  nif_cif?: string
  direccion?: string
  ciudad?: string
  provincia?: string
  codigo_postal?: string
}

export default function FacturacionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    empresa: '',
    nif_cif: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigo_postal: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user) {
        try {
          const res = await fetch('/api/perfil')
          if (res.ok) {
            const data = await res.json()
            setProfile(data)
            setFormData({
              empresa: data.empresa || '',
              nif_cif: data.nif_cif || '',
              direccion: data.direccion || '',
              ciudad: data.ciudad || '',
              provincia: data.provincia || '',
              codigo_postal: data.codigo_postal || '',
            })
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updatedProfile = await res.json()
        setProfile(updatedProfile)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Datos de Facturación" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-2xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Datos de Facturación</h1>
            <p className="text-neutral-500 mt-1">Información para tus facturas</p>
          </div>
          <Link
            href="/cuenta"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="lg:bg-white lg:rounded-2xl lg:shadow-sm">
          <div className="p-4 lg:p-8 space-y-6">
            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre de empresa
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Ej: Construcciones García S.L."
              />
            </div>

            {/* NIF/CIF */}
            <div>
              <label htmlFor="nif_cif" className="block text-sm font-medium text-neutral-700 mb-2">
                NIF / CIF
              </label>
              <input
                type="text"
                id="nif_cif"
                name="nif_cif"
                value={formData.nif_cif}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Ej: B12345678"
              />
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-neutral-700 mb-2">
                Dirección fiscal
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Ej: Calle Principal 123"
              />
            </div>

            {/* Ciudad y CP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="codigo_postal" className="block text-sm font-medium text-neutral-700 mb-2">
                  Código postal
                </label>
                <input
                  type="text"
                  id="codigo_postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="12345"
                />
              </div>
              <div>
                <label htmlFor="ciudad" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="Ej: Valencia"
                />
              </div>
            </div>

            {/* Provincia */}
            <div>
              <label htmlFor="provincia" className="block text-sm font-medium text-neutral-700 mb-2">
                Provincia
              </label>
              <input
                type="text"
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Ej: Valencia"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="p-4 lg:px-8 lg:py-6 border-t border-neutral-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck size={20} />
                  Guardado
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
