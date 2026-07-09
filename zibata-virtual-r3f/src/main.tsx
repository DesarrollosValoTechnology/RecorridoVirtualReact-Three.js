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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
