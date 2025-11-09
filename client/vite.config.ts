import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    server: {
      host: true, // or '0.0.0.0'
      port: 8080, // Optional: set a fixed port
      strictPort: true, // Optional: fail if port is unavailable
    },
    preview: {
      host: true, // Also needed for 'npm run preview'
      port: 8080,
      strictPort: true,
    }
  }
})
