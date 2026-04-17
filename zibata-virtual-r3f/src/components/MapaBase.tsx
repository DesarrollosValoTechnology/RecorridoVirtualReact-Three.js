// src/components/MapaBase.tsx
import { useState, useRef, useEffect } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { useTourStore } from '../store/useTourStore';

interface Props {
    esMinimapa?: boolean;
}

const ROTACION_IMAGEN_MANUAL = -58;
// El tamaño "virtual" de nuestro plano. ¡No lo cambies!
const ANCHO_PLANO = 3000; 

export default function MapaBase({ esMinimapa = false }: Props) {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const nodos = useTourStore((state) => state.nodos);
    const infoNodo = nodos[nodoActual];

    const posX = infoNodo?.mapaX ?? 50;
    const posY = infoNodo?.mapaY ?? 50;

    // Calculamos la escala inicial para que el plano de 3000px quepa en la pantalla
    const calcularEscalaBase = () => {
        if (esMinimapa) return 0.25;
        // Asumimos que el panel ocupa un 80% del alto de la ventana
        const alturaPanel = window.innerHeight * 0.8; 
        // Dividimos la altura del panel entre el alto aprox de la imagen (3000px)
        // Le sumamos un "plus" (ej. 0.05) para hacer el ligero zoom que pediste y matar bordes blancos.
        return (alturaPanel / ANCHO_PLANO) + 0.08; 
    };

    const [escalaBase, setEscalaBase] = useState(calcularEscalaBase());
    const [escala, setEscala] = useState(escalaBase);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [arrastrando, setArrastrando] = useState(false);

    const inicioDrag = useRef({ x: 0, y: 0 });
    const distanciaInicialRef = useRef<number | null>(null);

    // Recalcular escala si cambian el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            const nuevaEscalaBase = calcularEscalaBase();
            setEscalaBase(nuevaEscalaBase);
            if (!esMinimapa) setEscala(nuevaEscalaBase);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [esMinimapa]);

    // Resetear al cambiar de nodo
    useEffect(() => {
        setOffset({ x: 0, y: 0 });
        if (!esMinimapa) setEscala(escalaBase);
    }, [nodoActual, esMinimapa, escalaBase]);

    const iniciarArrastreMouse = (e: MouseEvent) => {
        if (esMinimapa) return;
        setArrastrando(true);
        inicioDrag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const arrastrarMouse = (e: MouseEvent) => {
        if (!arrastrando || esMinimapa) return;
        setOffset({ x: e.clientX - inicioDrag.current.x, y: e.clientY - inicioDrag.current.y });
    };

    const manejarTouchStart = (e: TouchEvent) => {
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

    const manejarTouchMove = (e: TouchEvent) => {
        if (esMinimapa) return;
        if (e.touches.length === 1 && arrastrando) {
            const touch = e.touches[0];
            setOffset({ x: touch.clientX - inicioDrag.current.x, y: touch.clientY - inicioDrag.current.y });
        } else if (e.touches.length === 2 && distanciaInicialRef.current) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const factor = d / distanciaInicialRef.current;
            distanciaInicialRef.current = d;
            setEscala(prev => Math.min(Math.max(escalaBase, prev * factor), 4));
        }
    };

    return (
        <div
            className={`contenedor-mapa ${esMinimapa ? 'modo-minimapa' : 'modo-panel'}`}
            onWheel={(e) => {
                if (esMinimapa) return;
                setEscala(prev => Math.min(Math.max(escalaBase, prev * (e.deltaY > 0 ? 0.9 : 1.1)), 4));
            }}
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
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            {/* CAPA DE ZOOM (Aplica la escala dinámica) */}
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${escala})`,
                transition: arrastrando ? 'none' : 'transform 0.2s ease-out',
            }}>
                {/* CAPA DE POSICIÓN Y ROTACIÓN (Mantiene el tamaño virtual de 3000px) */}
                <div
                    className="lienzo-transformable"
                    style={{
                        position: 'absolute',
                        width: `${ANCHO_PLANO}px`,
                        height: 'auto',
                        // La magia original: centra el punto X,Y en la pantalla
                        transform: `translate(calc(50% - ${posX}% + ${offset.x / escala}px), calc(50% - ${posY}% + ${offset.y / escala}px))
                                    ${esMinimapa ? `rotate(calc(var(--rotacion-gta, 0rad) + ${ROTACION_IMAGEN_MANUAL}deg))` : 'rotate(0rad)'}`,
                        transformOrigin: `${posX}% ${posY}%`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: arrastrando ? 'none' : 'transform 0.15s linear',
                    }}
                >
                    <img
                        src="/Assets/zibata_plano.webp"
                        alt="Plano"
                        className="imagen-plano"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        draggable={false}
                    />

                    {/* CURSOR MODO PANEL (El punto verde) */}
                    {!esMinimapa && (
                        <div className="marcador-panel-grande" style={{ position: 'absolute', left: `${posX}%`, top: `${posY}%` }}>
                            <div className="pulso-verde"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* CURSOR MODO MINIMAPA (La flecha estilo GTA) */}
            {esMinimapa && (
                <div className="cursor-gta" style={{ zIndex: 1001, position: 'absolute' }}>
                    <svg
                        width="34" height="34" viewBox="0 0 24 24" fill="#5CB82A"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: 'rotate(0deg)', filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.6))' }}
                    >
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                </div>
            )}
        </div>
    );
}