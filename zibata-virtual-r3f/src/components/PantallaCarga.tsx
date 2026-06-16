// src/components/PantallaCarga.tsx
import { useTourStore } from '../store/useTourStore';
import './PantallaCarga.css'; // 🚨 Conectamos los nuevos estilos

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
                backgroundColor: logoTranslucido ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10001,
                opacity: logoVisible ? 1 : 0,
                visibility: logoVisible ? 'visible' : 'hidden',
                transition: 'background-color 2s ease, opacity 1.5s ease, visibility 1.5s ease',
                pointerEvents: logoVisible ? 'all' : 'none',
                backdropFilter: logoTranslucido ? 'blur(4px)' : 'none',
            }}
        >
            <img 
                src="/Assets/logo_supraterra.png" 
                alt="Logo Supraterra" 
                style={{ 
                    width: '250px', 
                    marginBottom: '40px', // Le di un poco más de aire
                    opacity: logoTranslucido ? 0.8 : 1,
                    transition: 'opacity 2s ease'
                }} 
            />
            
            {/* 🚨 NUEVO: Contenedor del spinner y el texto */}
            <div 
                className="carga-indicador-container"
                style={{ 
                    opacity: logoTranslucido ? 0.3 : 1, 
                    transition: 'opacity 2s ease' 
                }}
            >
                <div className="spinner-elegante"></div>
                <p className="texto-carga">Preparando tu experiencia</p>
            </div>
        </div>
    );
}