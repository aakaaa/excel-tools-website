<template>
  <div class="tool-container">
    <h2>Excel分类工具</h2>
    <div class="config-section">
      <div>
        <label>匹配列: </label>
        <input v-model="config.matchColumn" placeholder="例如: A">
      </div>
      <div>
        <label>输出目录: </label>
        <input v-model="config.outputFolder" placeholder="默认为output_时间戳">
      </div>
      <div v-for="(table, index) in config.tables" :key="index" class="table-config">
        <input v-model="table.name" placeholder="工作表名称">
        <textarea v-model="table.matchTerms" placeholder="匹配关键词，用逗号分隔"></textarea>
        <button @click="removeTable(index)">删除</button>
      </div>
      <button @click="addTable">添加分类规则</button>
    </div>
    <input type="file" @change="handleFileUpload" accept=".xlsx,.xls">
    <button @click="processExcel" :disabled="!file">开始处理</button>
    <div v-if="progress" class="progress">
      处理进度: {{progress}}%
      <div class="progress-bar" :style="{width: progress + '%'}"></div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default {
  data() {
    return {
      file: null,
      progress: 0,
      config: {
        matchColumn: 'A',
        outputFolder: '',
        tables: [
          { name: '分类1', matchTerms: '关键词1,关键词2' },
          { name: '分类2', matchTerms: '关键词3,关键词4' }
        ]
      }
    }
  },
  methods: {
    handleFileUpload(e) {
      this.file = e.target.files[0];
    },
    addTable() {
      this.config.tables.push({ name: '', matchTerms: '' });
    },
    removeTable(index) {
      this.config.tables.splice(index, 1);
    },
    async processExcel() {
      if (!this.file) return;
      
      try {
        this.progress = 0;
        const data = await this.file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const sourceSheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sourceSheet);
        
        const zip = new JSZip();
        let processedSheets = 0;
        
        for (const table of this.config.tables) {
          const filteredData = jsonData.filter(row => {
            const cellValue = row[this.config.matchColumn]?.toString() || '';
            return table.matchTerms.split(',')
              .some(term => cellValue.includes(term.trim()));
          });
          
          if (filteredData.length > 0) {
            const newWorkbook = XLSX.utils.book_new();
            const newSheet = XLSX.utils.json_to_sheet(filteredData);
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, table.name);
            const excelData = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
            zip.file(`${table.name}.xlsx`, excelData);
          }
          
          processedSheets++;
          this.progress = Math.floor((processedSheets / this.config.tables.length) * 100);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, '分类结果.zip');
        this.progress = 100;
      } catch (error) {
        console.error('处理Excel出错:', error);
        alert('处理Excel时出错: ' + error.message);
      }
    }
  }
}
</script>
