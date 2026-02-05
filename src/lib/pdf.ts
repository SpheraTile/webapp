'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPDFOptions {
  filename: string
  element: HTMLElement
  orientation?: 'portrait' | 'landscape'
}

export async function exportToPDF({ filename, element, orientation = 'portrait' }: ExportPDFOptions): Promise<Blob> {
  // Temporarily show all elements (remove print:hidden)
  const hiddenElements = element.querySelectorAll('.print\\:hidden')
  hiddenElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none'
  })

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20 // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10 // Top margin

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pageHeight - 20)

    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - 20)
    }

    return pdf.output('blob')
  } finally {
    // Restore hidden elements
    hiddenElements.forEach((el) => {
      (el as HTMLElement).style.display = ''
    })
  }
}

export async function downloadPDF(options: ExportPDFOptions): Promise<void> {
  const blob = await exportToPDF(options)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getPDFDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
