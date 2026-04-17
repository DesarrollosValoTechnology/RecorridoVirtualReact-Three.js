// src/components/IntroAnimacion.tsx
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

interface IOrbitControls {
    target: THREE.Vector3;
    update: () => void;
}

export default function IntroAnimacion() {
    const { camera, controls } = useThree();
    const isTransitioning = useTourStore(state => state.isTransitioning);
    
    // 🚀 DETECCIÓN DE ADMIN
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';

    const velocidadCaida = useRef(0.00001);
    const pseudoTarget = useRef(new THREE.Vector3(0, 0, 0.01));

    useEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        const ctrl = controls as unknown as IOrbitControls;

        if (isAdmin) {
            // 🎯 POSICIÓN INSTANTÁNEA PARA ADMIN
            cam.position.set(0, 0, 0);
            cam.fov = 60;
            pseudoTarget.current.set(0, 0, 50); // Mirando al frente
        } else {
            // 🚁 POSICIÓN INICIAL PARA EL TOUR (CIELO)
            cam.position.set(-0.001, 250, 0.001);
            cam.fov = 140;
        }

        cam.updateProjectionMatrix();

        if (ctrl && ctrl.target) {
            ctrl.target.copy(pseudoTarget.current);
            ctrl.update();
        } else {
            camera.lookAt(pseudoTarget.current);
        }
    }, [camera, controls, isAdmin]);

    useFrame((_state, delta) => {
        // Si no hay transición (o es Admin), no ejecutamos la lógica de caída
        if (!isTransitioning || isAdmin) return;

        const cam = camera as THREE.PerspectiveCamera;
        const ajusteFPS = delta * 60;

        if (velocidadCaida.current < 0.004) {
            velocidadCaida.current += 0.00003 * ajusteFPS; 
        }

        const lerpFactor = velocidadCaida.current * ajusteFPS;

        pseudoTarget.current.lerp(new THREE.Vector3(0, 0, 50), lerpFactor);
        cam.position.lerp(new THREE.Vector3(0, 0, 0), lerpFactor);

        let velocidadZoom = velocidadCaida.current * 2 * ajusteFPS;
        if (Math.abs(cam.fov - 60) > 0.01) {
            cam.fov += (60 - cam.fov) * velocidadZoom;
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
        
        // Finalización de la animación: fijar el target final
        if (!isTransitioning && ctrl && ctrl.target) {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const tinyDistance = 0.01;
            const newTarget = camera.position.clone().add(direction.multiplyScalar(tinyDistance));

            ctrl.target.copy(newTarget);
            ctrl.update();
        }
    }, [isTransitioning, controls, camera]);

    return null;
}