import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  
  return {
    plugins: [react()],
    base: isBuild ? '/gariboldi-app/' : '/',
    server: {
      port: 5173,
      open: true
    }
  }
})