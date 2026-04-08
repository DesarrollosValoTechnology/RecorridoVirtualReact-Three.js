// src/components/Minimapa.tsx
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';

// Mapeamos los ID de tus nodos a posiciones X/Y (en porcentaje) sobre la imagen de tu mapa.
// Ajusta estos valores según la proporción de tu imagen real del plano de Zibatá.
const posicionesMapa: Record<string, { top: string, left: string }> = {
    "zibata": { top: '50%', left: '50%' },
    "jamadi": { top: '30%', left: '35%' },
    "discovery": { top: '75%', left: '60%' },
    "discoveryprincipal": { top: '77%', left: '62%' },
    "casa_club": { top: '40%', left: '80%' },
    "cancha_padel": { top: '45%', left: '85%' },
};

export default function Minimapa() {
    // Extraemos ambas cosas de Zustand: saber dónde estamos y la función para viajar
    const { nodoActual, setNodoActual } = useTourStore();

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '280px',
            height: '280px',
            backgroundColor: '#222',
            borderRadius: '50%', // Un mapa circular se ve súper limpio
            border: '4px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* Imagen de fondo del mapa maestro */}
            {/* 🚨 NOTA: Asegúrate de tener una imagen llamada "plano_zibata.jpg" en tu carpeta public/assets */}
            <img 
                src="/assets/plano_zibata.jpg" 
                alt="Plano general" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
            />

            {/* Dibujamos los pines iterando sobre nuestro diccionario de posiciones */}
            {Object.entries(posicionesMapa).map(([idNodo, posicion]) => {
                // Si el nodo no existe en nuestra base de datos tipada, lo saltamos
                if (!nodosTour[idNodo]) return null;
                
                // ¿Es este el nodo donde estamos parados actualmente?
                const isActive = idNodo === nodoActual;

                return (
                    <div 
                        key={`pin-${idNodo}`}
                        onClick={() => setNodoActual(idNodo)}
                        style={{
                            position: 'absolute',
                            top: posicion.top,
                            left: posicion.left,
                            width: isActive ? '18px' : '12px',
                            height: isActive ? '18px' : '12px',
                            backgroundColor: isActive ? '#00ff88' : '#ffffff',
                            border: '2px solid #000',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Animación de rebote suave
                            boxShadow: isActive ? '0 0 15px #00ff88' : '0 2px 5px rgba(0,0,0,0.5)',
                            zIndex: isActive ? 2 : 1
                        }}
                        // El tooltip nativo del navegador para saber qué es cada punto
                        title={nodosTour[idNodo].ui?.titulo || "Punto de interés"}
                    />
                );
            })}
        </div>
    );
}