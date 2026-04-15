// src/components/HotspotEditable.tsx
import { TransformControls } from '@react-three/drei';
import { useTourStore } from '../store/useTourStore';
import * as THREE from 'three';

export default function HotspotEditable({ datos }: { datos: any }) {
    const updatePos = useTourStore(state => state.actualizarPosicionHotspot);
    const { hotspotSeleccionadoId, setHotspotSeleccionadoId } = useTourStore();
    const esSeleccionado = hotspotSeleccionadoId === datos.id;

    return (
        <TransformControls 
            mode="translate" 
            position={[datos.posicion.x, datos.posicion.y, datos.posicion.z]}
            // 🚨 CORRECCIÓN: Tipamos 'e' como 'any' y usamos optional chaining (?.)
            // En HotspotEditable.tsx (dentro de onMouseUp)
            onMouseUp={(e: any) => {
                if (e?.target?.object) {
                    // 🎯 MAGIA MATEMÁTICA: Normalización
                    // Esto hace que el punto siempre esté a 450 unidades de distancia (pegado a la esfera)
                    // sin importar qué tan lejos lo arrastres con la flecha.
                    const pos = e.target.object.position;
                    const vector = new THREE.Vector3(pos.x, pos.y, pos.z).normalize().multiplyScalar(450);
                    
                    // Guardamos la posición "corregida"
                    updatePos(datos.id, Math.round(vector.x), Math.round(vector.y), Math.round(vector.z));
                    
                    // Movemos el objeto visualmente a esa posición corregida
                    e.target.object.position.set(vector.x, vector.y, vector.z);
                }
            }}
        >
            <mesh 
            onClick={(e) => {
                e.stopPropagation(); // Evita que el clic "atraviese" y mueva la cámara
                setHotspotSeleccionadoId(datos.id);
            }}
        >
            <sphereGeometry args={[3, 16, 16]} />
            <meshBasicMaterial 
                color={esSeleccionado ? "#4a90e2" : "#ff00ff"} // Azul si está seleccionado
                wireframe 
            />
        </mesh>
        </TransformControls>
    );
}