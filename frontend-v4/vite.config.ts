import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Tenant resolution for the multi-deployment build. The build command sets
// VITE_TENANT (e.g. `VITE_TENANT=lacentral npm run build`) and the @tenant
// alias resolves to that folder so per-tenant assets, theme overrides, and
// config get baked into the bundle. Defaults to 'lottobook' for local dev.
const tenant = process.env.VITE_TENANT ?? 'lottobook'

// Inject the tenant's systemName into index.html as %VITE_APP_TITLE% so the
// browser tab uses the right product name. Vite substitutes %VITE_*% at
// build time. We parse the tenant's config.ts string (cheap) instead of
// importing it (would require TS loader at config-time).
import fs from 'fs'
let appTitle = tenant
try {
  const configSrc = fs.readFileSync(
    path.resolve(__dirname, `./src/themes/${tenant}/config.ts`), 'utf8')
  const m = configSrc.match(/systemName:\s*['"]([^'"]+)['"]/)
  if (m) appTitle = m[1]
} catch { /* fall back to tenant slug */ }
process.env.VITE_APP_TITLE = appTitle

// Copy the active tenant's favicon + staticwebapp.config.json to dist/.
// index.html keeps the static `/favicon.png` href and the SWA picks up the
// config at deploy time — the build swaps both files underneath per tenant
// so each deployment ships its own CSP and brand asset.
const tenantAssetsPlugin = {
  name: 'tenant-assets',
  closeBundle() {
    const tenantDir = path.resolve(__dirname, `./src/themes/${tenant}`)
    const distDir = path.resolve(__dirname, './dist')
    const copies: Array<[string, string]> = [
      [path.join(tenantDir, 'assets/favicon.png'), path.join(distDir, 'favicon.png')],
      [path.join(tenantDir, 'staticwebapp.config.json'), path.join(distDir, 'staticwebapp.config.json')],
    ]
    for (const [src, dest] of copies) {
      if (fs.existsSync(src)) fs.copyFileSync(src, dest)
    }
  },
}

export default defineConfig({
  plugins: [react(), tenantAssetsPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@config': path.resolve(__dirname, './src/config'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@features': path.resolve(__dirname, './src/features'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@tenant': path.resolve(__dirname, `./src/themes/${tenant}`),
    }
  },
  optimizeDeps: {
    include: [],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 4001,
    strictPort: true,
    host: '0.0.0.0',
    open: false, // Don't auto-open browser on server
    // Security: Only allow specific hosts (not "*")
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'lottobook.net',
      'www.lottobook.net',
      '88.223.95.55'
    ],
    hmr: {
      overlay: true,
      protocol: 'ws',
      timeout: 60000,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    proxy: {
      '/api': {
        target: 'https://lottery-api-prod.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        rewrite: (proxyPath: string) => proxyPath.replace(/^\/api/, '/api'),
      }
    }
  }
})
