<template>
  <div class="tool-container">
    <h2>Excel合并工具</h2>
    <input type="file" @change="handleFileUpload" multiple accept=".xlsx,.xls">
    <button @click="mergeExcels" :disabled="files.length === 0">合并Excel</button>
    <div v-if="progress" class="progress">
      处理进度: {{progress}}%
      <div class="progress-bar" :style="{width: progress + '%'}"></div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      files: [],
      progress: 0
    }
  },
  methods: {
    handleFileUpload(e) {
      this.files = Array.from(e.target.files);
    },
    async mergeExcels() {
      if (this.files.length === 0) return;
      
      try {
        this.progress = 0;
        const mergedData = [];
        const headers = new Set();
        
        // 按修改时间排序
        this.files.sort((a, b) => a.lastModified - b.lastModified);
        
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // 收集表头
          if (jsonData.length > 0) {
            Object.keys(jsonData[0]).forEach(header => headers.add(header));
          }
          
          mergedData.push(...jsonData);
          this.progress = Math.floor(((i + 1) / this.files.length) * 100);
        }
        
        // 创建合并后的工作表
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(mergedData);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "合并数据");
        
        // 导出
        const excelData = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelData], { type: 'application/octet-stream' }), 
              `合并结果_${new Date().toISOString().slice(0,10)}.xlsx`);
        
        this.progress = 100;
      } catch (error) {
        console.error('合并Excel出错:', error);
        alert('合并Excel时出错: ' + error.message);
      }
    }
  }
}
</script>
