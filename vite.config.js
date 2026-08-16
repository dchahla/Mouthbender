import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the same build works both at the chahla.net subpath
  // (/assets/mouthbender/) and at the mouthbender.com root. An absolute base
  // would hardcode one and 404 on the other.
  base: './',
})
