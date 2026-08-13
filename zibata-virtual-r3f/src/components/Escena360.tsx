// src/components/Escena360.tsx
import { useEffect, useRef, lazy, useMemo, Suspense } from 'react';
import { useTourStore, CATEGORIA_VISTA_AEREA, categoriaFiltrableDeHotspot } from '../store/useTourStore';
import Hotspot from './Hotspot';
import Label from './Label';
import EsferaProgresiva from './EsferaProgresiva';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 🚨 Lazy: solo se usan en modo admin (arrastrar hotspots/labels con TransformControls).
// Un visitante normal nunca los descarga.
const HotspotEditable = lazy(() => import('./HotspotEditable'));
const LabelEditable = lazy(() => import('./LabelEditable'));
const ZonaEditable = lazy(() => import('./ZonaEditable'));
const ZonaDibujoOverlay = lazy(() => import('./ZonaDibujoOverlay'));
// Zona (vista normal) SÍ la usan todos los visitantes que pasen por un nodo con zonas.
import Zona from './Zona';
// Retícula/marcadores de lote: solo en los 2 nodos de terreno (ver reticulaLotesConfig.ts).
// ReticulaLotes (contornos completos) es solo para calibrar en admin -> lazy, un visitante
// normal nunca la descarga. MarcadoresLotes (íconos) sí la ve el público -> no es lazy.
const ReticulaLotes = lazy(() => import('./ReticulaLotes'));
import MarcadoresLotes from './MarcadoresLotes';
import ContornosLotesPublico from './ContornosLotesPublico';
import { NODOS_CON_RETICULA } from '../data/reticulaLotesConfig';

function SincronizadorMinimapa({ offsetGrados = 0 }: { offsetGrados: number }) {
    const { camera } = useThree();
    const rotacionAnterior = useRef(0);
    const rotacionAcumulada = useRef(0);
    const vectorDireccion = useRef(new THREE.Vector3());

    useFrame(() => {
        camera.getWorldDirection(vectorDireccion.current);
        const rotacionActual = Math.atan2(vectorDireccion.current.x, vectorDireccion.current.z);
        let delta = rotacionActual - rotacionAnterior.current;

        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        rotacionAcumulada.current += delta;
        rotacionAnterior.current = rotacionActual;

        const offsetRadianes = offsetGrados * (Math.PI / 180);
        const rotacionFinal = rotacionAcumulada.current + offsetRadianes;

        document.documentElement.style.setProperty('--rotacion-gta', `${rotacionFinal}rad`);
    });
    return null;
}

