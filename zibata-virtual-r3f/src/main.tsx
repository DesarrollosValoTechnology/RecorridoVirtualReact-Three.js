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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
