import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './',

    // Puerto FIJO y estricto, igual que AppZibata (5173) y el Portal de Ventas (5175).
    // Sin esto Vite arranca en 5173 y, si está ocupado, se mueve solo al siguiente — que es
    // el 5174 del backend. Cuando eso pasa, el error que sale no menciona puertos por ningún
    // lado y cuesta horas encontrarlo (ya pasó dos veces en este ecosistema).
    // strictPort hace que falle de frente en vez de moverse en silencio.
    server: {
        port: 5176,
        strictPort: true,
    },

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