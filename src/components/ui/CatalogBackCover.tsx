'use client'

interface CatalogBackCoverProps {
  customImage?: string // URL de imagen personalizada (800x1130px)
}

export function CatalogBackCover({ customImage }: CatalogBackCoverProps) {
  // Si hay imagen personalizada, mostrarla como fondo completo
  if (customImage) {
    return (
      <div style={{ width: '800px', height: '1130px', position: 'relative', overflow: 'hidden' }}>
        <img
          src={customImage}
          alt="Contraportada"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />
      </div>
    )
  }

  // Diseño por defecto (información de contacto)
  return (
    <div style={{ width: '800px', height: '1130px', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', boxSizing: 'border-box', padding: '60px' }}>
      {/* Logo */}
      <img src="/logo-sphera.png" alt="SPHERA TILE" style={{ height: '60px', marginBottom: '60px' }} />

      {/* Title */}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#171717', margin: '0 0 16px 0', letterSpacing: '2px' }}>
        CONTACT US
      </h1>

      {/* Decorative red line */}
      <div style={{ width: '100px', height: '3px', backgroundColor: '#dc2626', margin: '0 0 60px 0' }} />

      {/* Company info */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#404040', lineHeight: '2', maxWidth: '500px' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#171717', fontSize: '16px', marginBottom: '20px' }}>
          SPHERA TILE S.L.
        </p>
        <p style={{ margin: 0 }}>AVDA. DEL MEDITERRÁNEO, 113</p>
        <p style={{ margin: 0 }}>12200 ONDA, CASTELLÓN, SPAIN</p>
        <p style={{ margin: '20px 0 0 0', fontWeight: 'bold' }}>NIF: ESB12945796</p>
        <p style={{ margin: '20px 0 0 0' }}>
          <strong>Tel:</strong> +34 964 744 246 · <strong>Mob:</strong> +34 633 220 225
        </p>
        <p style={{ margin: 0 }}>
          <strong>Email:</strong> info@spheratile.es
        </p>
        <p style={{ margin: 0 }}>
          <strong>Web:</strong> www.spheratile.com
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '60px', textAlign: 'center', fontSize: '11px', color: '#a3a3a3' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} SPHERA TILE S.L. · All rights reserved</p>
      </div>
    </div>
  )
}
