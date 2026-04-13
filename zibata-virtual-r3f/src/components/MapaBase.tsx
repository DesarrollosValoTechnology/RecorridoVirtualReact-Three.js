// src/components/MapaBase.tsx
import { useState, useRef, useEffect } from 'react';
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';

interface Props {
    esMinimapa?: boolean;
}

export default function MapaBase({ esMinimapa = false }: Props) {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const infoNodo = nodosTour[nodoActual];

    const posX = infoNodo?.mapaX || 50; 
    const posY = infoNodo?.mapaY || 50;

    const [escala, setEscala] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [arrastrando, setArrastrando] = useState(false);
    
    const inicioDrag = useRef({ x: 0, y: 0 });
    const distanciaInicialRef = useRef<number | null>(null);

    useEffect(() => {
        setOffset({ x: 0, y: 0 });
        if (!esMinimapa) setEscala(1);
    }, [nodoActual, esMinimapa]);

    // Handlers de Mouse y Touch (mantenemos tu lógica que ya funcionaba)
    const iniciarArrastreMouse = (e: React.MouseEvent) => {
        if (esMinimapa) return;
        setArrastrando(true);
        inicioDrag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const arrastrarMouse = (e: React.MouseEvent) => {
        if (!arrastrando || esMinimapa) return;
        setOffset({ x: e.clientX - inicioDrag.current.x, y: e.clientY - inicioDrag.current.y });
    };

    const manejarTouchStart = (e: React.TouchEvent) => {
        if (esMinimapa) return;
        if (e.touches.length === 1) {
            setArrastrando(true);
            const touch = e.touches[0];
            inicioDrag.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
        } else if (e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            distanciaInicialRef.current = d;
        }
    };

    const manejarTouchMove = (e: React.TouchEvent) => {
        if (esMinimapa) return;
        if (e.touches.length === 1 && arrastrando) {
            const touch = e.touches[0];
            setOffset({ x: touch.clientX - inicioDrag.current.x, y: touch.clientY - inicioDrag.current.y });
        } else if (e.touches.length === 2 && distanciaInicialRef.current) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const factor = d / distanciaInicialRef.current;
            distanciaInicialRef.current = d;
            setEscala(prev => Math.min(Math.max(0.4, prev * factor), 4));
        }
    };

    return (
        <div 
            className={`contenedor-mapa ${esMinimapa ? 'modo-minimapa' : 'modo-panel'}`}
            onWheel={(e) => !esMinimapa && setEscala(prev => Math.min(Math.max(0.4, prev * (e.deltaY > 0 ? 0.9 : 1.1)), 4))}
            onMouseDown={iniciarArrastreMouse}
            onMouseMove={arrastrarMouse}
            onMouseUp={() => setArrastrando(false)}
            onMouseLeave={() => setArrastrando(false)}
            onTouchStart={manejarTouchStart}
            onTouchMove={manejarTouchMove}
            onTouchEnd={() => { setArrastrando(false); distanciaInicialRef.current = null; }}
            style={{ 
                cursor: arrastrando ? 'grabbing' : (esMinimapa ? 'default' : 'grab'),
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }} 
        >
            {/* CAPA DE ZOOM */}
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${esMinimapa ? 1 : escala})`, // Zoom del minimapa
                transition: arrastrando ? 'none' : 'transform 0.2s ease-out'
            }}>
                {/* CAPA DE POSICIÓN Y ROTACIÓN */}
                <div 
                    className="lienzo-transformable"
                    style={{
                        position: 'absolute',
                        width: '3000px', 
                        height: 'auto',
                        transform: `translate(calc(50% - ${posX}% + ${offset.x}px), calc(50% - ${posY}% + ${offset.y}px)) ${esMinimapa ? 'rotate(var(--rotacion-gta, 0rad))' : 'rotate(0rad)'}`,
                        transformOrigin: `${posX}% ${posY}%`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // 🚨 LE REGRESAMOS LA FLUIDEZ AQUÍ:
                        transition: arrastrando ? 'none' : 'transform 0.15s linear'
                    }}
                >
                    <img 
                        src="/Assets/zibata_plano.webp" 
                        alt="Plano" 
                        className="imagen-plano" 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                        draggable={false} 
                    />

                    {!esMinimapa && (
                        <div className="marcador-panel-grande" style={{ position: 'absolute', left: `${posX}%`, top: `${posY}%` }}>
                            <div className="pulso-verde"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* FLECHA DE NAVEGACIÓN ESTILO GPS */}
            {esMinimapa && (
                <div className="cursor-gta">
                    <svg 
                        width="34" 
                        height="34" 
                        viewBox="0 0 24 24" 
                        fill="#5CB82A"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ 
                            // 🚨 LA CORRECCIÓN: El icono nativo apunta a la esquina superior derecha.
                            // Rotándolo -45 grados, lo forzamos a apuntar exactamente hacia arriba.
                            transform: 'rotate(0deg)', 
                            filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.6))'
                        }}
                    >
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                </div>
            )}
        </div>
    );
}