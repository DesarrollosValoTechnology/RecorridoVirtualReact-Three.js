// src/components/LabelEditable.tsx
import { TransformControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function LabelEditable({ datos }: any) {
    const { labelSeleccionadoId, setLabelSeleccionadoId, actualizarPosicionLabel, idiomaActual } = useTourStore();
    const isSelected = labelSeleccionadoId === datos.id;

    const textoPreview = idiomaActual === 'en'
        ? (datos.texto_en || datos.texto_es)
        : (datos.texto_es || datos.texto_en);

    const posTarget   = new THREE.Vector3(datos.target.x, datos.target.y, datos.target.z);
    const offset      = new THREE.Vector3(0, datos.offset?.y || 0, 0);
    const posEtiqueta = posTarget.clone().add(offset);

    return (
        <group>
            {/* Punto de anclaje: solo visual + punto de arrastre del gizmo (cuando está
                seleccionado). Ya NO es clicable para seleccionar: al estar exactamente
                en la misma posición que su hotspot, competía por el clic con él. Ahora
                la única forma de seleccionar el label es haciéndole clic a su texto. */}
            <mesh position={posTarget}>
                <sphereGeometry args={[isSelected ? 8 : 5, 16, 16]} />
                <meshBasicMaterial
                    color={isSelected ? "#a855f7" : "#444"}
                    depthTest={false}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {isSelected && (
                <TransformControls
                    position={posTarget}
                    mode="translate"
                    onMouseUp={(e: any) => {
                        if (!e?.target?.object) return;
                        const pos = e.target.object.position;

                        // ✅ Fix: normalizamos a la superficie de la esfera (495u)
                        // igual que Label.tsx al renderizar, para que la posición
                        // en modo editor y en modo normal coincidan exactamente.
                        const vector = new THREE.Vector3(pos.x, pos.y, pos.z)
                            .normalize()
                            .multiplyScalar(495);

                        actualizarPosicionLabel(
                            datos.id,
                            Math.round(vector.x),
                            Math.round(vector.y),
                            Math.round(vector.z)
                        );

                        // Ajustamos visualmente el gizmo a la posición corregida
                        e.target.object.position.set(vector.x, vector.y, vector.z);
                    }}
                />
            )}

            <Line
                points={[posTarget, posEtiqueta]}
                color={isSelected ? "#a855f7" : "#e2a74a"}
                lineWidth={2}
                transparent
                opacity={0.5}
                depthTest={false}
            />

            <group position={posEtiqueta}>
                {/* Sin distanceFactor: a la distancia típica de estos hotspots (~450-500u)
                    ese escalado dejaba el texto microscópico e imposible de ver/clicar. */}
                <Html center zIndexRange={[100, 0]}>
                    {/* Clicable directamente en el texto: es un blanco más grande y,
                        al estar desplazado del hotspot (offset), no compite con su clic. */}
                    <div
                        onClick={() => setLabelSeleccionadoId(datos.id)}
                        style={{
                            padding: '5px 10px',
                            background: isSelected ? '#e2a74a' : 'rgba(0,0,0,0.8)',
                            color: isSelected ? 'black' : 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            border: '1px solid white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {textoPreview}
                    </div>
                </Html>
            </group>
        </group>
    );
}