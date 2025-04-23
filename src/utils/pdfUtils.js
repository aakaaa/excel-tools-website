import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

export async function mergePDFs(files) {
  const mergedPdf = await PDFDocument.create()
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
    pages.forEach(page => mergedPdf.addPage(page))
  }
  
  const mergedPdfBytes = await mergedPdf.save()
  return new Blob([mergedPdfBytes], { type: 'application/pdf' })
}

export async function splitPDF(file, options) {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const pageCount = pdfDoc.getPageCount()
  const result = []
  
  for (let i = 0; i < pageCount; i += options.pagesPerFile || 1) {
    const newPdf = await PDFDocument.create()
    const end = Math.min(i + (options.pagesPerFile || 1), pageCount)
    
    for (let j = i; j < end; j++) {
      const [page] = await newPdf.copyPages(pdfDoc, [j])
      newPdf.addPage(page)
    }
    
    const pdfBytes = await newPdf.save()
    result.push(new Blob([pdfBytes], { type: 'application/pdf' }))
  }
  
  return result
}
