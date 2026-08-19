import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* Port 5174 on purpose — the dashboard owns 5173 and must never be disturbed by
   this project. strictPort so a clash fails loudly instead of silently moving. */
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
})
