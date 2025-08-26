export type ExportPdfOptions = {
  fileName?: string
  marginPt?: number
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'letter'
  scale?: number
}

/**
 * Exports a DOM element to a multi-page PDF using html2canvas + jsPDF.
 * Splits tall content across pages while preserving width and aspect ratio.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: ExportPdfOptions = {}
) {
  const {
    fileName = 'export.pdf',
    marginPt = 24,
    orientation = 'portrait',
    format = 'a4',
    scale = 2,
  } = options

  const html2canvas = (await import('html2canvas')).default
  const jsPDFModule: any = await import('jspdf')
  const JsPDFClass = jsPDFModule.jsPDF || jsPDFModule.default

  // Render element to canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    windowWidth: element.scrollWidth,
  })

  const pdf = new JsPDFClass({ orientation, unit: 'pt', format })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const usableWidth = pageWidth - marginPt * 2
  const pixelPerPoint = canvas.width / usableWidth
  const usableHeightPx = (pageHeight - marginPt * 2) * pixelPerPoint

  const totalHeightPx = canvas.height
  const totalPages = Math.max(1, Math.ceil(totalHeightPx / usableHeightPx))

  const originalCtx = canvas.getContext('2d')
  if (!originalCtx) return

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const sourceY = Math.floor(pageIndex * usableHeightPx)
    const cropHeightPx = Math.min(
      Math.floor(usableHeightPx),
      totalHeightPx - sourceY
    )

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = cropHeightPx
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) continue

    tempCtx.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      cropHeightPx,
      0,
      0,
      canvas.width,
      cropHeightPx
    )

    const imgData = tempCanvas.toDataURL('image/png')
    const targetHeightPt = cropHeightPx / pixelPerPoint

    if (pageIndex > 0) {
      pdf.addPage({ format, orientation })
    }

    pdf.addImage(
      imgData,
      'PNG',
      marginPt,
      marginPt,
      usableWidth,
      targetHeightPt
    )
  }

  pdf.save(fileName)
}


