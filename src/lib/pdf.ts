'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPDFOptions {
  filename: string
  element: HTMLElement
  orientation?: 'portrait' | 'landscape'
}

export async function exportToPDF({ filename, element, orientation = 'portrait' }: ExportPDFOptions): Promise<Blob> {
  // Temporarily hide print:hidden elements
  const hiddenElements = element.querySelectorAll('.print\\:hidden')
  hiddenElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none'
  })

  // Save original styles
  const originalStyles = {
    width: element.style.width,
    minWidth: element.style.minWidth,
    maxWidth: element.style.maxWidth,
    overflow: element.style.overflow,
  }
  element.style.width = '800px'
  element.style.minWidth = '800px'
  element.style.maxWidth = '800px'
  element.style.overflow = 'visible'

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Check for data-pdf-page sections for multi-page support
    const pages = element.querySelectorAll('[data-pdf-page]')

    const canvasOptions = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el: Element) => {
        const style = window.getComputedStyle(el)
        return style.color?.includes('oklch') || style.backgroundColor?.includes('oklch')
      },
      onclone: (clonedDoc: Document) => {
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          const style = (el as HTMLElement).style
          if (style.color && style.color.includes('oklch')) style.color = '#000000'
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) style.backgroundColor = '#ffffff'
          if (style.borderColor && style.borderColor.includes('oklch')) style.borderColor = '#d4d4d4'
        })
      },
    }

    if (pages.length > 0) {
      // Multi-page mode: capture each [data-pdf-page] section as its own PDF page
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement
        const isQRPage = pageEl.classList.contains('qr-print-page')

        if (i > 0) {
          pdf.addPage()
        }

        const canvas = await html2canvas(pageEl, canvasOptions)
        // Usar JPEG con calidad 0.75 para reducir el tamaño del PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.75)

        // QR pages: minimal margins, fill the page, center vertically
        // Normal pages: standard 10mm margins
        const margin = isQRPage ? 5 : 10
        const imgWidth = pageWidth - (margin * 2)
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Center vertically on the page
        const availableHeight = pageHeight - (margin * 2)
        const yOffset = imgHeight < availableHeight
          ? margin + (availableHeight - imgHeight) / 2
          : margin

        pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight)
      }
    } else {
      // Fallback: single continuous capture (original behavior)
      const canvas = await html2canvas(element, canvasOptions)
      // Usar JPEG con calidad 0.75 para reducir el tamaño del PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.75)
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - 20)

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight)
        heightLeft -= (pageHeight - 20)
      }
    }

    return pdf.output('blob')
  } finally {
    // Restore styles
    element.style.width = originalStyles.width
    element.style.minWidth = originalStyles.minWidth
    element.style.maxWidth = originalStyles.maxWidth
    element.style.overflow = originalStyles.overflow

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

// ---- Image export (PNG) ----

interface ExportImageOptions {
  filename: string
  element: HTMLElement
}

export async function exportToImage({ element }: ExportImageOptions): Promise<Blob> {
  // Temporarily hide print:hidden elements
  const hiddenElements = element.querySelectorAll('.print\\:hidden')
  hiddenElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none'
  })

  const originalStyles = {
    width: element.style.width,
    minWidth: element.style.minWidth,
    maxWidth: element.style.maxWidth,
    overflow: element.style.overflow,
  }
  element.style.width = '800px'
  element.style.minWidth = '800px'
  element.style.maxWidth = '800px'
  element.style.overflow = 'visible'

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          const style = (el as HTMLElement).style
          if (style.color && style.color.includes('oklch')) style.color = '#000000'
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) style.backgroundColor = '#ffffff'
          if (style.borderColor && style.borderColor.includes('oklch')) style.borderColor = '#d4d4d4'
        })
      },
    })

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create image blob'))
      }, 'image/png')
    })
  } finally {
    element.style.width = originalStyles.width
    element.style.minWidth = originalStyles.minWidth
    element.style.maxWidth = originalStyles.maxWidth
    element.style.overflow = originalStyles.overflow

    hiddenElements.forEach((el) => {
      (el as HTMLElement).style.display = ''
    })
  }
}

export async function downloadImage(options: ExportImageOptions): Promise<void> {
  const blob = await exportToImage(options)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

