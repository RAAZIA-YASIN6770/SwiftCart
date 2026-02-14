import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimized for 60 FPS performance
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'physics': ['matter-js'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  
  // Fast HMR for development
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'matter-js', 'socket.io-client', 'three']
  },
  
  // Worker support for physics calculations
  worker: {
    format: 'es',
    plugins: []
  }
})
