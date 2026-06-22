import { useState } from 'react';
import { CameraControls } from '@react-three/drei';

// Definimos los tipos para que TypeScript esté feliz
interface WaypointProps {
    posicion: [number, number, number];
    objetivoCámara: [number, number, number];
    controlsRef: React.MutableRefObject<CameraControls | null>;
}

export default function Waypoint({ posicion, objetivoCámara, controlsRef }: WaypointProps) {
    const [hovered, setHovered] = useState(false);

    const volarHaciaAqui = (e: any) => {
        // Evitamos que el clic traspase el aro y le dé a otra cosa por accidente
        e.stopPropagation(); 
        
        // Elevamos la cámara a 1.6m sobre la posición del waypoint
        controlsRef.current?.setLookAt(
            posicion[0], 1.6, posicion[2], 
            objetivoCámara[0], objetivoCámara[1], objetivoCámara[2], 
            true 
        );
    };

    return (
        <mesh 
            position={posicion} 
            rotation={[-Math.PI / 2, 0, 0]} // Acostado en el piso
            onClick={volarHaciaAqui}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                // Cambia el cursor a "manita" para indicar que es clickeable
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial 
                color={hovered ? "#00ffcc" : "#ffffff"} 
                transparent 
                opacity={0.8} 
            />
        </mesh>
    );
}