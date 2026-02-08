'use client'

import { QRCodeSVG } from 'qrcode.react'

// Company info (from proforma)
const COMPANY = {
  name: 'SPHERA TILE S.L.',
  address: 'AVDA. DEL MEDITERRÁNEO, 113 - 12200 ONDA, CASTELLÓN, SPAIN',
  nif: 'ESB12945796',
  email: 'info@spheratile.es',
  tel: '+34 964 744 246',
  mob: '+34 633 220 225',
  bank: {
    name: 'CAJAMAR CAJA RURAL',
    address: 'CARRER DE MONTCADA, 14, 12005 CASTELLÓN',
    iban: 'ES33 3058 7304 6527 2040 4063',
    swift: 'CCRIES2AXXX',
  },
  registry: 'Reg. Mercantil Castellón, Tomo 1669, Libro 1230, Folio 210, Hoja CS-37423 - N.I.F. B-12945796',
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
    .join(', ')

  const typeLabel = type === 'FACTURA' ? 'FACTURA / INVOICE'
    : type === 'ALBARÁN DE ENTREGA' ? 'ALBARÁN / DELIVERY NOTE'
    : 'PEDIDO / ORDER'

  const totalLabel = type === 'FACTURA' ? 'Total Factura €'
    : type === 'PEDIDO' ? 'Total Pedido €'
    : 'Total €'

  // Cell style helpers
  const cb = 'border border-neutral-400 px-2.5 py-1.5'
  const hc = `${cb} bg-neutral-100 text-[9px] font-bold text-neutral-800 uppercase`
  const dc = `${cb} text-[9px] text-neutral-900`

  return (
    <div className="overflow-x-auto bg-white">
      <div style={{ width: '800px', minHeight: '1130px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', lineHeight: '1.4', display: 'flex', flexDirection: 'column', margin: '0 auto' }}>
        <div className="pl-6 pr-4 py-3 flex-1 flex flex-col">

        {/* Header: Logo left + Company info center + Doc type right */}
        <div className="flex items-start justify-between pb-3">
          <img src="/logo-sphera.png" alt="SPHERA TILE" className="h-8" />
          <div className="text-center flex-1 px-3">
            <p className="text-[8px] text-neutral-700 font-medium leading-tight">
              {COMPANY.name} - {COMPANY.address} - NIF: {COMPANY.nif}
            </p>
            <p className="text-[8px] text-neutral-600 leading-tight">
              {COMPANY.email} | TEL: {COMPANY.tel} | MOB: {COMPANY.mob}
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold text-red-700 leading-tight whitespace-nowrap">{typeLabel}</h1>
          </div>
        </div>

        {/* Client + Doc info row */}
        <div className="pb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={hc} style={{ width: '25%' }}>CLIENTE / CLIENT</th>
                <th className={hc} style={{ width: '20%' }}>
                  {type === 'FACTURA' ? 'FACTURA' : type === 'ALBARÁN DE ENTREGA' ? 'ALBARÁN' : 'PEDIDO'}
                </th>
                <th className={hc} style={{ width: '12%' }}>FECHA / DATE</th>
                <th className={hc} style={{ width: '8%' }}>PÁG.</th>
                <th className={hc} style={{ width: '35%' }}>DATOS CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={dc}>
                  <div className="font-semibold">{client.nombre}</div>
                  {client.codigo && <div className="text-[8px] text-neutral-500">Cód: {client.codigo}</div>}
                </td>
                <td className={`${dc} font-medium`}>{documentNumber}</td>
                <td className={dc}>{formatDateShort(date)}</td>
                <td className={dc}>{page}</td>
                <td className={dc}>
                  <div className="text-[8px] leading-tight">
                    {client.pais && <span>({client.pais}) </span>}
                    {client.nif && <span>NIF: {client.nif} </span>}
                    {client.telefono && <span>Tel: {client.telefono}</span>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Products Table */}
        <div className="pb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={hc} style={{ width: '9%' }}>FORMAT</th>
                <th className={hc}>DESCRIPTION</th>
                <th className={hc} style={{ width: '5%' }}>CLASS</th>
                <th className={hc} style={{ width: '30px' }}>QR</th>
                <th className={`${hc} text-right`} style={{ width: '8%' }}>M2</th>
                <th className={`${hc} text-right`} style={{ width: '6%' }}>BOX</th>
                <th className={`${hc} text-right`} style={{ width: '7%' }}>PALLET</th>
                {showPrices && (
                  <>
                    <th className={`${hc} text-right`} style={{ width: '8%' }}>PRICE €</th>
                    <th className={`${hc} text-right`} style={{ width: '6%' }}>% DTO.</th>
                    <th className={`${hc} text-right`} style={{ width: '9%' }}>AMOUNT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className={dc}>{item.formato}</td>
                  <td className={`${dc} text-[8px]`}>{item.descripcion}</td>
                  <td className={`${dc} text-center`}>{item.calidad}</td>
                  <td className={`${dc} text-center`} style={{ padding: '1px' }}>
                    {item.qrSlug && (
                      <QRCodeSVG
                        value={`${baseUrl}/productos/${item.qrSlug}`}
                        size={36}
                        level="L"
                        includeMargin={false}
                      />
                    )}
                  </td>
                  <td className={`${dc} text-right`}>{fmt(item.m2)}</td>
                  <td className={`${dc} text-right`}>{fmt(item.cajas, 0)}</td>
                  <td className={`${dc} text-right`}>{fmt(item.pallets, 1)}</td>
                  {showPrices && (
                    <>
                      <td className={`${dc} text-right`}>{fmt(item.precioM2)}</td>
                      <td className={`${dc} text-right`}>{item.descuento ? fmt(item.descuento) : ''}</td>
                      <td className={`${dc} text-right font-medium`}>{fmt(item.importe)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom section - pushed to bottom of page */}
        <div className="mt-auto">

          {/* Totals row */}
          <div className="pb-2">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-neutral-50">
                  <td className={`${cb} font-bold text-[9px]`} colSpan={4}>TOTALES</td>
                  <td className={`${cb} text-right font-bold text-[9px]`} style={{ width: '8%' }}>{fmt(totals.totalM2)}</td>
                  <td className={`${cb} text-right font-bold text-[9px]`} style={{ width: '6%' }}>{fmt(totals.totalCajas, 0)}</td>
                  <td className={`${cb} text-right font-bold text-[9px]`} style={{ width: '7%' }}>{fmt(totals.totalPallets, 1)}</td>
                  {showPrices && (
                    <>
                      <td className={cb} style={{ width: '8%' }}></td>
                      <td className={cb} style={{ width: '6%' }}></td>
                      <td className={`${cb} text-right font-bold text-[9px]`} style={{ width: '9%' }}>{fmt(totals.subtotal)}</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Weight + Financial totals row */}
          <div className="flex items-start justify-between pb-2">
            <div className="text-[9px]">
              <span className="font-bold">NET: {Math.round(weight.net)} KG</span>
              <span className="ml-3 font-bold">GROSS: {Math.round(weight.gross)} KG</span>
            </div>

            {showPrices && (
              <table className="border-collapse text-[9px]">
                <tbody>
                  <tr>
                    <td className={`${cb} bg-neutral-100 font-bold`}>Subtotal €</td>
                    <td className={`${dc} text-right`}>{fmt(totals.subtotal)}</td>
                    {totals.ivaPorcentaje != null && totals.ivaPorcentaje > 0 && (
                      <>
                        <td className={`${cb} bg-neutral-100 font-bold`}>IVA {totals.ivaPorcentaje}%</td>
                        <td className={`${dc} text-right`}>{fmt(totals.ivaEuros || 0)}</td>
                      </>
                    )}
                    <td className={`${cb} bg-neutral-100 font-bold text-[10px]`}>{totalLabel}</td>
                    <td className={`${dc} text-right font-bold text-[11px]`}>{fmt(totals.total)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Exporter declaration */}
          {Object.keys(hsCodes).length > 0 && (
            <div className="pb-1">
              <p className="text-[7px] font-bold text-neutral-700 leading-tight">
                THE EXPORTER OF THE PRODUCTS COVERED BY THIS DOCUMENT (CUSTOMS AUTH. NO. ESEAOR 19000455 - ESREX3575),
                DECLARES THAT EXCEPT WHERE OTHERWISE CLEARLY INDICATED, THESE PRODUCTS ARE OF SPANISH PREFERENTIAL ORIGIN.
              </p>
            </div>
          )}

          {/* Payment + Bank + Terms + Stamp */}
          <div className="pb-2">
            <table className="w-full border-collapse text-[9px]">
              <tbody>
                {payment && (
                  <tr>
                    <td className={`${cb} font-bold bg-neutral-100`} style={{ width: '22%' }}>PAYMENT</td>
                    <td className={dc} colSpan={2}>{payment.method}</td>
                    <td className={`${cb} bg-neutral-100 font-bold text-center`} rowSpan={4} style={{ width: '22%', verticalAlign: 'middle' }}>
                      <div className="text-[8px] text-neutral-600">
                        <p className="font-bold text-neutral-800">SPHERA TILE S.L.</p>
                        <p>CIF: B12945796</p>
                      </div>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className={`${cb} font-bold bg-neutral-100`}>BANK</td>
                  <td className={dc} colSpan={payment ? 2 : 2}>
                    {COMPANY.bank.name} - IBAN: {COMPANY.bank.iban} - SWIFT: {COMPANY.bank.swift}
                  </td>
                  {!payment && (
                    <td className={`${cb} bg-neutral-100 font-bold text-center`} rowSpan={3} style={{ width: '22%', verticalAlign: 'middle' }}>
                      <div className="text-[8px] text-neutral-600">
                        <p className="font-bold text-neutral-800">SPHERA TILE S.L.</p>
                        <p>CIF: B12945796</p>
                      </div>
                    </td>
                  )}
                </tr>
                <tr>
                  <td className={`${cb} font-bold bg-neutral-100`}>TERMS</td>
                  <td className={dc} colSpan={2}>{termsOfSale}</td>
                </tr>
                <tr>
                  <td className={`${cb} font-bold bg-neutral-100`}>OBS.</td>
                  <td className={dc} colSpan={2}>
                    {observations || 'MERCANCIA DE ORIGEN ESPAÑOL'}
                    {hsCodesStr && <span className="ml-2 font-bold">H.S.: {hsCodesStr}</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures (albaranes only) */}
          {showSignatures && (
            <div className="pb-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[9px] text-neutral-600 mb-6">Entregado por / Delivered by:</p>
                  <div className="border-t border-neutral-400 pt-px">
                    <p className="text-[8px] text-neutral-500">Firma y sello</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-neutral-600 mb-6">Recibido por / Received by:</p>
                  <div className="border-t border-neutral-400 pt-px">
                    <p className="text-[8px] text-neutral-500">Firma, nombre y DNI</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer line */}
          <div className="text-center border-t border-neutral-300 pt-1">
            <p className="text-[7px] text-neutral-500" style={{ margin: 0 }}>
              Solo se reservará el material durante 20 días. — {COMPANY.registry}
            </p>
          </div>

        </div>

        </div>
      </div>
    </div>
  )
}
