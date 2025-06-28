import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react', 
      'react-dom', 
      'recharts', 
      '@supabase/supabase-js',
      'i18next',
      'react-i18next'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    // Improve build performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          i18n: ['i18next', 'react-i18next'],
          icons: ['lucide-react'],
        },
      },
    },
    // Improve build speed
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Improve dev server performance
    hmr: {
      overlay: false,
    },
    // Optimize server
    fs: {
      strict: false,
    },
    // Increase timeout for slow connections
    hmrTimeout: 10000,
  },
  // Optimize asset handling
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  // Improve CSS handling
  css: {
    devSourcemap: false,
  },
  // Improve module resolution
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Improve dev experience
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});