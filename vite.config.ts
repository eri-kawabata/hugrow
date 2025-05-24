import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3005,
    host: true,
    strictPort: false,
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    },
  },
  build: {
    // チャンクサイズの最適化
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion', 'lucide-react'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts', 'react-circular-progressbar'],
        },
      },
    },
    // ソースマップを本番環境では無効化
    sourcemap: process.env.NODE_ENV === 'development',
    // 最小化を強化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
  },
});
