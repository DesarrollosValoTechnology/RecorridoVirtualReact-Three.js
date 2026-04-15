// src/components/Label.tsx
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useTourStore } from '../store/useTourStore'; 
import { diccionario } from '../data/diccionario'; 

export default function Label({ datos }: any) {
    const { camera } = useThree();
    const idiomaActual = useTourStore((state) => state.idiomaActual);

    const htmlDivRef = useRef<HTMLDivElement>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const lineRef = useRef<any>(null!);

    // 1. Calculamos la posición del objetivo (donde apunta el palito)
    const posTargetReal = useMemo(() => 
        new THREE.Vector3(datos.target.x, datos.target.y, datos.target.z)
            .normalize()
            .multiplyScalar(495), 
    [datos.target]);

    // 2. Calculamos el offset desde la base de datos
    const offsetBase = useMemo(() => 
        new THREE.Vector3(datos.offset?.x || 0, datos.offset?.y || 0, datos.offset?.z || 0), 
    [datos.offset]);

    // 3. Posición inicial de la etiqueta
    const posInicialEtiqueta = useMemo(() => 
        posTargetReal.clone().add(offsetBase), 
    [posTargetReal, offsetBase]);

    useFrame(() => {
        const cam = camera as THREE.PerspectiveCamera;
        // 🚨 Protección: Evitamos cálculos con FOV extremo si la cámara aún no se posiciona
        const currentFov = THREE.MathUtils.clamp(cam.fov, 30, 150);
        
        // Escala del texto
        const scaleFactorText = Math.pow(currentFov / 75, 0.005); 
        const baseVisualScaleText = 0.5; 
        const finalScaleText = baseVisualScaleText * scaleFactorText;

        if (htmlDivRef.current && htmlDivRef.current.parentElement) {
            htmlDivRef.current.parentElement.style.transform = `translate(-50%, -50%) scale(${finalScaleText})`;
            htmlDivRef.current.parentElement.style.transformOrigin = 'center center';
        }

        // 4. Lógica del "palito" dinámico
        const factorLineaInverso = Math.pow(currentFov / 75, 3);
        const offsetDinamico = offsetBase.clone().multiplyScalar(factorLineaInverso);
        const posEtiquetaActual = posTargetReal.clone().add(offsetDinamico);

        if (groupRef.current) groupRef.current.position.copy(posEtiquetaActual);
        
        // 🚨 CORRECCIÓN: Aseguramos que la geometría se actualice incluso en saltos instantáneos (Modo Admin)
        if (lineRef.current && lineRef.current.geometry) {
            lineRef.current.geometry.setPositions([
                posTargetReal.x, posTargetReal.y, posTargetReal.z,
                posEtiquetaActual.x, posEtiquetaActual.y, posEtiquetaActual.z
            ]);
            // Forzamos a la línea a recalcular sus distancias para que no desaparezca
            lineRef.current.computeLineDistances();
        }
    });

    return (
        <group>
            {/* 5. La línea (palito) */}
            <Line 
                ref={lineRef}
                points={[posTargetReal, posInicialEtiqueta]} 
                color="white" 
                lineWidth={1.2}
                transparent={true}
                opacity={0.7}
                // 🚨 IMPORTANTE: depthTest en false evita que la esfera 360 tape la línea
                depthTest={false}
            />

            {/* 6. El contenedor del texto */}
            <group ref={groupRef} position={posInicialEtiqueta}>
                <Html center zIndexRange={[100, 0]} style={{ transformOrigin: 'center center', pointerEvents: 'none' }}>
                    <div ref={htmlDivRef} className="texto-informativo" style={{ transformOrigin: 'center center' }}>
                        {diccionario[idiomaActual]?.[datos.texto] || datos.texto}
                    </div>
                </Html>
            </group>
        </group>
    );
}