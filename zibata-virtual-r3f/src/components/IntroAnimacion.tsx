// src/components/IntroAnimacion.tsx
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

// 🚨 SOLUCIÓN PUNTO 3: Creamos el "molde" exacto de OrbitControls
// Así TypeScript sabe perfectamente qué herramientas tiene disponibles
interface IOrbitControls {
    target: THREE.Vector3;
    update: () => void;
}

export default function IntroAnimacion() {
    const { camera, controls } = useThree();
    const isTransitioning = useTourStore(state => state.isTransitioning);
    
    const velocidadCaida = useRef(0.00001);
    const pseudoTarget = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        camera.position.set(-1, 250, 0);
        (camera as THREE.PerspectiveCamera).fov = 140;
        camera.updateProjectionMatrix();
    }, [camera]);

    useFrame((_state, delta) => {
        if (!isTransitioning) return;

        const cam = camera as THREE.PerspectiveCamera;

        // 🚨 EL ANTÍDOTO: Normalizamos el delta basado en 60 FPS
        // Si el monitor va a 60hz, ajusteFPS será 1. 
        // Si va a 144hz, será 0.4. Si va a 30hz, será 2.
        const ajusteFPS = delta * 60;

        // Multiplicamos nuestra aceleración por el ajuste
        if (velocidadCaida.current < 0.004) {
            velocidadCaida.current += 0.00003 * ajusteFPS; 
        }

        // Multiplicamos la fuerza del Lerp (Interpolación) por el ajuste
        const lerpFactor = velocidadCaida.current * ajusteFPS;

        pseudoTarget.current.lerp(new THREE.Vector3(100, 0, 0), lerpFactor);
        cam.position.lerp(new THREE.Vector3(0, 0, 0.1), lerpFactor);

        let velocidadZoom = velocidadCaida.current * 2 * ajusteFPS;
        if (Math.abs(cam.fov - 75) > 0.01) {
            cam.fov += (75 - cam.fov) * velocidadZoom;
            cam.updateProjectionMatrix();
        }

        const ctrl = controls as unknown as IOrbitControls;
        
        if (ctrl && ctrl.target) {
            ctrl.target.copy(pseudoTarget.current);
            ctrl.update();
        } else {
            cam.lookAt(pseudoTarget.current);
        }
    });

    useEffect(() => {
        const ctrl = controls as unknown as IOrbitControls;
        
        if (!isTransitioning && ctrl && ctrl.target) {
            ctrl.target.copy(pseudoTarget.current);
            ctrl.update();
        }
    }, [isTransitioning, controls]);

    return null;
}
