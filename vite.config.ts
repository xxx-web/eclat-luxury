import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // React Compiler 通过 babel-plugin-react-compiler 自动启用
    tailwindcss(),
    // Bundle 可视化分析（运行 build 后生成报告）
    visualizer({
      filename: './dist/bundle-stats.html',
      open: false, // 设为 true 可在 build 后自动打开
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  // 构建优化
  build: {
    // 目标现代浏览器
    target: 'es2023',
    
    // 压缩优化（使用默认 esbuild，已内置）
    // minify: 'esbuild', // 注释掉，使用默认配置
    
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动分块（优化缓存策略）
        manualChunks: (id: string) => {
          // React 核心库（很少变化，长期缓存）
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          
          // 动画库（独立更新）
          if (id.includes('node_modules/framer-motion/')) {
            return 'motion';
          }
          
          // 图标库
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
        },
        
        // 文件命名规则
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // 启用/禁用 source map
    sourcemap: false, // 生产环境关闭
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 文件大小警告阈值（KB）
    chunkSizeWarningLimit: 1000,
  },
  
  // 开发服务器优化
  server: {
    hmr: {
      overlay: false, // 禁用错误遮罩（使用浏览器控制台）
    },
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true,
  },
})
