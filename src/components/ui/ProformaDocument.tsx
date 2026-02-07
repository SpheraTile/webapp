'use client'

import { QRCodeSVG } from 'qrcode.react'

// Company info (from proforma)
const COMPANY = {
  name: 'SPHERA TILE S.L.',
  address: 'AVDA. DEL MEDITERRÁNEO, 113  12200 ONDA, CASTELLÓN, SPAIN',
  nif: 'ESB12945796',
  email: 'info@spheratile.es',
  tel: '+34 964 744 246',
  mob: '+34 633 220 225',
  bank: {
    name: 'CAJAMAR CAJA RURAL',
    address: 'CARRER DE MONTCADA, 14, 12005\nCASTELLÓN, ESPAÑA',
    iban: 'ES33 3058 7304 6527 2040 4063',
    swift: 'CCRIES2AXXX',
  },
  registry: 'Inscrita en el Reg. Mercantil de Castellón, Tomo 1669, Libro 1230, Folio 210, Hoja CS-37423, Inscripción 1ª - N.I.F. B-12945796',
}

export interface ProformaItem {
  formato: string
  descripcion: string
  calidad: string
  m2: number
  cajas: number
  pallets: number
  precioM2: number
  descuento?: number
  importe: number
  qrSlug?: string | null
  hsCode?: string | null
}

export interface ProformaDocumentProps {
  type: 'FACTURA' | 'ALBARÁN DE ENTREGA' | 'PEDIDO'
  documentNumber: string
  date: string
  page?: string
  client: {
    codigo?: string | null
    nombre: string
    empresa?: string | null
    pais?: string | null
    nif?: string | null
    telefono?: string | null
    direccion?: string | null
  }
  items: ProformaItem[]
  totals: {
    totalM2: number
    totalCajas: number
    totalPallets: number
    subtotal: number
    ivaPorcentaje?: number
    ivaEuros?: number
    total: number
  }
  weight: {
    net: number
    gross: number
  }
  payment?: {
    method: string
    bankName?: string
    bankAddress?: string
    iban?: string
    swift?: string
  }
  termsOfSale?: string
  observations?: string
  showSignatures?: boolean
  showPrices?: boolean
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function ProformaDocument({
  type,
  documentNumber,
  date,
  page = '1 / 1',
  client,
  items,
  totals,
  weight,
  payment,
  termsOfSale = 'EX-WORK',
  observations,
  showSignatures = false,
  showPrices = true,
}: ProformaDocumentProps) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  // Group HS codes
  const hsCodes = items
    .filter((item) => item.hsCode)
    .reduce<Record<string, number>>((acc, item) => {
      const code = item.hsCode!
      acc[code] = (acc[code] || 0) + item.m2
      return acc
    }, {})

  const hsCodesStr = Object.entries(hsCodes)
    .map(([code, m2]) => `${code} - ${fmt(m2)} M2`)
    .join('\n')

  const typeLabel = type === 'FACTURA' ? 'FACTURA / INVOICE'
    : type === 'ALBARÁN DE ENTREGA' ? 'ALBARÁN DE ENTREGA / DELIVERY NOTE'
    : 'PEDIDO / ORDER'

  const totalLabel = type === 'FACTURA' ? 'Total Factura €'
    : type === 'PEDIDO' ? 'Total Pedido €'
    : 'Total €'

  // Cell style helpers
  const cellBorder = 'border border-neutral-400 px-2 py-1'
  const headerCell = `${cellBorder} bg-neutral-100 text-[10px] font-bold text-neutral-800 uppercase`
  const dataCell = `${cellBorder} text-[10px] text-neutral-900`

