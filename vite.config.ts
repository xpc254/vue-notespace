import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // GitHub Pages 部署路径，仓库名为 vue-notespace
  base: process.env.NODE_ENV === 'production' ? '/notespace/' : '/',
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
