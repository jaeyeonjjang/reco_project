/**
 * vite.config.js
 * 목적: Vite 개발/빌드 설정 파일
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
