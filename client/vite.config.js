import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 7100,
        proxy: {
            '/api': 'http://localhost:7101'
        }
    },
    resolve: {
        alias: {
            'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
        },
    },
})
