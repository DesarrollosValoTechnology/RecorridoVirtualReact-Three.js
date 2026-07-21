// src/components/Hotspot.tsx
import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export const TIPOS_HOTSPOT: { key: string; label: string }[] = [
    { key: 'flechas',            label: 'Flechas (Paso)' },
    { key: 'dron',                label: 'Dron (Aéreo)' },
    { key: 'portico',             label: 'Pórtico' },
    { key: 'discovery-center',    label: 'Discovery Center' },
    { key: 'anahuac',             label: 'Universidad Anáhuac' },
    { key: 'bbva-prox',           label: 'BBVA (Próximamente)' },
    { key: 'golf',                label: 'Golf' },
    { key: 'heb',                 label: 'HEB' },
    { key: 'walmart',             label: 'Walmart' },
    { key: 'parques',             label: 'Parques' },
    { key: 'plazas-comerciales',  label: 'Plazas Comerciales' },
];

export const SVG_URLS: Record<string, string> = Object.fromEntries(
    TIPOS_HOTSPOT.map(({ key }) => [key, `/Assets/Hotspots/${key}.svg`])
);

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

    // El ícono del hotspot ya no se elige por hotspot: se hereda del tipo del nodo destino.
    const tipoIcono = nodos[datos.destino]?.tipoIcono;
    const iconTex = useTexture(SVG_URLS[tipoIcono] || SVG_URLS.dron);
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