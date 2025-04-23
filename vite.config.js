import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  publicDir: 'public', 
  base: process.env.NODE_ENV === 'production' ? '/file-tools-website/' : '/',
  build: {
    outDir: 'docs'
  }
})
