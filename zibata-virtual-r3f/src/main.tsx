import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'; // 🚨 SI NO ESTÁ ESTA LÍNEA, TU CSS NO EXISTE PARA EL PROYECTO

// Bloquea el menú de clic derecho (evita "Guardar imagen como...", "Guardar video como...", etc.)
// Nota: esto es solo una fricción anti-copia casual, no una protección real del archivo.
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Evita arrastrar una imagen o el canvas 3D hacia el escritorio/otra pestaña para guardarla
document.addEventListener('dragstart', (e) => {
    const objetivo = e.target as HTMLElement;
    if (objetivo instanceof HTMLImageElement || objetivo instanceof HTMLCanvasElement) {
        e.preventDefault();
    }
});

// Cuando esta página se embebe en un iframe (ej. el kiosco de ventas), la app anfitriona
// pone su propia barra flotante encima del borde superior. Marcamos el <body> para que el
// CSS recorra hacia abajo el título/controles que viven ahí y no queden tapados.
const enIframe = typeof window !== 'undefined' && window.self !== window.top;
if (enIframe) {
    document.body.classList.add('en-iframe');
}

// Cachea localmente (Cache API) las fotos 360°/miniaturas del recorrido en la propia tablet,
// para que una segunda visita a la misma escena no vuelva a descargar el archivo completo.
// Ver public/sw.js para la estrategia (cache-first, seguro porque cada subida usa un nombre
// de archivo nuevo y aleatorio).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .catch((error) => console.error('No se pudo registrar el service worker de caché:', error));
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