export default function Escena360() {
    const {
        nodoActual,
        nodos,
        setFadeActivo,
        setIsTransitioning,
        mostrarElementos3D,
        adminPanelActivo,
        capturaAbierta,
        zonasActivas,
        categoriasHotspotOcultas,
        reticulaLotesVisible
    } = useTourStore();

    const infoNodo = nodos[nodoActual];
    // Ocultamos hotspots/labels mientras se encuadra/toma una captura, para que
    // la foto (y su previsualización en vivo) salga limpia, sin íconos.
    const mostrarElementosInteractivos = mostrarElementos3D && !capturaAbierta;

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeActivo(false);
            setIsTransitioning(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [nodoActual, setFadeActivo, setIsTransitioning]);

    // El filtro por categoría (Parques/Amenidades/Comercios/Accesos/Clusters/...) solo
    // aplica dentro de la vista exterior/aérea — fuera de ahí lo ignoramos aunque el
    // visitante haya ocultado alguna categoría, para no esconder hotspots "a escondidas"
    // en escenas donde no existe ningún control de filtro visible.
    const filtroActivo = infoNodo?.ui?.categoria === CATEGORIA_VISTA_AEREA && categoriasHotspotOcultas.size > 0;

    const hotspotsVisibles = useMemo(() => {
        if (!infoNodo?.hotspots) return infoNodo?.hotspots;
        if (!filtroActivo || adminPanelActivo === 'editorHotspots') return infoNodo.hotspots;
        return infoNodo.hotspots.filter((h: any) => {
            const categoria = categoriaFiltrableDeHotspot(nodos, h);
            return !categoria || !categoriasHotspotOcultas.has(categoria);
        });
    }, [infoNodo, nodos, filtroActivo, adminPanelActivo, categoriasHotspotOcultas]);

    const idsHotspotsVisibles = useMemo(
        () => new Set((hotspotsVisibles || []).map((h: any) => h.id)),
        [hotspotsVisibles]
    );

    // Las labels ancladas a un hotspot (hotspotId) se ocultan junto con él; las que no
    // están ligadas a ningún hotspot (texto decorativo suelto) nunca se filtran.
    const labelsVisibles = useMemo(() => {
        if (!infoNodo?.labels) return infoNodo?.labels;
        if (!filtroActivo || adminPanelActivo === 'editorLabels') return infoNodo.labels;
        return infoNodo.labels.filter((l: any) => !l.hotspotId || idsHotspotsVisibles.has(l.hotspotId));
    }, [infoNodo, filtroActivo, adminPanelActivo, idsHotspotsVisibles]);

    if (!infoNodo) return null;

    return (
        <group>
            <SincronizadorMinimapa offsetGrados={infoNodo.norteOffset || 0} />
            <EsferaProgresiva rutaBajaRes={infoNodo.archivoBlur || infoNodo.archivo} rutaAltaRes={infoNodo.archivo} />

            {/* EL SWAP MÁGICO DE HOTSPOTS (filtrados por categoría en la vista exterior) */}
            {mostrarElementosInteractivos && hotspotsVisibles?.map((hotspot: any, index: number) => (
                adminPanelActivo === 'editorHotspots'
                    ? <HotspotEditable key={`edit-hs-${hotspot.id || index}`} datos={hotspot} />
                    : <Hotspot key={`hotspot-${hotspot.id || index}`} datos={hotspot} />
            ))}

            {/* 🚨 EL NUEVO SWAP MÁGICO DE LABELS */}
            {mostrarElementosInteractivos && labelsVisibles?.map((label: any, index: number) => (
                adminPanelActivo === 'editorLabels'
                    ? <LabelEditable key={`edit-lbl-${label.id || index}`} datos={label} />
                    : <Label key={`label-${label.id || index}`} datos={label} />
            ))}

            {/* ZONAS: regiones (polígonos) clicables sobre la esfera. En modo admin siempre
                se ven (para poder editarlas); para el visitante empiezan apagadas y se
                activan con el botón "Activar Zonas" del overlay. */}
            {mostrarElementosInteractivos && infoNodo.zonas?.map((zona: any, index: number) => {
                if (adminPanelActivo === 'editorZonas') {
                    return <ZonaEditable key={`edit-zn-${zona.id || index}`} datos={zona} />;
                }
                if (!zonasActivas) return null;
                return <Zona key={`zona-${zona.id || index}`} datos={zona} />;
            })}
            {adminPanelActivo === 'editorZonas' && <ZonaDibujoOverlay />}

            {/* RETÍCULA/MARCADORES DE LOTE: experimento reversible, solo en nodos de terreno.
                En el editor de admin se ven los CONTORNOS completos coloreados por
                disponibilidad (contra eso se calibra posición/giro/altura), sin importar el
                interruptor público. Fuera de ahí, el público ve el contorno discreto/uniforme
                de TODOS los lotes (contexto, no protagonista, no tocable) + los MARCADORES
                encima (ahí está toda la interacción) — juntos, no uno u otro. */}
            {mostrarElementosInteractivos && NODOS_CON_RETICULA[nodoActual] && (
                adminPanelActivo === 'editorReticula' ? (
                    <Suspense fallback={null}>
                        <ReticulaLotes />
                    </Suspense>
                ) : (
                    reticulaLotesVisible && (
                        <>
                            <ContornosLotesPublico />
                            <MarcadoresLotes />
                        </>
                    )
                )
            )}
        </group>
    );
}


