'use client'

import { useState, useEffect } from 'react'

const PAISES = [
  { codigo: 'ES', nombre: 'España' },
  { codigo: 'SE', nombre: 'Suecia' },
  { codigo: 'FR', nombre: 'Francia' },
  { codigo: 'DE', nombre: 'Alemania' },
  { codigo: 'IT', nombre: 'Italia' },
  { codigo: 'PT', nombre: 'Portugal' },
  { codigo: 'GB', nombre: 'Reino Unido' },
  { codigo: 'NL', nombre: 'Países Bajos' },
  { codigo: 'BE', nombre: 'Bélgica' },
  { codigo: 'AT', nombre: 'Austria' },
  { codigo: 'CH', nombre: 'Suiza' },
  { codigo: 'PL', nombre: 'Polonia' },
  { codigo: 'CZ', nombre: 'República Checa' },
  { codigo: 'DK', nombre: 'Dinamarca' },
  { codigo: 'FI', nombre: 'Finlandia' },
  { codigo: 'NO', nombre: 'Noruega' },
  { codigo: 'IE', nombre: 'Irlanda' },
  { codigo: 'GR', nombre: 'Grecia' },
  { codigo: 'RO', nombre: 'Rumanía' },
  { codigo: 'BG', nombre: 'Bulgaria' },
  { codigo: 'HR', nombre: 'Croacia' },
  { codigo: 'HU', nombre: 'Hungría' },
  { codigo: 'SK', nombre: 'Eslovaquia' },
  { codigo: 'SI', nombre: 'Eslovenia' },
  { codigo: 'LT', nombre: 'Lituania' },
  { codigo: 'LV', nombre: 'Letonia' },
  { codigo: 'EE', nombre: 'Estonia' },
  { codigo: 'LU', nombre: 'Luxemburgo' },
  { codigo: 'MT', nombre: 'Malta' },
  { codigo: 'CY', nombre: 'Chipre' },
  { codigo: 'US', nombre: 'Estados Unidos' },
  { codigo: 'MA', nombre: 'Marruecos' },
  { codigo: 'TR', nombre: 'Turquía' },
  { codigo: 'AE', nombre: 'Emiratos Árabes' },
  { codigo: 'SA', nombre: 'Arabia Saudí' },
  { codigo: 'MX', nombre: 'México' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'BR', nombre: 'Brasil' },
]

const MONEDAS = [
  { codigo: 'EUR', nombre: 'Euro (€)' },
  { codigo: 'USD', nombre: 'Dólar USA ($)' },
  { codigo: 'GBP', nombre: 'Libra esterlina (£)' },
  { codigo: 'SEK', nombre: 'Corona sueca (kr)' },
  { codigo: 'NOK', nombre: 'Corona noruega (kr)' },
  { codigo: 'DKK', nombre: 'Corona danesa (kr)' },
  { codigo: 'CHF', nombre: 'Franco suizo (CHF)' },
  { codigo: 'PLN', nombre: 'Zloty polaco (zł)' },
  { codigo: 'CZK', nombre: 'Corona checa (Kč)' },
  { codigo: 'HUF', nombre: 'Florín húngaro (Ft)' },
  { codigo: 'RON', nombre: 'Leu rumano (lei)' },
  { codigo: 'TRY', nombre: 'Lira turca (₺)' },
  { codigo: 'MAD', nombre: 'Dírham marroquí (MAD)' },
  { codigo: 'AED', nombre: 'Dírham EAU (AED)' },
  { codigo: 'SAR', nombre: 'Riyal saudí (SAR)' },
]

interface Usuario {
  id: string
  email: string
  nombre: string
  role: string
  telefono: string | null
  empresa: string | null
  nif_cif: string | null
  codigo_cliente: string | null
  pais: string | null
  activo: boolean
  createdAt: string
  _count: {
    pedidos: number
  }
}

