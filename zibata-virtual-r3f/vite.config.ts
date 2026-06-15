import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './',

    build: {
        outDir: 'dist',
        emptyOutDir: true, 
        // 🚨 LA CURA: Cambiamos el nombre de la carpeta de JS para evitar el choque con tus imágenes
        assetsDir: 'app-scripts', 
        
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('three') || id.includes('@react-three')) {
                            return 'vendor-three';
                        }
                        if (id.includes('@supabase')) {
                            return 'vendor-supabase';
                        }
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                    }
                }
            },
        },
        assetsInlineLimit: 4096, 
    },

    preview: {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    },
});