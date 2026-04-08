// src/components/Hotspot.tsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function Hotspot({ datos }: any) {
    // Referencias separadas para el punto y el aro
    const iconoRef = useRef<THREE.Mesh>(null);
    const anilloRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const cargarNodo = useTourStore((state) => state.cargarNodo);

    // Posición calculada (mismo vector que tenías)
    const pos = new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z).normalize().multiplyScalar(495);

    useFrame((state) => {
        // 1. Orientación hacia la cámara (lookAt)
        if (iconoRef.current) iconoRef.current.lookAt(0, 0, 0);
        if (anilloRef.current) anilloRef.current.lookAt(0, 0, 0);

        // 🚨 2. EFECTO RADAR (Anillo Exterior) 🚨
        if (anilloRef.current) {
            // El anillo crece y se desvanece cíclicamente (cada 1.5s)
            const tiempo = (state.clock.elapsedTime % 1.5);
            const escala = 1.0 + (tiempo * 1.5); // De 1.0 a 2.5
            anilloRef.current.scale.set(escala, escala, 1);
            
            // La opacidad va de 0.8 a 0
            (anilloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - (tiempo / 1.5));
        }

        // 3. EFECTO HOVER (Punto Interior)
        const escalaObjetivo = hovered ? 1.3 : 1.0;
        if (iconoRef.current) {
            iconoRef.current.scale.lerp(new THREE.Vector3(escalaObjetivo, escalaObjetivo, 1), 0.1);
        }
    });

    return (
        <group position={pos}>
            {/* 🚨 Mesh del Radar (Verde neón, animado por useFrame) */}
            <mesh ref={anilloRef}>
                <ringGeometry args={[10, 12, 32]} />
                <meshBasicMaterial 
                    color="#00ff88" 
                    transparent 
                    opacity={0.8} 
                    depthWrite={false} 
                    side={THREE.DoubleSide} 
                />
            </mesh>

            {/* Mesh del Punto Clicable (Blanco central) */}
            <mesh 
                ref={iconoRef}
                onPointerOver={(e) => {
                    e.stopPropagation(); // Importante
                    setHovered(true);
                    // Clase de CSS global para el cursor
                    document.body.classList.add('sobre-hotspot');
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.classList.remove('sobre-hotspot');
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                    document.body.classList.remove('sobre-hotspot');
                    cargarNodo(datos.destino);
                }}
            >
                {/* circleGeometry es perfecto para el punto central */}
                <circleGeometry args={[10, 32]} />
                <meshBasicMaterial 
                    color={hovered ? "#00ff88" : "white"} 
                    depthWrite={false} 
                    side={THREE.DoubleSide} 
                />
            </mesh>
        </group>
    );
}