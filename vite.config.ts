import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    server: {
        host: '127.0.0.1',
        port: 5173
    },
    base: './', // important for electron files
})
