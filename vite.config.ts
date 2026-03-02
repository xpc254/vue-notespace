import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // GitHub Pages 部署路径，仓库名为 vue-notespace
  // 使用 history 模式时，base 配置仍然需要，用于正确加载静态资源
  base: process.env.NODE_ENV === 'production' ? '/notespace/' : '/',
  build: {
    outDir: 'notespace'
  },
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
