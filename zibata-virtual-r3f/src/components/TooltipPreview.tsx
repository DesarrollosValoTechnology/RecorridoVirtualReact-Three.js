// src/components/TooltipPreview.tsx
import { useEffect } from 'react';
import { useTourStore } from '../store/useTourStore';

export default function TooltipPreview() {
    const tooltipHover = useTourStore(state => state.tooltipHover);
    const setTooltipHover = useTourStore(state => state.setTooltipHover);

    // 🚨 EL CAZAFANTASMAS INCORPORADO (Versión Pacífica)
    useEffect(() => {
        if (!tooltipHover) return;

        const vigilarMouse = (e: MouseEvent) => {
            const elementoBajoMouse = e.target as HTMLElement;
            
            // 🚨 EXCEPCIÓN DE ORO: Si estamos tocando el mundo 3D (el canvas), 
            // nos salimos de la función inmediatamente y no borramos nada.
            if (elementoBajoMouse.closest('canvas')) {
                return;
            }
            
            // Si NO estamos en el mundo 3D, y NO estamos tocando un ícono del mapa, fulminamos el tooltip
            if (!elementoBajoMouse.closest('.icon-mapa')) {
                setTooltipHover(null);
            }
        };

        window.addEventListener('mousemove', vigilarMouse);
        return () => window.removeEventListener('mousemove', vigilarMouse);
    }, [tooltipHover, setTooltipHover]);

    if (!tooltipHover) return null;

    return (
        <div style={{
            position: 'fixed',
            left: `${tooltipHover.x + 20}px`,
            top: `${tooltipHover.y - 20}px`,
            width: '260px',
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px',
            color: 'white',
            zIndex: 9999, 
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
        }}>
            <img 
                src={tooltipHover.miniatura} 
                alt={tooltipHover.titulo} 
                style={{ width: '100%', borderRadius: '6px', objectFit: 'cover', aspectRatio: '16/9' }} 
            />
            <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>
                {tooltipHover.titulo}
            </span>
        </div>
    );
}