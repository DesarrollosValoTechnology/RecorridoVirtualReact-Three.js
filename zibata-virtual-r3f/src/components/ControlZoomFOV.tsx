// src/components/ControlZoomFOV.tsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function ControlZoomFOV() {
    const { camera, gl } = useThree();
    
    // Leemos el estado para no hacer zoom si hay un panel abierto
    const { isTransitioning, menuAbierto, panelActivo } = useTourStore();

    useEffect(() => {
        const canvas = gl.domElement;
        const cam = camera as THREE.PerspectiveCamera;
        let distanceStart = 0;

        // 💻 EVENTO PARA PC (Rueda del ratón)
        const handleWheel = (e: WheelEvent) => {
            if (isTransitioning || menuAbierto || panelActivo !== null) return;
            e.preventDefault(); // Evita que baje la página web
            
            cam.fov += e.deltaY * 0.05;
            
            // 🚨 AQUÍ ESTÁN LOS LÍMITES DE TU LENTE (FOV)
            // 25 = Zoom In súper de cerca | 100 = Zoom Out súper alejado
            cam.fov = Math.max(25, Math.min(cam.fov, 100)); 
            cam.updateProjectionMatrix();
        };

        // 📱 EVENTOS PARA MÓVIL (Pellizcar con dos dedos)
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
            cam.fov = Math.max(25, Math.min(cam.fov, 100)); 
            cam.updateProjectionMatrix();
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, [camera, gl, isTransitioning, menuAbierto, panelActivo]);

    return null;
}