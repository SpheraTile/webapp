'use client'

const COMPANY = {
  name: 'SPHERA TILE S.L.',
  address: 'AVDA. DEL MEDITERRÁNEO, 113 - 12200 ONDA, CASTELLÓN, SPAIN',
  nif: 'ESB12945796',
  email: 'info@spheratile.es',
  tel: '+34 964 744 246',
  mob: '+34 633 220 225',
  web: 'www.spheratile.com',
}

interface CatalogCoverProps {
  serie?: string
  productCount: number
  date: string
}

export function CatalogCover({ serie, productCount, date }: CatalogCoverProps) {
  return (
    <div style={{ width: '800px', height: '1130px', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', boxSizing: 'border-box' }}>
      {/* Logo */}
      <img src="/logo-sphera.png" alt="SPHERA TILE" style={{ height: '80px', marginBottom: '40px' }} />

      {/* Title */}
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#171717', margin: '0 0 8px 0', letterSpacing: '4px' }}>
        PRODUCT CATALOG
      </h1>

      {/* Decorative red line */}
      <div style={{ width: '120px', height: '3px', backgroundColor: '#dc2626', margin: '0 0 32px 0' }} />

      {/* Serie or full catalog */}
      <p style={{ fontSize: '16px', color: '#525252', margin: '0 0 8px 0', fontWeight: '500' }}>
        {serie ? `Serie: ${serie}` : 'Catálogo completo'}
      </p>

      <p style={{ fontSize: '12px', color: '#a3a3a3', margin: '0 0 48px 0' }}>
        {productCount} productos · {date}
      </p>

      {/* Company info */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#737373', lineHeight: '1.8' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#171717', fontSize: '13px' }}>{COMPANY.name}</p>
        <p style={{ margin: 0 }}>{COMPANY.address}</p>
        <p style={{ margin: 0 }}>NIF: {COMPANY.nif}</p>
        <p style={{ margin: '12px 0 0 0' }}>
          TEL: {COMPANY.tel} · MOB: {COMPANY.mob}
        </p>
        <p style={{ margin: 0 }}>{COMPANY.email} · {COMPANY.web}</p>
      </div>
    </div>
  )
}
