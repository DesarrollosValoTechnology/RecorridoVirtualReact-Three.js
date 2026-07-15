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
                // Filtrado anisotrópico: reduce el aliasing/"grano" cuando la textura se ve
                // en ángulos muy cerrados respecto a la cámara (común cerca de los polos
                // de la esfera). 16 es un valor alto y seguro — Three.js lo recorta solo
                // al máximo real que soporte la GPU del dispositivo.
                t.anisotropy = 16;
                setTexturaAlta(t); // Aquí ocurre el "cambiazo" a HD
            }
        });

        return () => { activo = false; };
    }, [rutaAltaRes]);

    return (
        <mesh scale={[1, 1, 1]}>
            {/* 🚨 128x96 segmentos (antes 60x40): con pocos segmentos, cerca de los polos
                (nadir/cenit) la malla tiene triángulos grandes y toscos que exageran
                cualquier imperfección mínima del píxel en un patrón de "estrella" muy
                visible. Con más segmentos, esa misma imperfección se reparte suavemente. */}
            <sphereGeometry args={[500, 128, 96]} />
            <meshBasicMaterial
                map={texturaAlta || texturaBaja}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}