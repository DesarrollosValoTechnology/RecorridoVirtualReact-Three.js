// src/components/ReticulaLotes.tsx
//
// Vista de ADMIN: retícula de lotes completa (contorno + relleno tenue), geometría 3D
// acostada en el suelo. Es contra esto que se calibra posición/giro/altura en
// PanelEditorReticula.tsx — sin líneas no hay contra qué cuadrar. La vista pública ya no usa
// este componente: usa MarcadoresLotes.tsx (un ícono por lote, sin saturar la imagen). Ver
// encargo-marcadores-lotes-recorrido360.md y encargo-reticula-lotes-recorrido360.md.
//
// Puramente informativa para el admin: sin hover ni click (nada que "seleccionar" aquí, el
// ajuste se hace con los 4 controles numéricos del panel, no tocando lotes).
import { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import {
    ajusteReticulaPorDefecto,
    CLAVE_DISTANCIA_LEGIBLE_M,
    COLOR_DISPONIBLE,
    COLOR_NO_DISPONIBLE,
    CONTORNO_LOTE_GROSOR_PX,
    NODOS_CON_RETICULA,
} from '../data/reticulaLotesConfig';
import { construirGeometriaLotePlano } from '../utils/geometriaReticula';
import { prepararLotesBase, useDisponibilidadDeNodo, useLotesDeNodo, type LotePreparadoBase } from '../utils/datosLotes';

interface LotePreparado extends LotePreparadoBase {
    contorno: THREE.Vector3[];
    geometriaFill: THREE.BufferGeometry;
    mostrarClave: boolean;
}

function LoteContorno({ lote }: { lote: LotePreparado }) {
    const color = lote.disponible ? COLOR_DISPONIBLE : COLOR_NO_DISPONIBLE;

    return (
        <group>
            <mesh geometry={lote.geometriaFill}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.07}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* depthTest={false} + renderOrder: garantía explícita de que la línea se ve
                siempre encima de la esfera (aunque hoy nada la ocluye — ver encargo-
                visibilidad-reticula-recorrido360.md). lineWidth en píxeles de pantalla
                (drei <Line> usa Line2): a 1px, tramos casi paralelos a la vista quedaban por
                debajo de media cobertura de píxel y el antialiasing los borraba. */}
            <Line
                points={lote.contorno}
                color={color}
                lineWidth={CONTORNO_LOTE_GROSOR_PX}
                transparent
                opacity={0.85}
                depthTest={false}
                renderOrder={1}
            />
            {lote.mostrarClave && (
                <Html center position={lote.centroide} zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
                    <div className="reticula-clave-lote">{lote.clave}</div>
                </Html>
            )}
        </group>
    );
}

export default function ReticulaLotes() {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const ajustesReticula = useTourStore((state) => state.ajustesReticula);

    const config = NODOS_CON_RETICULA[nodoActual];
    const datos = useLotesDeNodo(config ? nodoActual : null);
    const disponibilidad = useDisponibilidadDeNodo(config ? nodoActual : null, config?.inmueble);
    const ajuste = ajustesReticula[nodoActual] ?? ajusteReticulaPorDefecto(nodoActual);

    const lotesPreparados = useMemo<LotePreparado[]>(() => {
        return prepararLotesBase(datos, ajuste, disponibilidad).map((base) => {
            const distanciaHorizontal = Math.hypot(base.centroide.x, base.centroide.z);
            return {
                ...base,
                contorno: [...base.vectores, base.vectores[0].clone()],
                geometriaFill: construirGeometriaLotePlano(base.vectores),
                mostrarClave: distanciaHorizontal < CLAVE_DISTANCIA_LEGIBLE_M,
            };
        });
    }, [datos, ajuste.offsetX, ajuste.offsetZ, ajuste.alturaM, disponibilidad]);

    if (!config || lotesPreparados.length === 0) return null;

    return (
        <group rotation={[0, THREE.MathUtils.degToRad(ajuste.yawDeg), 0]}>
            {lotesPreparados.map((lote) => (
                <LoteContorno key={lote.clave} lote={lote} />
            ))}
        </group>
    );
}
