import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        resolve(workbook)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function writeExcel(workbook, fileName) {
  const excelData = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  })
  const blob = new Blob([excelData], { 
    type: 'application/octet-stream' 
  })
  saveAs(blob, fileName)
}

export function mergeWorkbooks(workbooks) {
  const mergedWorkbook = XLSX.utils.book_new()
  
  workbooks.forEach(workbook => {
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      XLSX.utils.book_append_sheet(mergedWorkbook, worksheet, sheetName)
    })
  })
  
  return mergedWorkbook
}
