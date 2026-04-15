// src/components/Minimapa.tsx
// NOTA: Este componente está deprecated. El minimapa activo es MapaBase con esMinimapa={true}.
// Se mantiene limpio por si se reactiva en el futuro.
import { useTourStore } from '../store/useTourStore';

export default function Minimapa() {
    // ✅ Todo proviene del store (Supabase) — sin archivo estático
    const { nodoActual, nodos, cargarNodo } = useTourStore();

    return (
        <div style={{
            position: 'absolute', bottom: '20px', right: '20px',
            width: '280px', height: '280px', backgroundColor: '#222',
            borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)',
            overflow: 'hidden', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
        }}>
            <img
                src="/Assets/zibata_plano.webp"
                alt="Plano general"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            />

            {/* Pines dinámicos: iteramos sobre los nodos cargados desde Supabase */}
            {Object.entries(nodos).map(([idNodo, info]: any) => {
                // Solo mostramos nodos que tengan posición en el plano
                if (info.mapaX === undefined || info.mapaY === undefined) return null;

                const isActive = idNodo === nodoActual;

                return (
                    <div
                        key={`pin-${idNodo}`}
                        onClick={() => cargarNodo(idNodo)}
                        title={info.ui?.titulo || 'Punto de interés'}
                        style={{
                            position: 'absolute',
                            top:  `${info.mapaY}%`,
                            left: `${info.mapaX}%`,
                            width:  isActive ? '18px' : '12px',
                            height: isActive ? '18px' : '12px',
                            backgroundColor: isActive ? '#00ff88' : '#ffffff',
                            border: '2px solid #000',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: isActive ? '0 0 15px #00ff88' : '0 2px 5px rgba(0,0,0,0.5)',
                            zIndex: isActive ? 2 : 1,
                        }}
                    />
                );
            })}
        </div>
    );
}