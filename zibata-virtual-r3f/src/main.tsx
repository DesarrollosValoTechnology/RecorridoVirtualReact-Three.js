import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'; // 🚨 SI NO ESTÁ ESTA LÍNEA, TU CSS NO EXISTE PARA EL PROYECTO

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