interface UsuarioDetalle extends Usuario {
  tipo_identificacion: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  codigo_postal: string | null
  subcuenta: string | null
  moneda: string | null
  forma_cobro: string | null
  canal_cobro: string | null
  iban: string | null
  bic: string | null
  referencia_mandato: string | null
  idioma: string
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getNombrePais(codigo: string | null): string {
  if (!codigo) return '-'
  const pais = PAISES.find((p) => p.codigo === codigo)
  return pais ? pais.nombre : codigo
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
            placeholder="Buscar por nombre, email, empresa o código..."
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
                  <div className="flex items-center gap-2">
                    {usuario.codigo_cliente && (
                      <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                        {usuario.codigo_cliente}
                      </span>
                    )}
                    <div className="font-semibold text-neutral-900 truncate">{usuario.nombre}</div>
                  </div>
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
                {usuario.pais && (
                  <>
                    <span>{getNombrePais(usuario.pais)}</span>
                    <span>·</span>
                  </>
                )}
                <span>{usuario._count.pedidos} pedidos</span>
                <span>·</span>
                <span>Alta: {formatDate(usuario.createdAt)}</span>
                <span>·</span>
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
                Código
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                País
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
              <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-neutral-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className={`hover:bg-neutral-50 ${!usuario.activo ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    {usuario.codigo_cliente ? (
                      <span className="text-sm font-mono bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                        {usuario.codigo_cliente}
                      </span>
                    ) : (
                      <span className="text-neutral-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{usuario.nombre}</div>
                    <div className="text-sm text-neutral-500">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {usuario.empresa || '-'}
                  </td>
                  <td className="px-6 py-4 text-neutral-600 text-sm">
                    {getNombrePais(usuario.pais)}
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
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'cobros'>('general')
  const [formData, setFormData] = useState({
    // Acceso
    email: user?.email || '',
    password: '',
    role: user?.role || 'CLIENTE',
    sendWelcomeEmail: !user,
    // Datos generales
    codigo_cliente: user?.codigo_cliente || '',
    nombre: user?.nombre || '',
    empresa: user?.empresa || '',
    nif_cif: user?.nif_cif || '',
    tipo_identificacion: '',
    telefono: user?.telefono || '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigo_postal: '',
    pais: user?.pais || '',
    subcuenta: '',
    moneda: 'EUR',
    idioma: 'es',
    // Cobros
    forma_cobro: '',
    canal_cobro: '',
    iban: '',
    bic: '',
    referencia_mandato: '',
  })

  // Cargar datos completos al editar
  useEffect(() => {
    if (user) {
      setLoadingDetail(true)
      fetch(`/api/usuarios/${user.id}`)
        .then((res) => res.json())
        .then((data: UsuarioDetalle) => {
          setFormData((prev) => ({
            ...prev,
            codigo_cliente: data.codigo_cliente || '',
            nombre: data.nombre || '',
            empresa: data.empresa || '',
            nif_cif: data.nif_cif || '',
            tipo_identificacion: data.tipo_identificacion || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            ciudad: data.ciudad || '',
            provincia: data.provincia || '',
            codigo_postal: data.codigo_postal || '',
            pais: data.pais || '',
            subcuenta: data.subcuenta || '',
            moneda: data.moneda || 'EUR',
            forma_cobro: data.forma_cobro || '',
            canal_cobro: data.canal_cobro || '',
            iban: data.iban || '',
            bic: data.bic || '',
            referencia_mandato: data.referencia_mandato || '',
            idioma: data.idioma || 'es',
          }))
        })
        .catch(() => {})
        .finally(() => setLoadingDetail(false))
    }
  }, [user])

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
      // Limpiar campos vacíos para enviar null
      delete body.sendWelcomeEmail
      if (!user) {
        body.sendWelcomeEmail = formData.sendWelcomeEmail
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

  const inputClass = 'w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm'
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1'

  const tabs = [
    { id: 'general' as const, label: 'Datos Generales' },
    { id: 'cobros' as const, label: 'Cobros' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-neutral-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-neutral-900">
            {user ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          {user?.codigo_cliente && (
            <p className="text-sm text-neutral-500 mt-1">Código: {user.codigo_cliente}</p>
          )}
        </div>

        {/* Pestañas */}
        <div className="border-b border-neutral-200 flex-shrink-0">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : activeTab === 'general' ? (
              <div className="space-y-6">
                {/* Sección: Acceso */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Acceso</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        required
                        disabled={!!user}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {user ? 'Nueva contraseña' : 'Contraseña *'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={inputClass}
                        required={!user}
                        minLength={6}
                        placeholder={user ? 'Dejar vacío para mantener' : ''}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Rol</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={inputClass}
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Idioma</label>
                      <select
                        value={formData.idioma}
                        onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                        className={inputClass}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección: Identificación */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Identificación</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Código cliente</label>
                      <input
                        type="text"
                        value={formData.codigo_cliente}
                        onChange={(e) => setFormData({ ...formData, codigo_cliente: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: SC121"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nombre / Razón social *</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Empresa</label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Doc. identificación</label>
                      <input
                        type="text"
                        value={formData.nif_cif}
                        onChange={(e) => setFormData({ ...formData, nif_cif: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: SE556801-884701"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tipo de identificación</label>
                      <select
                        value={formData.tipo_identificacion}
                        onChange={(e) => setFormData({ ...formData, tipo_identificacion: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Sin especificar</option>
                        <option value="NIF">NIF</option>
                        <option value="CIF">CIF</option>
                        <option value="NIF_IVA">NIF-IVA (Intracomunitario)</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Dirección */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Dirección</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Domicilio</label>
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: Stensatravagen 05"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Código postal</label>
                      <input
                        type="text"
                        value={formData.codigo_postal}
                        onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: 12739"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Localidad</label>
                      <input
                        type="text"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: Skarholmen"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Provincia</label>
                      <input
                        type="text"
                        value={formData.provincia}
                        onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>País</label>
                      <select
                        value={formData.pais}
                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Seleccionar país</option>
                        {PAISES.map((p) => (
                          <option key={p.codigo} value={p.codigo}>
                            {p.nombre} ({p.codigo})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección: Contabilidad */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Contabilidad</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Subcuenta</label>
                      <input
                        type="text"
                        value={formData.subcuenta}
                        onChange={(e) => setFormData({ ...formData, subcuenta: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: 4300SC121"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Moneda</label>
                      <select
                        value={formData.moneda}
                        onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                        className={inputClass}
                      >
                        {MONEDAS.map((m) => (
                          <option key={m.codigo} value={m.codigo}>
                            {m.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Checkbox bienvenida */}
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
              </div>
            ) : (
              /* Pestaña Cobros */
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Forma de cobro</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Forma de cobro</label>
                      <select
                        value={formData.forma_cobro}
                        onChange={(e) => setFormData({ ...formData, forma_cobro: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Sin especificar</option>
                        <option value="PAGO_ANTICIPADO">Pago anticipado</option>
                        <option value="TRANSFERENCIA">Transferencia bancaria</option>
                        <option value="DOMICILIACION">Domiciliación bancaria</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="PAGARE">Pagaré</option>
                        <option value="EFECTIVO">Efectivo</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Canal preferente (cuenta contable)</label>
                      <input
                        type="text"
                        value={formData.canal_cobro}
                        onChange={(e) => setFormData({ ...formData, canal_cobro: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: 572000000 - BANCOS"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Datos bancarios</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>IBAN</label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: ES91 2100 0418 4502 0005 1332"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>BIC / SWIFT</label>
                      <input
                        type="text"
                        value={formData.bic}
                        onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: CAIXESBBXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Referencia de mandato</label>
                      <input
                        type="text"
                        value={formData.referencia_mandato}
                        onChange={(e) => setFormData({ ...formData, referencia_mandato: e.target.value })}
                        className={inputClass}
                        placeholder="Referencia SEPA"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones fijos abajo */}
          <div className="p-6 border-t border-neutral-200 flex gap-3 flex-shrink-0">
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
