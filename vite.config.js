import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'framer-motion': path.resolve(__dirname, 'src/shims/framer-motion.js'),
      'lucide-react': path.resolve(__dirname, 'src/shims/lucide-react.js'),
      'qrcode.react': path.resolve(__dirname, 'src/shims/qrcode.react.js'),
      'react-intersection-observer': path.resolve(__dirname, 'src/shims/react-intersection-observer.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
