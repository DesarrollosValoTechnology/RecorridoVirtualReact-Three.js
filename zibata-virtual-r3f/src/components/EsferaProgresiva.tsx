// src/components/EsferaProgresiva.tsx
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface Props {
    rutaBajaRes: string;
    rutaAltaRes: string;
}

export default function EsferaProgresiva({ rutaBajaRes, rutaAltaRes }: Props) {
    // 1. CARGA RELÁMPAGO: useTexture detiene el render solo lo que tarde en bajar la de 94KB
    const texturaBaja = useTexture(rutaBajaRes);
    texturaBaja.colorSpace = THREE.SRGBColorSpace;
    texturaBaja.wrapS = THREE.RepeatWrapping;
    texturaBaja.repeat.x = -1;
    // Filtros para que el pixeleado se vea como un desenfoque suave
    texturaBaja.minFilter = THREE.LinearFilter;
    texturaBaja.magFilter = THREE.LinearFilter;

    const [texturaAlta, setTexturaAlta] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        // Si cambiamos de nodo, empezamos de nuevo con la borrosa
        setTexturaAlta(null);
        let activo = true;

        // 2. CARGA SILENCIOSA: El TextureLoader nativo no bloquea el renderizado
        const loader = new THREE.TextureLoader();
        loader.load(rutaAltaRes, (t) => {
            if (activo) {
                t.colorSpace = THREE.SRGBColorSpace;
                t.wrapS = THREE.RepeatWrapping;
                t.repeat.x = -1;
                setTexturaAlta(t); // Aquí ocurre el "cambiazo" a HD
            }
        });

        return () => { activo = false; };
    }, [rutaAltaRes]);

    return (
        <mesh scale={[1, 1, 1]}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial 
                map={texturaAlta || texturaBaja} 
                side={THREE.DoubleSide} 
            />
        </mesh>
    );
}