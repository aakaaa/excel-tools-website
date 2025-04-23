<template>
  <div class="app">
    <h1>文件处理工具箱</h1>
    <div class="tool-grid">
      <ToolCard title="Excel分类工具" icon="📊" component="ExcelClassifier"/>
      <ToolCard title="Excel合并工具" icon="🔀" component="ExcelMerger"/>
      <ToolCard title="PDF工具" icon="📄" component="PdfTools"/>
      <ToolCard title="图片工具" icon="🖼️" component="ImageTools"/>
    </div>
    <router-view/>
  </div>
</template>

<script>
import ToolCard from './components/ToolCard.vue'

export default {
  components: { ToolCard }
}
</script>
