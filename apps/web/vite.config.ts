import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/',
    optimizeDeps: {
        include: ['@minions-openclaw/sdk'],
    },
    build: {
        commonjsOptions: {
            include: [/@minions-openclaw\/sdk/, /node_modules/],
        },
    },
});
