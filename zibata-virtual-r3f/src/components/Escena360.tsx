//Escena360.tsx
import { useEffect } from 'react'; // 🚨 Agregamos useEffect
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';
import Hotspot from './Hotspot'; 
import Label from './Label';

export default function Escena360() {
    const nodoActual = useTourStore((state) => state.nodoActual);
    
    // Traemos las funciones para apagar el fade
    const setFadeActivo = useTourStore((state) => state.setFadeActivo);
    const setIsTransitioning = useTourStore((state) => state.setIsTransitioning);
    const mostrar = useTourStore(state => state.mostrarElementos3D);

    const infoNodo = nodosTour[nodoActual];

    // Drei pausa todo el componente aquí hasta que la textura termine de bajar
    const textura = useTexture(infoNodo.archivo);
    
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.wrapS = THREE.RepeatWrapping;
    textura.repeat.x = -1; 

    // 🚨 EL SECRETO: Este código solo se ejecuta CUANDO la textura anterior ya terminó de cargar
    useEffect(() => {
        // Le damos 250ms extra para que la GPU procese la textura y no se trabe
        const timer = setTimeout(() => {
            setFadeActivo(false);
            setIsTransitioning(false);
        }, 250);

        return () => clearTimeout(timer);
    }, [textura, setFadeActivo, setIsTransitioning]);

    return (
        <group>
            <mesh scale={[1, 1, 1]}> 
                <sphereGeometry args={[500, 60, 40]} />
                <meshBasicMaterial map={textura} side={THREE.DoubleSide} />
            </mesh>

            {mostrar && infoNodo.hotspots?.map((hotspot, index) => (
                <Hotspot key={`hotspot-${index}`} datos={hotspot} />
            ))}

            {mostrar && infoNodo.labels?.map((label, index) => (
                <Label key={`label-${index}`} datos={label} />
            ))}
        </group>
    );
}