// src/components/HotspotEditable.tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls, useTexture } from '@react-three/drei';
import { useTourStore } from '../store/useTourStore';
import * as THREE from 'three';
import { SVG_URLS } from './Hotspot';

export default function HotspotEditable({ datos }: { datos: any }) {
    const updatePos = useTourStore(state => state.actualizarPosicionHotspot);
    const { hotspotSeleccionadoId, setHotspotSeleccionadoId } = useTourStore();
    const esSeleccionado = hotspotSeleccionadoId === datos.id;

    const iconoRef = useRef<THREE.Mesh>(null);
    const iconTex = useTexture(SVG_URLS[datos.tipo] || SVG_URLS.drone);
    iconTex.colorSpace = THREE.SRGBColorSpace;

    // Mismo tratamiento visual que el hotspot normal (Hotspot.tsx): pegado a la
    // superficie de la esfera, a 495u. Así el ícono no "salta" al seleccionarlo.
    const pos = useMemo(() =>
        new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z).normalize().multiplyScalar(495),
    [datos.posicion.x, datos.posicion.y, datos.posicion.z]);

    useFrame(() => {
        if (iconoRef.current) iconoRef.current.lookAt(0, 0, 0);
    });

    // El mismo ícono grande (25x25) que ve el visitante normal, en vez de una
    // esfera de alambre diminuta: mucho más fácil de ver y de darle clic.
    const icono = (
        <group>
            {esSeleccionado && (
                <mesh renderOrder={1}>
                    <ringGeometry args={[16, 19, 32]} />
                    <meshBasicMaterial color="#4a90e2" transparent opacity={0.9} depthTest={false} side={THREE.DoubleSide} />
                </mesh>
            )}
            <mesh
                ref={iconoRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setHotspotSeleccionadoId(datos.id);
                }}
            >
                <planeGeometry args={[25, 25]} />
                <meshBasicMaterial map={iconTex} transparent depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );

    // Sin seleccionar: solo el ícono, SIN gizmo de mover encima (antes se mostraba
    // siempre, para todos los hotspots a la vez, y tapaba el clic de todos).
    if (!esSeleccionado) {
        return <group position={pos}>{icono}</group>;
    }

    return (
        <TransformControls
            mode="translate"
            position={pos}
            onMouseUp={(e: any) => {
                if (!e?.target?.object) return;
                // 🎯 Normalización: el punto siempre queda a 450u de distancia
                // (pegado a la esfera) sin importar qué tan lejos se arrastre.
                const p = e.target.object.position;
                const vector = new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(450);
                updatePos(datos.id, Math.round(vector.x), Math.round(vector.y), Math.round(vector.z));
                e.target.object.position.set(vector.x, vector.y, vector.z);
            }}
        >
            {icono}
        </TransformControls>
    );
}
