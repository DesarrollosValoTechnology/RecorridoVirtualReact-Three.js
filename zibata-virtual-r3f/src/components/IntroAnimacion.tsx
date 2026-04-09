// src/components/IntroAnimacion.tsx
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function IntroAnimacion() {
    const { camera, controls } = useThree();
    const isTransitioning = useTourStore(state => state.isTransitioning);
    
    const velocidadCaida = useRef(0.00001);
    const pseudoTarget = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        // Posición inicial del Tiny Planet
        camera.position.set(-1, 250, 0);
        (camera as THREE.PerspectiveCamera).fov = 140;
        camera.updateProjectionMatrix();
    }, [camera]);

    useFrame((_state, delta) => {
        if (!isTransitioning) return;

        const cam = camera as THREE.PerspectiveCamera;

        // Aceleración de la caída
        if (velocidadCaida.current < 0.004) {
            velocidadCaida.current += 0.00003; 
        }

        // 1. Mirada: Se desplaza suavemente hacia el horizonte (Eje X)
        pseudoTarget.current.lerp(new THREE.Vector3(100, 0, 0), velocidadCaida.current);
        
        // 2. Posición: Desciende hacia el centro de la escena
        cam.position.lerp(new THREE.Vector3(0, 0, 0.1), velocidadCaida.current);
        cam.lookAt(pseudoTarget.current);

        // 3. Zoom: El FOV pasa de 140 a 75
        let velocidadZoom = velocidadCaida.current * 2;
        if (Math.abs(cam.fov - 75) > 0.01) {
            cam.fov += (75 - cam.fov) * velocidadZoom;
            cam.updateProjectionMatrix();
        }

        // Sincronizar OrbitControls
        if (controls) {
            (controls as any).target.copy(pseudoTarget.current);
            (controls as any).update();
        }
    });

    // Asegurar el último frame perfecto al terminar la transición
    useEffect(() => {
        if (!isTransitioning && controls) {
            (controls as any).target.copy(pseudoTarget.current);
            (controls as any).update();
        }
    }, [isTransitioning, controls]);

    return null;
}