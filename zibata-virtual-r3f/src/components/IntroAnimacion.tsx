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
    
    const velocidadCaida = useRef(0.00001);
    // 🚨 CAMBIO 1: Iniciamos el target un poco desplazado en Z
    // Esto le da a la cámara una "dirección" desde el segundo cero y evita el giro brusco
    const pseudoTarget = useRef(new THREE.Vector3(0, 0, 0.01));

    useEffect(() => {
        // Posicionamos la cámara en lo alto
        camera.position.set(-0.001, 250, 0.001);
        (camera as THREE.PerspectiveCamera).fov = 140;
        camera.updateProjectionMatrix();

        // 🚨 CAMBIO 2: SINCRONIZACIÓN INSTANTÁNEA
        // Obligamos a los controles y a la cámara a mirar el punto inicial 
        // ANTES de que empiece el primer frame de la animación.
        const ctrl = controls as unknown as IOrbitControls;
        if (ctrl && ctrl.target) {
            ctrl.target.copy(pseudoTarget.current);
            ctrl.update();
        } else {
            camera.lookAt(pseudoTarget.current);
        }
    }, [camera, controls]);

    useFrame((_state, delta) => {
        if (!isTransitioning) return;

        const cam = camera as THREE.PerspectiveCamera;
        const ajusteFPS = delta * 60;

        if (velocidadCaida.current < 0.004) {
            velocidadCaida.current += 0.00003 * ajusteFPS; 
        }

        const lerpFactor = velocidadCaida.current * ajusteFPS;

        // "Levantamos la cara" hacia el horizonte
        pseudoTarget.current.lerp(new THREE.Vector3(0, 0, 50), lerpFactor);
        
        // La cámara cae al centro
        cam.position.lerp(new THREE.Vector3(0, 0, 0), lerpFactor);

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