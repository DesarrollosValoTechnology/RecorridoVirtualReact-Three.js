// src/components/PantallaCarga.tsx
import { useTourStore } from '../store/useTourStore';

export default function PantallaCarga() {
    const logoVisible = useTourStore((state) => state.logoVisible);
    const logoTranslucido = useTourStore((state) => state.logoTranslucido);
    
    return (
        <div 
            id="pantalla-carga-inicial" 
            style={{ 
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                // 🚨 TRANSICIÓN DE FONDO: De sólido (1) a translúcido (0.5)
                backgroundColor: logoTranslucido ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10001,
                
                // 🚨 TRANSICIÓN DE SALIDA TOTAL:
                opacity: logoVisible ? 1 : 0,
                visibility: logoVisible ? 'visible' : 'hidden',
                transition: 'background-color 2s ease, opacity 1.5s ease, visibility 1.5s ease',
                pointerEvents: logoVisible ? 'all' : 'none',
                backdropFilter: logoTranslucido ? 'blur(4px)' : 'none', // Opcional: un toque de desenfoque
            }}
        >
            <img 
                src="/Assets/zibata.png" 
                alt="Logo Zibatá" 
                style={{ 
                    width: '250px', 
                    marginBottom: '30px',
                    // El logo también puede hacerse un poco transparente si gustas
                    opacity: logoTranslucido ? 0.8 : 1,
                    transition: 'opacity 2s ease'
                }} 
            />
            <div className="spinner"></div>
        </div>
    );
}