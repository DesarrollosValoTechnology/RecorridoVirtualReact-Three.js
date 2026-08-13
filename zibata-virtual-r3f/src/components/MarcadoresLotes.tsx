// src/components/MarcadoresLotes.tsx
//
// Vista PÚBLICA: un marcador chico por lote (el contorno completo, discreto y no-interactivo,
// lo pone ContornosLotesPublico.tsx aparte — ver encargo-ajuste-marcadores-recorrido360.md).
//
// El marcador es un <Html> (chip CSS + ícono), no un <mesh> con textura: el pedido es un
// tamaño VISIBLE constante en píxeles de pantalla (24-28px escritorio, 28-32 táctil) con un
// área de TOQUE más grande y desacoplada (44px) — eso es exactamente lo que CSS resuelve nativo
// (dos divs, uno grande invisible para el dedo/mouse y uno chico visible adentro) y lo que un
// plano en unidades de mundo no puede dar directamente, porque su tamaño en pantalla cambia con
// la distancia/FOV. El tamaño en sí vive en index.css (.marcador-lote-hit/.marcador-lote-chip).
//
// El problema real (158-220 lotes por nodo) sigue resuelto igual que antes, y no cambió:
// cada ~150ms se proyectan los centroides a píxeles de pantalla y se recorren ordenados por
// distancia a la cámara (más cerca primero, prioridad sin cambios); un lote se acepta solo si
// cae a más de cierto umbral de todos los ya aceptados.
//
// Ese umbral tiene HISTÉRESIS (encargo-afinacion-marcadores-recorrido360.md): un marcador que
// ya está visible necesita un hueco más chico (UMBRAL_DESAPARECER_PX) para seguir vivo del que
// necesitaría un marcador nuevo para aparecer (UMBRAL_APARECER_PX, mayor) — si no, uno justo en
// el límite prende y apaga solo con el vaivén normal de la cámara.
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import {
    ajusteReticulaPorDefecto,
    INTERVALO_RECALCULO_MARCADORES_S,
    INTERVALO_REINICIO_HISTERESIS_S,
    MAX_MARCADORES_VISIBLES,
    NODOS_CON_RETICULA,
    UMBRAL_APARECER_PX,
    UMBRAL_DESAPARECER_PX,
    URL_ICONO_LOTE_DISPONIBLE,
    URL_ICONO_LOTE_VENDIDO,
} from '../data/reticulaLotesConfig';
import { prepararLotesBase, useDisponibilidadDeNodo, useLotesDeNodo, type LotePreparadoBase } from '../utils/datosLotes';

const EJE_Y = new THREE.Vector3(0, 1, 0);

function LoteMarcador({ lote, inmueble }: { lote: LotePreparadoBase; inmueble: string }) {
    const [hover, setHover] = useState(false);
    const setLoteSeleccionado = useTourStore((s) => s.setLoteSeleccionado);
    const setPanelActivo = useTourStore((s) => s.setPanelActivo);
    const setTooltipLote = useTourStore((s) => s.setTooltipLote);

    const iconoUrl = lote.disponible ? URL_ICONO_LOTE_DISPONIBLE : URL_ICONO_LOTE_VENDIDO;

    const actualizarTooltip = (e: React.MouseEvent) => {
        setTooltipLote({ clave: lote.clave, disponible: lote.disponible, x: e.clientX, y: e.clientY });
    };

    return (
        <Html center position={lote.centroide} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
            <div
                className="marcador-lote-hit"
                onMouseEnter={(e) => { setHover(true); actualizarTooltip(e); }}
                onMouseMove={actualizarTooltip}
                onMouseLeave={() => { setHover(false); setTooltipLote(null); }}
                onClick={() => {
                    setHover(false);
                    setTooltipLote(null);
                    setLoteSeleccionado({ clave: lote.clave, inmueble, disponible: lote.disponible });
                    setPanelActivo('lote');
                }}
            >
                <div className={`marcador-lote-chip ${lote.disponible ? 'disponible' : 'no-disponible'} ${hover ? 'hover' : ''}`}>
                    <img src={iconoUrl} alt="" draggable={false} />
                </div>
            </div>
        </Html>
    );
}

