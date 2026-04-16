// src/components/LabelEditable.tsx
import { TransformControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';

export default function LabelEditable({ datos }: any) {
    const { labelSeleccionadoId, setLabelSeleccionadoId, actualizarPosicionLabel, idiomaActual } = useTourStore();
    const isSelected = labelSeleccionadoId === datos.id;

    // Lógica de texto (igual que el original)
    const textoPreview = idiomaActual === 'en' 
        ? (datos.texto_en || datos.texto_es) 
        : (datos.texto_es || datos.texto_en);

    const posTarget = new THREE.Vector3(datos.target.x, datos.target.y, datos.target.z);
    const offset = new THREE.Vector3(0, datos.offset?.y || 0, 0);
    const posEtiqueta = posTarget.clone().add(offset);

    return (
        <group>
            {/* Punto de anclaje editable */}
            <mesh 
                position={posTarget} 
                onClick={(e) => { e.stopPropagation(); setLabelSeleccionadoId(datos.id); }}
            >
            <sphereGeometry args={[isSelected ? 8 : 5, 16, 16]} />
                    <meshBasicMaterial 
                        // 🎨 Cambiamos el color: Morado si está seleccionado, un gris más claro si no.
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
                    // Obtenemos la nueva posición después de arrastrar
                    const { x, y, z } = e.target.object.position;
                    
                    // 🚨 LLAMAMOS A LA NUEVA FUNCIÓN
                    actualizarPosicionLabel(datos.id, x, y, z);
                }}
            />
            )}

            {/* También podemos cambiar el color de la línea (el poste) para que combine */}
            <Line 
                points={[posTarget, posEtiqueta]} 
                color={isSelected ? "#a855f7" : "#e2a74a"} // Morado si editamos, dorado si no.
                lineWidth={2} 
                transparent 
                opacity={0.5} 
                depthTest={false} 
            />
            
            <group position={posEtiqueta}>
                <Html center distanceFactor={15}>
                    <div style={{
                        padding: '5px 10px',
                        background: isSelected ? '#e2a74a' : 'rgba(0,0,0,0.8)',
                        color: isSelected ? 'black' : 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        border: '1px solid white',
                        fontWeight: 'bold'
                    }}>
                        {textoPreview}
                    </div>
                </Html>
            </group>
        </group>
    );
}