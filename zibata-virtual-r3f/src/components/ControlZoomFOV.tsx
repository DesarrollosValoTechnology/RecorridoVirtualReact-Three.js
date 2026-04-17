// src/components/ControlZoomFOV.tsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function ControlZoomFOV() {
    const { camera, gl } = useThree();
    
    // 🚨 1. Extraemos setFovActual
    const { isTransitioning, menuAbierto, panelActivo, setFovActual } = useTourStore();

    useEffect(() => {
        const canvas = gl.domElement;
        const cam = camera as THREE.PerspectiveCamera;
        let distanceStart = 0;

        // 🚨 ELIMINA EL "PARCHE" QUE DECÍA if (cam.fov !== 60) ...
        // Deja que la IntroAnimacion.tsx maneje la cámara al principio.

        const handleWheel = (e: WheelEvent) => {
            if (isTransitioning || menuAbierto || panelActivo !== null) return;
            e.preventDefault(); 
            
            cam.fov += e.deltaY * 0.05;
            cam.fov = Math.max(25, Math.min(cam.fov, 90)); // Límite 90
            cam.updateProjectionMatrix();

            setFovActual(cam.fov);
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (isTransitioning || menuAbierto || panelActivo !== null || e.touches.length !== 2) return;
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            distanceStart = Math.sqrt(dx * dx + dy * dy);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isTransitioning || menuAbierto || panelActivo !== null || e.touches.length !== 2) return;
            e.preventDefault();
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const delta = distanceStart - distance;
            distanceStart = distance; 
            
            cam.fov += delta * 0.2;
            cam.fov = Math.max(25, Math.min(cam.fov, 90)); 
            cam.updateProjectionMatrix();

            // 🚨 3. Avisamos al Store en móvil también
            setFovActual(cam.fov);
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, [camera, gl, isTransitioning, menuAbierto, panelActivo, setFovActual]);

    return null;
}