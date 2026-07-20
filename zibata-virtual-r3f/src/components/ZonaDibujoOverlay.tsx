// src/components/ZonaDibujoOverlay.tsx
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import { RADIO_ZONA } from '../utils/geometriaZona';

// Solo se monta mientras se está "dibujando" una zona nueva (store.dibujandoZona).
// Una esfera invisible pegada a la foto captura cada clic y lo agrega como vértice;
// mientras tanto se ve una vista previa (puntos + línea) de lo que llevas dibujado.
export default function ZonaDibujoOverlay() {
    const dibujandoZona = useTourStore((s) => s.dibujandoZona);
    const puntos = useTourStore((s) => s.puntosZonaEnProceso);
    const agregarPunto = useTourStore((s) => s.agregarPuntoZonaEnProceso);

    if (!dibujandoZona) return null;

    const vectores = puntos.map((p) =>
        new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(RADIO_ZONA)
    );

    return (
        <group>
            <mesh
                onClick={(e) => {
                    e.stopPropagation();
                    const punto = e.point.clone().normalize().multiplyScalar(RADIO_ZONA);
                    agregarPunto(Math.round(punto.x), Math.round(punto.y), Math.round(punto.z));
                }}
            >
                <sphereGeometry args={[499, 64, 48]} />
                <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
            </mesh>

            {vectores.map((v, i) => (
                <mesh key={i} position={v}>
                    <sphereGeometry args={[4.5, 12, 12]} />
                    <meshBasicMaterial color="#5CB82A" depthTest={false} />
                </mesh>
            ))}

            {vectores.length > 1 && (
                <Line points={vectores} color="#5CB82A" lineWidth={2} depthTest={false} />
            )}
        </group>
    );
}
