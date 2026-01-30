'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconCheck, IconUser } from '@/components/ui/Icons'
import { PasswordInput } from '@/components/ui/PasswordInput'

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

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    empresa: '',
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
              nombre: data.nombre || '',
              telefono: data.telefono || '',
              empresa: data.empresa || '',
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
        <Header titulo="Editar Perfil" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-2xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Editar Perfil</h1>
            <p className="text-neutral-500 mt-1">Actualiza tu información personal</p>
          </div>
          <Link
            href="/cuenta"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="lg:bg-white lg:rounded-2xl lg:shadow-sm">
          {/* Avatar */}
          <div className="p-6 lg:p-8 border-b border-neutral-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <IconUser size={48} className="text-primary-600" />
            </div>
            <p className="text-sm text-neutral-500">{profile?.email}</p>
          </div>

          <div className="p-4 lg:p-8 space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Ej: 666 123 456"
              />
            </div>

            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-neutral-700 mb-2">
                Empresa
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Nombre de tu empresa"
              />
            </div>

            {/* Email (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-400 mt-1">El email no puede modificarse</p>
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

        {/* Sección cambiar contraseña */}
        <ChangePasswordSection />
      </div>
    </div>
  )
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña')
      }

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
      <div className="p-4 lg:px-8 lg:pt-8 border-b border-neutral-100 lg:border-none">
        <h2 className="text-lg font-semibold text-neutral-900">Cambiar contraseña</h2>
        <p className="text-sm text-neutral-500 mt-1">Actualiza tu contraseña de acceso</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 lg:px-8 lg:pb-8 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Contraseña actualizada correctamente
          </div>
        )}

        <PasswordInput
          id="currentPassword"
          label="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <PasswordInput
          id="newPassword"
          label="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Actualizando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
