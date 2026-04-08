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
        camera.position.set(-1, 250, 0);
        (camera as THREE.PerspectiveCamera).fov = 140;
        camera.updateProjectionMatrix();
    }, [camera]); // Añadida la dependencia segura

    useFrame(() => {
        if (!isTransitioning) return;

        const cam = camera as THREE.PerspectiveCamera;

        if (velocidadCaida.current < 0.004) {
            velocidadCaida.current += 0.00003; 
        }

        pseudoTarget.current.lerp(new THREE.Vector3(100, 0, 0), velocidadCaida.current);
        cam.position.lerp(new THREE.Vector3(0, 0, 0.1), velocidadCaida.current);
        cam.lookAt(pseudoTarget.current);

        let velocidadZoom = velocidadCaida.current * 2;
        if (Math.abs(cam.fov - 75) > 0.01) {
            cam.fov += (75 - cam.fov) * velocidadZoom;
            cam.updateProjectionMatrix();
        }

        // 🚨 EL ARREGLO: Mantenemos informado al OrbitControls hacia dónde estamos mirando
        if (controls) {
            (controls as any).target.copy(pseudoTarget.current);
            (controls as any).update(); // Actualiza sus matemáticas internas sin dar saltos
        }
    });

    // 🚨 SEGURO DE VIDA: Justo en el milisegundo que termina la transición, 
    // aseguramos el último frame perfecto antes de entregarle el mando al usuario.
    useEffect(() => {
        if (!isTransitioning && controls) {
            (controls as any).target.copy(pseudoTarget.current);
            (controls as any).update();
        }
    }, [isTransitioning, controls]);

    return null;
}