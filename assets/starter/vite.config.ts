import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({base:process.env.BASE_PATH || '/', plugins: [react()], build: {outDir: 'website'}, server: {host: '127.0.0.1', port: 7410, strictPort: true}});
