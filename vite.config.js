import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in build mode
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'react-reconciler/constants': path.resolve(__dirname, './src/shims/react-reconciler-constants.js'),
    },
  },
  server: {
    historyApiFallback: true,
  },
  build: {
    // Bundle optimization
    rollupOptions: {
      output: {
        // Chunk splitting strategy
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-ui': ['framer-motion', 'recharts'],
          'vendor-date': ['date-fns', '@internationalized/date'],
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Feature chunks
          'dashboards': [
            'src/components/dashboards/index.ts',
            'src/components/GenericDashboard.tsx'
          ],
          'three': ['@react-three/fiber', '@react-three/drei', 'three'],
        },
        // Naming convention for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '').replace('.jsx', '').replace('.js', '') : 
            'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Compress assets
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'es2020', // Modern browsers only for smaller bundles
    reportCompressedSize: false, // Disable compressed size reporting for faster builds
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      '@supabase/supabase-js',
      // Pre-bundle three.js stack to convert CommonJS -> ESM
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      'react-reconciler'
    ],
    // No exclusions – allow Vite to prebundle everything above
    exclude: []
  }
})
