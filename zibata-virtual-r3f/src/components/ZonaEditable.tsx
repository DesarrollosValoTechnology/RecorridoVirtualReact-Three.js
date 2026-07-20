// src/components/ZonaEditable.tsx
import { useMemo } from 'react';
import { TransformControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import { construirGeometriaZona, puntosALineaCerrada, RADIO_ZONA } from '../utils/geometriaZona';

export default function ZonaEditable({ datos }: { datos: any }) {
    const {
        zonaSeleccionadaId, setZonaSeleccionadaId,
        verticeZonaSeleccionado, setVerticeZonaSeleccionado,
        actualizarVerticeZona,
    } = useTourStore();

    const esSeleccionada = zonaSeleccionadaId === datos.id;

    const geometria = useMemo(() => construirGeometriaZona(datos.puntos), [datos.puntos]);
    const contorno = useMemo(() => puntosALineaCerrada(datos.puntos), [datos.puntos]);

    if (!datos.puntos || datos.puntos.length < 3) return null;

    const verticePos = esSeleccionada && verticeZonaSeleccionado !== null
        ? new THREE.Vector3(
            datos.puntos[verticeZonaSeleccionado].x,
            datos.puntos[verticeZonaSeleccionado].y,
            datos.puntos[verticeZonaSeleccionado].z
        ).normalize().multiplyScalar(RADIO_ZONA)
        : null;

    return (
        <group>
            {/* Relleno: clic la selecciona para editar */}
            <mesh
                geometry={geometria}
                onClick={(e) => {
                    e.stopPropagation();
                    setZonaSeleccionadaId(datos.id);
                    setVerticeZonaSeleccionado(null);
                }}
            >
                <meshBasicMaterial
                    color={datos.color || '#5CB82A'}
                    transparent
                    opacity={esSeleccionada ? 0.4 : 0.18}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <Line
                points={contorno}
                color={esSeleccionada ? '#ffffff' : (datos.color || '#5CB82A')}
                lineWidth={esSeleccionada ? 3 : 2}
                depthTest={false}
            />

            {/* Vértices: solo se muestran (y son arrastrables) cuando la zona está seleccionada */}
            {esSeleccionada && datos.puntos.map((p: any, i: number) => {
                const pos = new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(RADIO_ZONA);
                const esteSeleccionado = verticeZonaSeleccionado === i;
                return (
                    <mesh
                        key={i}
                        position={pos}
                        onClick={(e) => {
                            e.stopPropagation();
                            setVerticeZonaSeleccionado(i);
                        }}
                    >
                        <sphereGeometry args={[esteSeleccionado ? 7 : 4.5, 12, 12]} />
                        <meshBasicMaterial
                            color={esteSeleccionado ? '#4a90e2' : '#ffffff'}
                            depthTest={false}
                        />
                    </mesh>
                );
            })}

            {/* Cruceta de arrastre: solo sobre el vértice actualmente seleccionado */}
            {esSeleccionada && verticePos && verticeZonaSeleccionado !== null && (
                <TransformControls
                    mode="translate"
                    position={verticePos}
                    onMouseUp={(e: any) => {
                        if (!e?.target?.object) return;
                        const p = e.target.object.position;
                        const vector = new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(RADIO_ZONA);
                        actualizarVerticeZona(
                            datos.id,
                            verticeZonaSeleccionado,
                            Math.round(vector.x),
                            Math.round(vector.y),
                            Math.round(vector.z)
                        );
                        e.target.object.position.set(vector.x, vector.y, vector.z);
                    }}
                />
            )}
        </group>
    );
}
