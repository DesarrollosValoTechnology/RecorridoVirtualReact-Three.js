// src/components/TooltipPreview.tsx
import { useTourStore } from '../store/useTourStore';

export default function TooltipPreview() {
    const tooltipHover = useTourStore(state => state.tooltipHover);

    // Si no hay nada en hover, no renderizamos nada
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
            zIndex: 9999, // Para que flote sobre todo
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none', // 🚨 Vital para que no interfiera con los clics
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