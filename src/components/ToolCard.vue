<template>
  <div class="tool-card" @click="navigateToTool">
    <div class="icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
  </div>
</template>

<script>
export default {
  props: ['title', 'icon', 'component'],
  methods: {
    navigateToTool() {
      this.$router.push({ name: this.component })
    }
  }
}
</script>
