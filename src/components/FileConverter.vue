<template>
  <div class="tool-container">
    <h2>文件格式转换</h2>
    <div class="tool-section">
      <h3>选择转换类型</h3>
      <select v-model="conversionType">
        <option value="pdf-to-word">PDF → Word</option>
        <option value="image-to-pdf">图片 → PDF</option>
        <option value="excel-to-pdf">Excel → PDF</option>
      </select>
      
      <input 
        type="file" 
        @change="handleFileUpload" 
        :accept="fileAcceptTypes"
        ref="fileInput"
      >
      
      <button @click="convertFile" :disabled="!selectedFile">
        {{ conversionButtonText }}
      </button>
      
      <div v-if="progress > 0" class="progress">
        <div class="progress-bar" :style="{width: progress + '%'}"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      conversionType: 'pdf-to-word',
      selectedFile: null,
      progress: 0,
      conversionMap: {
        'pdf-to-word': {
          accept: '.pdf',
          buttonText: '转换为Word文档',
          handler: this.convertPdfToWord
        },
        'image-to-pdf': {
          accept: 'image/*',
          buttonText: '转换为PDF',
          handler: this.convertImageToPdf
        },
        'excel-to-pdf': {
          accept: '.xlsx,.xls',
          buttonText: '转换为PDF',
          handler: this.convertExcelToPdf
        }
      }
    }
  },
  computed: {
    fileAcceptTypes() {
      return this.conversionMap[this.conversionType]?.accept || '*'
    },
    conversionButtonText() {
      return this.conversionMap[this.conversionType]?.buttonText || '转换'
    }
  },
  methods: {
    handleFileUpload(e) {
      this.selectedFile = e.target.files[0]
      this.progress = 0
    },
    
    async convertFile() {
      if (!this.selectedFile) return
      
      try {
        this.progress = 10
        const handler = this.conversionMap[this.conversionType].handler
        await handler.call(this)
        this.progress = 100
      } catch (error) {
        console.error('转换失败:', error)
        alert('文件转换失败: ' + error.message)
        this.progress = 0
      }
    },
    
    async convertPdfToWord() {
      // 使用pdf-lib提取文本内容
      const arrayBuffer = await this.selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      let textContent = ''
      
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i)
        textContent += await page.getTextContent()
        this.progress = 10 + (i / pdfDoc.getPageCount() * 90)
      }
      
      // 创建Word文档（模拟实现）
      const blob = new Blob([textContent], { type: 'application/msword' })
      saveAs(blob, `${this.selectedFile.name.replace('.pdf', '')}.docx`)
    },
    
    async convertImageToPdf() {
      const pdfDoc = await PDFDocument.create()
      const imgUrl = URL.createObjectURL(this.selectedFile)
      const img = await this.loadImage(imgUrl)
      
      const page = pdfDoc.addPage([img.width, img.height])
      const imgBytes = await fetch(imgUrl).then(res => res.arrayBuffer())
      const pdfImage = await pdfDoc.embedPng(imgBytes)
      
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height
      })
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      saveAs(blob, `${this.selectedFile.name.replace(/\.[^/.]+$/, '')}.pdf`)
      URL.revokeObjectURL(imgUrl)
      this.progress = 100
    },
    
    async convertExcelToPdf() {
      const arrayBuffer = await this.selectedFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const pdfDoc = await PDFDocument.create()
      
      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName]
        const html = XLSX.utils.sheet_to_html(worksheet)
        this.addHtmlAsPdfPage(pdfDoc, html)
        this.progress = (index / workbook.SheetNames.length) * 100
      })
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      saveAs(blob, `${this.selectedFile.name.replace(/\.[^/.]+$/, '')}.pdf`)
    },
    
    loadImage(url) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = url
      })
    },
    
    async addHtmlAsPdfPage(pdfDoc, html) {
      // 简化实现：实际应使用html2canvas等库
      const page = pdfDoc.addPage([595, 842]) // A4尺寸
      page.drawText(html.substring(0, 1000), { // 限制文本量
        x: 50,
        y: 750,
        size: 12
      })
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.tool-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}

select, input[type="file"] {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.progress {
  margin-top: 15px;
  height: 5px;
  background: #f0f0f0;
  border-radius: 3px;
}

.progress-bar {
  height: 100%;
  background: #4CAF50;
  border-radius: 3px;
  transition: width 0.3s;
}
</style>
