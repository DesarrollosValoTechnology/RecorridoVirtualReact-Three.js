// src/components/Escena360.tsx
import { useEffect, useRef } from 'react';
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';
import Hotspot from './Hotspot'; 
import Label from './Label';
import EsferaProgresiva from './EsferaProgresiva'; 
import { useFrame, useThree } from '@react-three/fiber';
// 🚨 1. Asegúrate de importar THREE para poder usar vectores
import * as THREE from 'three'; 

// 🚨 2. EL ESPÍA DEFINITIVO (Brújula Vectorial + Anti-Matracas)
function SincronizadorMinimapa() {
    const { camera } = useThree();
    
    const rotacionAnterior = useRef(0);
    const rotacionAcumulada = useRef(0);
    // Guardamos un vector en memoria para no saturar la app a 60fps
    const vectorDireccion = useRef(new THREE.Vector3());

    useFrame(() => {
        // PASO A: Obtenemos el vector real hacia donde apunta el lente de la cámara
        camera.getWorldDirection(vectorDireccion.current);
        
        // PASO B: Usamos atan2 para sacar el ángulo exacto en el plano 2D (X y Z).
        // Esto IGNORA por completo si estás mirando al piso o al cielo. Solo saca el "Norte/Sur/Este/Oeste".
        const rotacionActual = Math.atan2(vectorDireccion.current.x, vectorDireccion.current.z);

        // PASO C: El Anti-Matracas (para que cuando dé la vuelta de 360 a 0, no se regrese)
        let delta = rotacionActual - rotacionAnterior.current;

        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        rotacionAcumulada.current += delta;
        rotacionAnterior.current = rotacionActual;

        // 🚨 OJO AQUÍ: Dependiendo de tu cámara 360, puede que el mapa gire al revés. 
        // Si gira al revés, simplemente ponle un signo menos: `${-rotacionAcumulada.current}rad`
        document.documentElement.style.setProperty('--rotacion-gta', `${rotacionAcumulada.current}rad`);
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
            {/* INVOCAMOS AL ESPÍA AQUÍ ADENTRO */}
            <SincronizadorMinimapa />

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