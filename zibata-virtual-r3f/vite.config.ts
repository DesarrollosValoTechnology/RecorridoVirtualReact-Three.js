// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    build: {
        rollupOptions: {
            output: {
                // ✅ Fix: Usamos la sintaxis de función que TypeScript sí aprueba
                manualChunks(id) {
                    // Solo separamos el código que viene de librerías externas
                    if (id.includes('node_modules')) {
                        // Todo lo relacionado con 3D va a un solo archivo
                        if (id.includes('three') || id.includes('@react-three')) {
                            return 'vendor-three';
                        }
                        // La base de datos va a otro
                        if (id.includes('@supabase')) {
                            return 'vendor-supabase';
                        }
                        // El núcleo de React
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