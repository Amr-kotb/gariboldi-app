import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/gariboldi-app/', // IMPORTANTE: usa '/' per GitHub Pages
  server: {
    port: 5173
  }
})