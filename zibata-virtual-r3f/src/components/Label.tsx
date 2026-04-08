// src/components/Label.tsx
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useTourStore } from '../store/useTourStore'; // 🚨 Traemos el store
import { diccionario } from '../data/diccionario';   // 🚨 Traemos el diccionario

export default function Label({ datos }: any) {
    const { camera } = useThree();
    
    // 🚨 Leemos TU variable exacta del store 🚨
    const idiomaActual = useTourStore((state) => state.idiomaActual);

    // REFERENCIAS PARA ANIMACIÓN EN TIEMPO REAL
    const htmlDivRef = useRef<HTMLDivElement>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const lineRef = useRef<any>(null!);

    // ... (todo tu código de posTargetReal, offsetBase y posInicialEtiqueta queda igual) ...
    const posTargetReal = useMemo(() => new THREE.Vector3(datos.target.x, datos.target.y, datos.target.z).normalize().multiplyScalar(495), [datos.target]);
    const offsetBase = useMemo(() => new THREE.Vector3(datos.offset?.x || 0, datos.offset?.y || 0, datos.offset?.z || 0), [datos.offset]);
    const posInicialEtiqueta = useMemo(() => posTargetReal.clone().add(offsetBase), [posTargetReal, offsetBase]);

    // ... (todo tu código de useFrame queda igual) ...
    useFrame(() => {
        const cam = camera as THREE.PerspectiveCamera;
        const currentFov = cam.fov;
        
        const scaleFactorText = Math.pow(currentFov / 75, 0.005); 
        const baseVisualScaleText = 0.5; 
        const finalScaleText = baseVisualScaleText * scaleFactorText;

        if (htmlDivRef.current && htmlDivRef.current.parentElement) {
            htmlDivRef.current.parentElement.style.transform = `translate(-50%, -50%) scale(${finalScaleText})`;
            htmlDivRef.current.parentElement.style.transformOrigin = 'center center';
        }

        const factorLineaInverso = Math.pow(currentFov / 75, 3);
        const offsetDinamico = offsetBase.clone().multiplyScalar(factorLineaInverso);
        const posEtiquetaActual = posTargetReal.clone().add(offsetDinamico);

        if (groupRef.current) groupRef.current.position.copy(posEtiquetaActual);
        if (lineRef.current) {
            lineRef.current.geometry.setPositions([
                posTargetReal.x, posTargetReal.y, posTargetReal.z,
                posEtiquetaActual.x, posEtiquetaActual.y, posEtiquetaActual.z
            ]);
        }
    });

    return (
        <group>
            <Line 
                ref={lineRef}
                points={[posTargetReal, posInicialEtiqueta]} 
                color="white" 
                lineWidth={1.5}
                transparent={false}
                depthWrite={false}
            />

            <group ref={groupRef} position={posInicialEtiqueta}>
                <Html center zIndexRange={[100, 0]} style={{ transformOrigin: 'center center', pointerEvents: 'none' }}>
                    <div ref={htmlDivRef} className="texto-informativo" style={{ transformOrigin: 'center center' }}>
                        {/* 🚨 AQUÍ SUCEDE LA MAGIA DE LA TRADUCCIÓN 🚨 */}
                        {diccionario[idiomaActual]?.[datos.texto] || datos.texto}
                    </div>
                </Html>
            </group>
        </group>
    );
}