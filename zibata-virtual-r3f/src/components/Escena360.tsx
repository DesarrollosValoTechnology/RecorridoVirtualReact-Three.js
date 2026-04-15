// src/components/Escena360.tsx
import { useEffect, useRef } from 'react';
import { useTourStore } from '../store/useTourStore';
// 🚨 1. ADIÓS al archivo estático:
// import { nodosTour } from '../data/nodos'; 
import Hotspot from './Hotspot'; 
import Label from './Label';
import EsferaProgresiva from './EsferaProgresiva'; 
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three'; 

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

        const offsetRadianes = offsetGrados * (Math.PI / 180);
        
        const rotacionFinal = rotacionAcumulada.current + offsetRadianes;

        document.documentElement.style.setProperty('--rotacion-gta', `${rotacionFinal}rad`);
    });
    
    return null;
}

export default function Escena360() {
    // 🚨 2. Extraemos 'nodos' directamente de la nube mediante tu store
    const { 
        nodoActual, 
        nodos, 
        setFadeActivo, 
        setIsTransitioning, 
        mostrarElementos3D 
    } = useTourStore();

    // 🚨 3. Leemos la info del nodo desde el objeto dinámico
    const infoNodo = nodos[nodoActual];

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeActivo(false);
            setIsTransitioning(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [nodoActual, setFadeActivo, setIsTransitioning]);

    // 🚨 PROTECCIÓN: Si la BD aún está procesando o el nodo no existe, no intentamos dibujar nada 3D para evitar crasheos
    if (!infoNodo) return null;

    return (
        <group>
            <SincronizadorMinimapa offsetGrados={infoNodo.norteOffset || 0} />

            <EsferaProgresiva 
                rutaBajaRes={infoNodo.archivoBlur || infoNodo.archivo} 
                rutaAltaRes={infoNodo.archivo} 
            />

            {mostrarElementos3D && infoNodo.hotspots?.map((hotspot: any, index: number) => (
                <Hotspot key={`hotspot-${index}`} datos={hotspot} />
            ))}

            {mostrarElementos3D && infoNodo.labels?.map((label: any, index: number) => (
                <Label key={`label-${index}`} datos={label} />
            ))}
        </group>
    );
}