  return (
    <div className="bg-white w-full" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px', lineHeight: '1.3' }}>
      {/* Logo + Company Info */}
      <div className="text-center pt-4 pb-2 px-6">
        <img src="/logo-sphera.png" alt="SPHERA TILE" className="mx-auto h-16 mb-2" />
        <p className="text-[9px] text-neutral-700 font-medium">
          {COMPANY.address}  NIF:{COMPANY.nif}
        </p>
        <p className="text-[9px] text-neutral-700">
          EMAIL:{COMPANY.email}  TEL: {COMPANY.tel}  MOB: {COMPANY.mob}
        </p>
      </div>

      {/* Document Title */}
      <div className="text-right px-6 pb-2">
        <h1 className="text-2xl font-bold text-red-700 tracking-wide">{typeLabel}</h1>
      </div>

      {/* Client Name */}
      <div className="px-6 pb-2">
        <p className="text-sm font-semibold text-neutral-900">{client.nombre}</p>
      </div>

      {/* Info Table: CLIENT | DOC NUMBER | DATE | PAGE + Client details */}
      <div className="px-6 pb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerCell} style={{ width: '20%' }}>CLIENT</th>
              <th className={headerCell} style={{ width: '25%' }}>
                {type === 'FACTURA' ? 'FACTURA' : type === 'ALBARÁN DE ENTREGA' ? 'ALBARÁN' : 'PEDIDO'}
              </th>
              <th className={headerCell} style={{ width: '20%' }}>DATE</th>
              <th className={headerCell} style={{ width: '10%' }}>PAGE</th>
              <th className={cellBorder} rowSpan={2} style={{ width: '25%', verticalAlign: 'top', fontSize: '10px' }}>
                <div className="text-[10px]">
                  {client.pais && <span>({client.pais})</span>}
                  <br />
                  N.I.F. {client.nif || ''}
                  <br />
                  Telf.: {client.telefono || ''}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={dataCell}>{client.codigo || '-'}</td>
              <td className={dataCell}>{documentNumber}</td>
              <td className={dataCell}>{formatDateShort(date)}</td>
              <td className={dataCell}>{page}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Products Table */}
      <div className="px-6 pb-1">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerCell} style={{ width: '10%' }}>FORMAT</th>
              <th className={headerCell}>DESCRIPTION</th>
              <th className={headerCell} style={{ width: '6%' }}>CLASS</th>
              <th className={headerCell} style={{ width: '50px' }}>QR</th>
              <th className={`${headerCell} text-right`} style={{ width: '8%' }}>M2</th>
              <th className={`${headerCell} text-right`} style={{ width: '7%' }}>BOX</th>
              <th className={`${headerCell} text-right`} style={{ width: '7%' }}>PALLET</th>
              {showPrices && (
                <>
                  <th className={`${headerCell} text-right`} style={{ width: '8%' }}>PRICE €</th>
                  <th className={`${headerCell} text-right`} style={{ width: '6%' }}>% DTO.</th>
                  <th className={`${headerCell} text-right`} style={{ width: '9%' }}>AMOUNT</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className={dataCell}>{item.formato}</td>
                <td className={`${dataCell} text-[9px]`}>{item.descripcion}</td>
                <td className={`${dataCell} text-center`}>{item.calidad}</td>
                <td className={`${dataCell} text-center`} style={{ padding: '2px' }}>
                  {item.qrSlug && (
                    <QRCodeSVG
                      value={`${baseUrl}/productos/${item.qrSlug}`}
                      size={32}
                      level="M"
                      includeMargin={false}
                    />
                  )}
                </td>
                <td className={`${dataCell} text-right`}>{fmt(item.m2)}</td>
                <td className={`${dataCell} text-right`}>{fmt(item.cajas)}</td>
                <td className={`${dataCell} text-right`}>{fmt(item.pallets)}</td>
                {showPrices && (
                  <>
                    <td className={`${dataCell} text-right`}>{fmt(item.precioM2)}</td>
                    <td className={`${dataCell} text-right`}>{item.descuento ? fmt(item.descuento) : ''}</td>
                    <td className={`${dataCell} text-right font-medium`}>{fmt(item.importe)}</td>
                  </>
                )}
              </tr>
            ))}
            {/* Empty rows for spacing if few items */}
            {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className={dataCell}>&nbsp;</td>
                <td className={dataCell}></td>
                <td className={dataCell}></td>
                <td className={dataCell}></td>
                <td className={dataCell}></td>
                <td className={dataCell}></td>
                <td className={dataCell}></td>
                {showPrices && (
                  <>
                    <td className={dataCell}></td>
                    <td className={dataCell}></td>
                    <td className={dataCell}></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weight + Totals Row */}
      <div className="px-6 pb-2">
        <div className="flex items-end justify-between">
          {/* Weight */}
          <div className="text-[10px]">
            <p className="font-bold">NET WEIGHT: {Math.round(weight.net)} KG</p>
            <p className="font-bold">GROSS WEIGHT: {Math.round(weight.gross)} KG</p>
          </div>

          {/* Totals row with M2 + BOX + PALLET sums */}
          <div className="flex items-end gap-4 text-[10px]">
            <span>{fmt(totals.totalM2)}</span>
            <span>{fmt(totals.totalCajas)}</span>
            <span>{fmt(totals.totalPallets)}</span>
          </div>

          {/* Financial totals */}
          {showPrices && (
            <table className="border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className={`${cellBorder} bg-neutral-100 font-bold text-center`}>Total €</th>
                  <th className={`${cellBorder} bg-neutral-100 font-bold text-center`}>Cuota I.V.A. €</th>
                  <th className={`${cellBorder} bg-neutral-100 font-bold text-center text-[11px]`}>{totalLabel}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`${dataCell} text-center font-medium`}>{fmt(totals.subtotal)}</td>
                  <td className={`${dataCell} text-center`}>
                    {totals.ivaPorcentaje != null && totals.ivaPorcentaje > 0
                      ? `${fmt(totals.ivaEuros || 0)}`
                      : ''
                    }
                    {totals.ivaPorcentaje != null && totals.ivaPorcentaje > 0 && (
                      <span className="block text-[8px] text-neutral-500">{totals.ivaPorcentaje}%</span>
                    )}
                  </td>
                  <td className={`${dataCell} text-center font-bold text-[12px]`}>{fmt(totals.total)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Exporter declaration */}
      {Object.keys(hsCodes).length > 0 && (
        <div className="px-6 pb-2">
          <p className="text-[8px] font-bold text-neutral-800 leading-tight">
            THE EXPORTER OF THE PRODUCTS COVERED BY THIS DOCUMENT (CUSTOMS AUTHORISATION NO. ESEAOR 19000455 - ESREX3575 ),
            DECLARES THAT EXCEPT WHERE OTHERWISE CLEARLY INDICATED, THESE PRODUCT OF SPANISH PREFERENTIAL ORIGIN.
          </p>
        </div>
      )}

      {/* Footer table: Payment, Bank, Terms, H.S. Codes + Stamp area */}
      <div className="px-6 pb-2">
        <div className="flex gap-4">
          {/* Left: Info table */}
          <table className="border-collapse text-[10px] flex-1">
            <tbody>
              {payment && (
                <tr>
                  <td className={`${cellBorder} font-bold bg-neutral-100 whitespace-nowrap`} style={{ width: '30%' }}>TERMS OF PAYMENT</td>
                  <td className={dataCell}>{payment.method}</td>
                </tr>
              )}
              <tr>
                <td className={`${cellBorder} font-bold bg-neutral-100`}>BANK DETAILS</td>
                <td className={dataCell}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {payment?.bankName || COMPANY.bank.name}
                    {'\n'}{payment?.bankAddress || COMPANY.bank.address}
                    {'\n'}IBAN: {payment?.iban || COMPANY.bank.iban}
                    {'\n'}SWIFTCODE: {payment?.swift || COMPANY.bank.swift}
                  </div>
                </td>
              </tr>
              <tr>
                <td className={`${cellBorder} font-bold bg-neutral-100`}>TERMS OF SALE</td>
                <td className={dataCell}>{termsOfSale}</td>
              </tr>
              <tr>
                <td className={`${cellBorder} font-bold bg-neutral-100`}>OBSERVATIONS</td>
                <td className={dataCell}>{observations || 'MERCANCIA DE ORIGEN ESPAÑOL'}</td>
              </tr>
            </tbody>
          </table>

          {/* Right: Stamp + H.S. Codes */}
          <div className="flex flex-col justify-between" style={{ width: '200px' }}>
            {/* Stamp area */}
            <div className="border border-neutral-400 rounded p-2 text-center text-[8px] text-neutral-500 flex-1 flex flex-col items-center justify-center">
              <p className="font-bold text-neutral-700">SPHERA TILE S.L.</p>
              <p>Avd. Mediterráneo 84 - 3</p>
              <p>12200 - Onda (Castellón)</p>
              <p>CIF: B12945796</p>
            </div>
            {/* H.S. Codes */}
            {hsCodesStr && (
              <div className="border border-neutral-400 mt-1 p-1 text-[9px]">
                <span className="font-bold">H.S. CODES</span>
                <span className="ml-2" style={{ whiteSpace: 'pre-line' }}>{hsCodesStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signatures (albaranes only) */}
      {showSignatures && (
        <div className="px-6 pb-3">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-neutral-600 mb-10">Entregado por / Delivered by:</p>
              <div className="border-t border-neutral-400 pt-1">
                <p className="text-[9px] text-neutral-500">Firma y sello / Signature & stamp</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-neutral-600 mb-10">Recibido por / Received by:</p>
              <div className="border-t border-neutral-400 pt-1">
                <p className="text-[9px] text-neutral-500">Firma, nombre y DNI / Signature, name & ID</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material reservation note */}
      <div className="px-6 pb-1 text-center">
        <p className="text-[11px] font-bold italic">Solo se reservará el material durante 20 días.</p>
      </div>

      {/* Legal footer */}
      <div className="px-6 pb-4 text-center">
        <p className="text-[8px] text-neutral-500">{COMPANY.registry}</p>
      </div>
    </div>
  )
}
