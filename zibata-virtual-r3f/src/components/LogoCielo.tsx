// src/components/LogoCielo.tsx
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

// Radio un poco menor al de la esfera panorámica (500) para que el logo quede "al frente"
const RADIO = 400;
// Qué tan arriba, en el cielo, vive el logo (0 = horizonte, 90° = justo en el cenit)
const ELEVACION = THREE.MathUtils.degToRad(30);
// Qué tan rápido "alcanza" el giro de la cámara cada frame (0-1: más alto = más rápido/menos retraso)
const VELOCIDAD_SEGUIMIENTO = 0.005;

const ANCHO = 420;
const ALTO = ANCHO * (1381 / 7468); // aspect ratio real de "Logo Z_Lo imposible posible.png"

export default function LogoCielo() {
    const { camera } = useThree();
    const mostrarElementos3D = useTourStore((state) => state.mostrarElementos3D);
    const texture = useTexture('/Assets/logo-cielo.webp');
    texture.colorSpace = THREE.SRGBColorSpace;

    const meshRef = useRef<THREE.Mesh>(null);
    const azimuthActual = useRef<number | null>(null);
    const direccionCamara = useRef(new THREE.Vector3());

    useFrame(() => {
        if (!meshRef.current) return;

        // Solo nos importa hacia dónde mira la cámara en el plano horizontal (yaw),
        // ignoramos si está viendo hacia arriba o abajo (pitch).
        camera.getWorldDirection(direccionCamara.current);
        const azimuthObjetivo = Math.atan2(direccionCamara.current.x, direccionCamara.current.z);

        if (azimuthActual.current === null) {
            azimuthActual.current = azimuthObjetivo;
        } else {
            // Diferencia angular más corta (evita el salto raro al cruzar +-180°)
            let diff = azimuthObjetivo - azimuthActual.current;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            azimuthActual.current += diff * VELOCIDAD_SEGUIMIENTO;
        }

        const radioHorizontal = RADIO * Math.cos(ELEVACION);
        const y = RADIO * Math.sin(ELEVACION);
        const x = radioHorizontal * Math.sin(azimuthActual.current);
        const z = radioHorizontal * Math.cos(azimuthActual.current);

        meshRef.current.position.set(x, y, z);
        meshRef.current.lookAt(0, 0, 0);
    });

    // Igual que hotspots/labels: solo aparece una vez que la intro terminó de mostrar la escena
    if (!mostrarElementos3D) return null;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[ANCHO, ALTO]} />
            <meshBasicMaterial map={texture} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}
