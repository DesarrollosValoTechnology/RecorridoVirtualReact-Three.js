// src/components/Hotspot.tsx
import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

const ICONOS: Record<string, string> = {
    drone: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="black" stroke="white" stroke-width="1.5"/><g transform="translate(4.8, 4.8) scale(0.6)" fill="white" stroke="white" stroke-width="0.5"><path d="M10 10 7 7"/><path d="m10 14-3 3"/><path d="m14 10 3-3"/><path d="m14 14 3 3"/><path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/><path d="M19.637 14a4 4 0 1 1-5.432 5.868"/><path d="M4.367 10a4 4 0 1 1 5.438-5.862"/><path d="M9.795 19.862a4 4 0 1 1-5.429-5.873"/><rect x="10" y="8" width="4" height="8" rx="1"/></g></svg>`,
    casa:  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="black" stroke="white" stroke-width="1.5"/><g transform="translate(5, 5) scale(0.6)" fill="white" stroke="white" stroke-width="0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></g></svg>`,
    pasos: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="black" stroke="white" stroke-width="1.5"/><g transform="translate(4.8, 4.8) scale(0.6)" fill="white" stroke="white" stroke-width="0.5"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></g></svg>`,
    info:  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="black" stroke="white" stroke-width="1.5"/><g transform="translate(4.8, 4.8) scale(0.6)" fill="white" stroke="white" stroke-width="0.5"><circle cx="12" cy="12" r="10" fill="none" stroke-width="1.5"/><path d="M12 16v-4"/><path d="M12 8h.01" stroke-width="3"/></g></svg>`,
};

const SVG_URLS: Record<string, string> = {
    drone: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONOS.drone),
    casa:  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONOS.casa),
    pasos: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONOS.pasos),
    info:  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONOS.info),
};

Object.values(SVG_URLS).forEach(url => useTexture.preload(url));

export default function Hotspot({ datos }: any) {
    const iconoRef  = useRef<THREE.Mesh>(null);
    const anilloRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    
    // 🚨 REFERENCIA PARA EL TIMER DE PRECARGA
    const timerPrecarga = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cargarNodo      = useTourStore((state) => state.cargarNodo);
    const setTooltipHover = useTourStore((state) => state.setTooltipHover);
    const nodos           = useTourStore((state) => state.nodos);

    const iconTex = useTexture(SVG_URLS[datos.tipo] || SVG_URLS.drone);
    iconTex.colorSpace = THREE.SRGBColorSpace;

    const pos = new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z)
        .normalize()
        .multiplyScalar(495);

    const axesHelper  = useMemo(() => new THREE.AxesHelper(80), []);
    const targetScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

    // Limpieza del timer si el componente se desmonta de golpe
    useEffect(() => {
        return () => {
            if (timerPrecarga.current) clearTimeout(timerPrecarga.current);
        };
    }, []);

    useFrame((state) => {
        if (iconoRef.current)  iconoRef.current.lookAt(0, 0, 0);
        if (anilloRef.current) anilloRef.current.lookAt(0, 0, 0);

        if (anilloRef.current) {
            const tiempo = state.clock.elapsedTime % 1.5;
            const escala = 1.0 + tiempo * 1.5;
            anilloRef.current.scale.set(escala, escala, 1);
            (anilloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - tiempo / 1.5);
        }

        if (iconoRef.current) {
            const escalaObjetivo = hovered ? 1.15 : 1.0;
            targetScale.set(escalaObjetivo, escalaObjetivo, 1);
            iconoRef.current.scale.lerp(targetScale, 0.1);
        }
    });

    return (
        <group position={pos}>
            {datos.debug && <primitive object={axesHelper} />}

            <mesh ref={anilloRef}>
                <ringGeometry args={[10, 12, 32]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            <mesh
                ref={iconoRef}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.classList.add('sobre-hotspot');
                    document.body.style.cursor = 'pointer';

                    // 🚨 PRECARGA INTELIGENTE CON DEBOUNCE (300ms)
                    const urlDestino = nodos[datos.destino]?.archivo;
                    if (urlDestino) {
                        timerPrecarga.current = setTimeout(() => {
                            const img = new Image();
                            img.src = urlDestino;
                        }, 300);
                    }
                }}
                onPointerMove={(e) => {
                    e.stopPropagation();
                    const infoDestino = nodos[datos.destino]?.ui;
                    if (infoDestino) {
                        setTooltipHover({
                            titulo:    infoDestino.titulo,
                            miniatura: infoDestino.miniatura,
                            x: e.clientX,
                            y: e.clientY,
                        });
                    }
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.classList.remove('sobre-hotspot');
                    document.body.style.cursor = 'grab';
                    setTooltipHover(null);

                    // 🚨 CANCELAMOS LA PRECARGA SI QUITA EL MOUSE RÁPIDO
                    if (timerPrecarga.current) {
                        clearTimeout(timerPrecarga.current);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                    document.body.classList.remove('sobre-hotspot');
                    document.body.style.cursor = 'grab';
                    setTooltipHover(null);
                    
                    // 🚨 CANCELAMOS EL TIMER (ya vamos para allá, no hace falta que el timer siga)
                    if (timerPrecarga.current) clearTimeout(timerPrecarga.current);

                    // ✅ AQUÍ SE USA 'cargarNodo', adiós error TS6133
                    cargarNodo(datos.destino);
                }}
            >
                <planeGeometry args={[25, 25]} />
                <meshBasicMaterial map={iconTex} transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}