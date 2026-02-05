'use client'

import { useState, useEffect } from 'react'

interface Usuario {
  id: string
  email: string
  nombre: string
  role: string
  telefono: string | null
  empresa: string | null
  nif_cif: string | null
  activo: boolean
  createdAt: string
  _count: {
    pedidos: number
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    CLIENTE: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-neutral-100 text-neutral-700'}`}>
      {role}
    </span>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)

  const fetchUsuarios = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)

      const response = await fetch(`/api/usuarios?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios || [])
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [search, roleFilter])

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !usuario.activo }),
      })

      if (response.ok) {
        fetchUsuarios()
      }
    } catch (error) {
      console.error('Error updating usuario:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Usuarios</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null)
            setShowModal(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="CLIENTE">Clientes</option>
          <option value="ADMIN">Administradores</option>
        </select>
      </div>

      {/* Vista móvil - Tarjetas */}
      <div className="lg:hidden space-y-3">
        {usuarios.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-neutral-500">
            No se encontraron usuarios
          </div>
        ) : (
          usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className={`bg-white rounded-xl p-4 shadow-sm ${!usuario.activo ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 truncate">{usuario.nombre}</div>
                  <div className="text-sm text-neutral-500 truncate">{usuario.email}</div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <RoleBadge role={usuario.role} />
                </div>
              </div>

              {usuario.empresa && (
                <p className="text-sm text-neutral-600 mb-2">
                  <span className="text-neutral-400">Empresa:</span> {usuario.empresa}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-3">
                <span>{usuario._count.pedidos} pedidos</span>
                <span>•</span>
                <span>Alta: {formatDate(usuario.createdAt)}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setSelectedUser(usuario)
                    setShowModal(true)
                  }}
                  className="flex-1 py-2 px-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(usuario)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    usuario.activo
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {usuario.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Pedidos
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Fecha alta
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className={`hover:bg-neutral-50 ${!usuario.activo ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{usuario.nombre}</div>
                    <div className="text-sm text-neutral-500">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {usuario.empresa || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={usuario.role} />
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {usuario._count.pedidos}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {formatDate(usuario.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(usuario)
                          setShowModal(true)
                        }}
                        className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                        title="Editar"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(usuario)}
                        className={`p-2 transition-colors ${usuario.activo ? 'text-neutral-400 hover:text-red-600' : 'text-neutral-400 hover:text-green-600'}`}
                        title={usuario.activo ? 'Desactivar' : 'Activar'}
                      >
                        {usuario.activo ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de crear/editar usuario */}
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false)
            setSelectedUser(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedUser(null)
            fetchUsuarios()
          }}
        />
      )}
    </div>
  )
}

function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: Usuario | null
  onClose: () => void
  onSave: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    nombre: user?.nombre || '',
    password: '',
    role: user?.role || 'CLIENTE',
    telefono: user?.telefono || '',
    empresa: user?.empresa || '',
    nif_cif: user?.nif_cif || '',
    sendWelcomeEmail: !user,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = user ? `/api/usuarios/${user.id}` : '/api/usuarios'
      const method = user ? 'PUT' : 'POST'

      const body: any = { ...formData }
      if (user && !formData.password) {
        delete body.password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar usuario')
      }

      onSave()
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">
            {user ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={!!user}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {user ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={!user}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="CLIENTE">Cliente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                NIF/CIF
              </label>
              <input
                type="text"
                value={formData.nif_cif}
                onChange={(e) => setFormData({ ...formData, nif_cif: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {!user && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Enviar email de bienvenida</span>
            </label>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : user ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
