import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg'],
  server: {
    watch: {
      // A background process rewrites .claude/launch.json frequently; Vite treats
      // any change under the project root as a full page reload, which was resetting
      // the in-progress chat state mid-typing. Ignore non-source dirs so only real
      // source edits trigger HMR.
      ignored: ['**/.claude/**', '**/.git/**', '**/node_modules/**'],
    },
  },
})
