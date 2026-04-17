// src/components/IndicadorFOV.tsx
import { useEffect, useState, useRef } from 'react';
import { useTourStore } from '../store/useTourStore';

// 🚨 CONFIGURACIÓN DE TU LENTE 
const FOV_MIN = 25;       
const FOV_MAX = 90;      
const FOV_INICIAL = 60;  

export default function IndicadorFOV() {
    const fovActual = useTourStore(state => state.fovActual);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // 📱 DETECTOR DE PANTALLA (Responsive)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        // Escuchamos si el usuario gira el teléfono o cambia el tamaño de la ventana
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setVisible(true);

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, 1500);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [fovActual]);

    // Matemáticas para saber qué tan llena va la barra y dónde poner la marca
    const porcentajeActual = ((fovActual - FOV_MIN) / (FOV_MAX - FOV_MIN)) * 100;
    const porcentajeInicial = ((FOV_INICIAL - FOV_MIN) / (FOV_MAX - FOV_MIN)) * 100;

    return (
        <div style={{
            position: 'absolute',
            // 🚨 LA MAGIA RESPONSIVA AQUÍ: 
            // Si es móvil, lo subimos a 190px para esquivar las redes sociales. 
            // Si es PC, lo dejamos en 120px.
            bottom: isMobile ? '190px' : '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(26, 26, 26, 0.75)', 
            backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            padding: '8px 16px',
            borderRadius: '20px',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease-out, bottom 0.3s ease', // Transición suave si giran el cel
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>
                    FOV {Math.round(fovActual)}°
                </span>
            </div>
            
            {/* CONTENEDOR DE LA BARRITA */}
            <div style={{ 
                position: 'relative', 
                width: '100px', 
                height: '4px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '2px'
            }}>
                {/* 1. LA BARRA VERDE DE PROGRESO */}
                <div style={{ 
                    width: `${Math.max(0, Math.min(porcentajeActual, 100))}%`, 
                    height: '100%', 
                    backgroundColor: '#5CB82A', 
                    borderRadius: '2px',
                    transition: 'width 0.1s linear'
                }} />

                {/* 2. EL PALITO VERTICAL (MARCA DE ORIGEN) */}
                <div style={{
                    position: 'absolute',
                    top: '-3px',       
                    bottom: '-3px',    
                    left: `${porcentajeInicial}%`, 
                    width: '2px',
                    backgroundColor: '#ffffff',
                    transform: 'translateX(-50%)', 
                    borderRadius: '1px',
                    boxShadow: '0 0 4px rgba(0,0,0,0.6)'
                }} />
            </div>
        </div>
    );
}