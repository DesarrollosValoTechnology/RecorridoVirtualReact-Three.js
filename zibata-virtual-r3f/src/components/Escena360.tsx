// src/components/Escena360.tsx
import { useEffect, useRef } from 'react';
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';
import Hotspot from './Hotspot'; 
import Label from './Label';
import EsferaProgresiva from './EsferaProgresiva'; 
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three'; 

// 🚨 1. Ahora el espía recibe el offset (en grados) que pones en nodos.ts
function SincronizadorMinimapa({ offsetGrados = 0 }: { offsetGrados: number }) {
    const { camera } = useThree();
    
    const rotacionAnterior = useRef(0);
    const rotacionAcumulada = useRef(0);
    const vectorDireccion = useRef(new THREE.Vector3());

    useFrame(() => {
        camera.getWorldDirection(vectorDireccion.current);
        const rotacionActual = Math.atan2(vectorDireccion.current.x, vectorDireccion.current.z);

        let delta = rotacionActual - rotacionAnterior.current;

        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        rotacionAcumulada.current += delta;
        rotacionAnterior.current = rotacionActual;

        // 🚨 2. LA MAGIA DE LA CALIBRACIÓN: 
        // Convertimos tus grados de nodos.ts a radianes y se lo sumamos a la brújula
        const offsetRadianes = offsetGrados * (Math.PI / 180);
        
        // NOTA: Si ves que gira al revés (cuando vas a la derecha el mapa va a la izq), 
        // ponle un signo menos al rotacionAcumulada.current
        const rotacionFinal = rotacionAcumulada.current + offsetRadianes;

        document.documentElement.style.setProperty('--rotacion-gta', `${rotacionFinal}rad`);
    });
    
    return null;
}

export default function Escena360() {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const setFadeActivo = useTourStore((state) => state.setFadeActivo);
    const setIsTransitioning = useTourStore((state) => state.setIsTransitioning);
    const mostrar = useTourStore(state => state.mostrarElementos3D);

    const infoNodo = nodosTour[nodoActual];

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeActivo(false);
            setIsTransitioning(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [nodoActual, setFadeActivo, setIsTransitioning]);

    return (
        <group>
            {/* 🚨 3. Le pasamos el valor de calibración al espía */}
            <SincronizadorMinimapa offsetGrados={infoNodo.norteOffset || 0} />

            <EsferaProgresiva 
                rutaBajaRes={infoNodo.archivoBlur || infoNodo.archivo} 
                rutaAltaRes={infoNodo.archivo} 
            />

            {mostrar && infoNodo.hotspots?.map((hotspot, index) => (
                <Hotspot key={`hotspot-${index}`} datos={hotspot} />
            ))}

            {mostrar && infoNodo.labels?.map((label, index) => (
                <Label key={`label-${index}`} datos={label} />
            ))}
        </group>
    );
}