export default function MarcadoresLotes() {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const ajustesReticula = useTourStore((state) => state.ajustesReticula);

    const config = NODOS_CON_RETICULA[nodoActual];
    const datos = useLotesDeNodo(config ? nodoActual : null);
    const disponibilidad = useDisponibilidadDeNodo(config ? nodoActual : null, config?.inmueble);
    const ajuste = ajustesReticula[nodoActual] ?? ajusteReticulaPorDefecto(nodoActual);

    // Lista estática (no depende de la cámara), ordenada por distancia ascendente — el orden
    // en que el paso de colisión, más abajo, decide prioridad.
    const candidatos = useMemo(() => {
        return prepararLotesBase(datos, ajuste, disponibilidad).sort((a, b) => a.distanciaCamara - b.distanciaCamara);
    }, [datos, ajuste.offsetX, ajuste.offsetZ, ajuste.alturaM, disponibilidad]);

    const yawRad = THREE.MathUtils.degToRad(ajuste.yawDeg);
    const [visibles, setVisibles] = useState<LotePreparadoBase[]>([]);
    const ultimoCalculo = useRef(-Infinity);
    const ultimoReinicioHisteresis = useRef(-Infinity);
    // Claves visibles en el cálculo anterior — la histéresis las compara contra un umbral más
    // laxo que a un candidato nuevo. Vive en un ref (no en el estado) porque useFrame corre
    // fuera del ciclo de render de React y necesita leer/escribir esto de forma síncrona,
    // cuadro a cuadro, sin esperar a que el componente se vuelva a renderizar.
    const clavesVisiblesPrevias = useRef<Set<string>>(new Set());

    useFrame(({ camera, size, clock }) => {
        if (clock.elapsedTime - ultimoCalculo.current < INTERVALO_RECALCULO_MARCADORES_S) return;
        ultimoCalculo.current = clock.elapsedTime;

        if (candidatos.length === 0) {
            if (visibles.length !== 0) setVisibles([]);
            clavesVisiblesPrevias.current = new Set();
            return;
        }

        // Reinicio periódico de la memoria de histéresis (ver la constante en
        // reticulaLotesConfig.ts): sin esto, cualquier par de lotes en la "zona gris" entre
        // los dos umbrales queda atrapado para siempre en cuanto la cámara lo roza una vez, y
        // con el tiempo eso deshace el descarte por colisión. Cada reinicio evalúa ese cuadro
        // entero con el umbral exigente, como si arrancara de cero.
        if (clock.elapsedTime - ultimoReinicioHisteresis.current > INTERVALO_REINICIO_HISTERESIS_S) {
            ultimoReinicioHisteresis.current = clock.elapsedTime;
            clavesVisiblesPrevias.current = new Set();
        }

        const aceptadosPx: { x: number; y: number }[] = [];
        const resultado: LotePreparadoBase[] = [];
        const vecProyeccion = new THREE.Vector3();

        for (const lote of candidatos) {
            // El grupo visual rota por el yaw vía <group rotation>; esta proyección es
            // aparte (fuera del scene graph), así que la rotación se aplica a mano sobre una
            // copia — el centroide guardado en `lote` sigue en espacio local sin rotar.
            vecProyeccion.copy(lote.centroide).applyAxisAngle(EJE_Y, yawRad);
            vecProyeccion.project(camera);

            if (vecProyeccion.z < -1 || vecProyeccion.z > 1) continue; // fuera del frustum de profundidad
            const sx = (vecProyeccion.x * 0.5 + 0.5) * size.width;
            const sy = (1 - (vecProyeccion.y * 0.5 + 0.5)) * size.height;
            if (sx < -60 || sx > size.width + 60 || sy < -60 || sy > size.height + 60) continue;

            // Histéresis: si este lote ya estaba visible, le basta el umbral laxo para seguir
            // vivo; si es nuevo, tiene que ganarse el umbral exigente para aparecer.
            const umbral = clavesVisiblesPrevias.current.has(lote.clave) ? UMBRAL_DESAPARECER_PX : UMBRAL_APARECER_PX;
            const choca = aceptadosPx.some((p) => Math.hypot(p.x - sx, p.y - sy) < umbral);
            if (choca) continue;

            aceptadosPx.push({ x: sx, y: sy });
            resultado.push(lote);
            if (resultado.length >= MAX_MARCADORES_VISIBLES) break;
        }

        clavesVisiblesPrevias.current = new Set(resultado.map((l) => l.clave));
        setVisibles(resultado);
    });

    if (!config || candidatos.length === 0) return null;

    return (
        <group rotation={[0, yawRad, 0]}>
            {visibles.map((lote) => (
                <LoteMarcador key={lote.clave} lote={lote} inmueble={config.inmueble} />
            ))}
        </group>
    );
}
