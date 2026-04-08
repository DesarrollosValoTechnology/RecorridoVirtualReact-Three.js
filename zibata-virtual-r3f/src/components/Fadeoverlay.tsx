// src/components/FadeOverlay.tsx
import { useTourStore } from '../store/useTourStore';

export default function FadeOverlay() {
    const fadeActivo = useTourStore((state) => state.fadeActivo);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000000', // Negro puro
                zIndex: 9999,
                pointerEvents: fadeActivo ? 'all' : 'none',
                opacity: fadeActivo ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out' // 🚨 La clave de la suavidad
            }}
        />
    );
}