// src/components/Zona.tsx
import { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import { construirGeometriaZona, puntosALineaCerrada } from '../utils/geometriaZona';

export default function Zona({ datos }: { datos: any }) {
    const cargarNodo = useTourStore((state) => state.cargarNodo);
    const [hover, setHover] = useState(false);

    const geometria = useMemo(() => construirGeometriaZona(datos.puntos), [datos.puntos]);
    const contorno = useMemo(() => puntosALineaCerrada(datos.puntos), [datos.puntos]);

    if (!datos.puntos || datos.puntos.length < 3) return null;

    return (
        <group>
            <mesh
                geometry={geometria}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHover(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHover(false);
                    document.body.style.cursor = 'grab';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setHover(false);
                    document.body.style.cursor = 'grab';
                    cargarNodo(datos.destino);
                }}
            >
                <meshBasicMaterial
                    color={datos.color || '#5CB82A'}
                    transparent
                    opacity={hover ? 0.45 : 0.22}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <Line
                points={contorno}
                color={datos.color || '#5CB82A'}
                lineWidth={hover ? 3 : 2}
                transparent
                opacity={hover ? 0.9 : 0.55}
                depthTest={false}
            />
        </group>
    );
}
