// src/components/MapaBase.tsx
import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useTourStore } from '../store/useTourStore';

interface Props {
    esMinimapa?: boolean;
}

// 🚨 Rotación de alineación del plano nuevo: hay que ajustarla a ojo comparando
// contra el norte real del recorrido (el valor viejo, -58, era para el plano anterior).
const ROTACION_IMAGEN_MANUAL = 0;

// Zoom fijo del minimapa (ventana chica, centrada en el nodo): más alto = ves menos
// área alrededor del punto. Ajustar a ojo.
const ZOOM_MINIMAPA = 4.5;
// Multiplicador sobre el "zoom que muestra el plano completo" para el panel grande
// (mismo espíritu del "+0.08" que tenía el código viejo, para matar bordes vacíos).
const ZOOM_PANEL_FACTOR = 1.15;

const DZI_URL = '/Assets/mapa-dzi/plano.dzi';

export default function MapaBase({ esMinimapa = false }: Props) {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const nodos = useTourStore((state) => state.nodos);
    const infoNodo = nodos[nodoActual];

    const posX = infoNodo?.mapaX ?? 50;
    const posY = infoNodo?.mapaY ?? 50;

    const elementoRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
    const marcadorElRef = useRef<HTMLDivElement | null>(null);

    // En móvil el minimapa vive chico para no estorbar; al tocarlo se expande al
    // tamaño normal unos segundos y luego se vuelve a encoger solo.
    const [expandidoMovil, setExpandidoMovil] = useState(false);
    const timeoutExpandidoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const alTocarMinimapa = () => {
        if (!esMinimapa) return;
        setExpandidoMovil(true);
        if (timeoutExpandidoRef.current) clearTimeout(timeoutExpandidoRef.current);
        timeoutExpandidoRef.current = setTimeout(() => setExpandidoMovil(false), 3000);
    };

    useEffect(() => {
        return () => {
            if (timeoutExpandidoRef.current) clearTimeout(timeoutExpandidoRef.current);
        };
    }, []);

    // Crea el visor una sola vez (por instancia del componente: minimapa y panel
    // grande son montajes separados, cada uno con su propio OpenSeadragon.Viewer).
    useEffect(() => {
        if (!elementoRef.current) return;

        const viewer = OpenSeadragon({
            element: elementoRef.current,
            tileSources: DZI_URL,
            showNavigationControl: false,
            showZoomControl: false,
            showHomeControl: false,
            showFullPageControl: false,
            gestureSettingsMouse: { clickToZoom: false },
            mouseNavEnabled: !esMinimapa,
            panHorizontal: !esMinimapa,
            panVertical: !esMinimapa,
            minZoomLevel: esMinimapa ? ZOOM_MINIMAPA : 1,
            maxZoomLevel: 12,
            visibilityRatio: 1,
            constrainDuringPan: !esMinimapa,
            zoomPerScroll: 1.4,
            animationTime: 0.6,
            springStiffness: 8,
            autoResize: true,
        });

        viewerRef.current = viewer;
        if (esMinimapa) viewer.viewport.setRotation(ROTACION_IMAGEN_MANUAL, true);

        return () => {
            viewer.destroy();
            viewerRef.current = null;
            marcadorElRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [esMinimapa]);

    // Estilo GTA: Escena360.tsx (SincronizadorMinimapa) escribe cada frame hacia dónde
    // mira la cámara en la variable CSS --rotacion-gta (radianes). Acá la leemos con
    // el mismo ritmo y la aplicamos al visor, sumándole el offset manual de alineación.
    useEffect(() => {
        if (!esMinimapa) return;
        let frameId: number;
        let ultimoGrados: number | null = null;

        const sincronizar = () => {
            const viewer = viewerRef.current;
            if (viewer) {
                const crudo = getComputedStyle(document.documentElement).getPropertyValue('--rotacion-gta');
                const radianes = parseFloat(crudo) || 0;
                const grados = radianes * (180 / Math.PI) + ROTACION_IMAGEN_MANUAL;
                if (ultimoGrados === null || Math.abs(grados - ultimoGrados) > 0.05) {
                    viewer.viewport.setRotation(grados, true);
                    ultimoGrados = grados;
                }
            }
            frameId = requestAnimationFrame(sincronizar);
        };
        frameId = requestAnimationFrame(sincronizar);

        return () => cancelAnimationFrame(frameId);
    }, [esMinimapa]);

    // Centra/zoomea sobre la posición del nodo actual (y coloca el marcador verde
    // en modo panel) cada vez que cambia el nodo. Si el visor todavía no terminó de
    // abrir el .dzi, espera a su evento "open" antes de intentarlo.
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const centrarEnNodo = () => {
            const imagen = viewer.world.getItemAt(0);
            if (!imagen) return;

            const tamano = imagen.getContentSize();
            const puntoImagen = new OpenSeadragon.Point((posX / 100) * tamano.x, (posY / 100) * tamano.y);
            const puntoViewport = imagen.imageToViewportCoordinates(puntoImagen);

            if (esMinimapa) {
                viewer.viewport.zoomTo(ZOOM_MINIMAPA, undefined, true);
                viewer.viewport.panTo(puntoViewport, true);
            } else {
                const zoomInicial = viewer.viewport.getHomeZoom() * ZOOM_PANEL_FACTOR;
                viewer.viewport.zoomTo(zoomInicial, undefined, true);
                viewer.viewport.panTo(puntoViewport, true);

                if (marcadorElRef.current) viewer.removeOverlay(marcadorElRef.current);
                const el = document.createElement('div');
                el.className = 'marcador-panel-grande';
                el.innerHTML = '<div class="pulso-verde"></div>';
                marcadorElRef.current = el;
                viewer.addOverlay(el, puntoViewport, OpenSeadragon.Placement.CENTER);
            }
        };

        if (viewer.world.getItemCount() > 0) centrarEnNodo();
        else viewer.addOnceHandler('open', centrarEnNodo);
    }, [posX, posY, esMinimapa, nodoActual]);

    return (
        <div
            className={`contenedor-mapa ${esMinimapa ? 'modo-minimapa' : 'modo-panel'} ${expandidoMovil ? 'minimapa-expandido' : ''}`}
            onClick={alTocarMinimapa}
        >
            <div ref={elementoRef} style={{ width: '100%', height: '100%' }} />

            {/* CURSOR MODO MINIMAPA (La flecha estilo GTA, fija en el centro) */}
            {esMinimapa && (
                <div className="cursor-gta" style={{ zIndex: 1001, position: 'absolute' }}>
                    <svg
                        width="34" height="34" viewBox="0 0 24 24" fill="#5CB82A"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: 'rotate(0deg)', filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.6))' }}
                    >
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
