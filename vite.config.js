import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

// The official local D3 bundle is embedded in the isolated playground, never fetched from a CDN.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [
    vue(),
    {
      name: 'local-d3-runtime',
      resolveId(id) {
        if (id === 'virtual:d3-runtime') return '\0d3-runtime'
      },
      load(id) {
        if (id === '\0d3-runtime')
          return `export default ${JSON.stringify(readFileSync(new URL('./node_modules/d3/dist/d3.min.js', import.meta.url), 'utf8'))}`
      }
    }
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codemirror/lang-javascript') || id.includes('@lezer/javascript'))
            return 'javascript-language'
          if (id.includes('codemirror') || id.includes('@lezer')) return 'code-editor'
          if (id === '\0d3-runtime') return 'sandbox-d3'
        }
      }
    }
  }
})
