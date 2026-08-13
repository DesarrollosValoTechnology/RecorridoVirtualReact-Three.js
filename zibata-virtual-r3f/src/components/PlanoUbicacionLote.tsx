// src/components/PlanoUbicacionLote.tsx
//
// Plano chico del fraccionamiento con el lote elegido resaltado, dentro del panel de lote
// (PanelesOverlay.tsx) — para que la persona ubique dónde está lo que le interesa. Se dibuja en
// vivo como SVG a partir de los mismos polígonos que ya carga la retícula (useLotesDeNodo) más
// las áreas comunes (useAreasComunesDeNodo): nada de generar una imagen por lote — serían 378
// archivos que mantener y que se desincronizan en cuanto cambien los datos.
//
// Sin interactividad: es una referencia, no un segundo mapa clicable. No muestra disponibilidad
// de los demás lotes — solo el elegido se distingue, todos los otros van iguales. Ver
// encargo-plano-ubicacion-recorrido360.md.
import { useMemo } from 'react';
import { COLOR_DISPONIBLE, nodoIdPorInmueble } from '../data/reticulaLotesConfig';
import { useAreasComunesDeNodo, useLotesDeNodo } from '../utils/datosLotes';

interface Props {
    clave: string;
    inmueble: string;
    disponible: boolean;
}

// Paleta propia del plano — deliberadamente distinta de la retícula 3D/marcadores: acá el
// fondo es claro ("es un plano, no una foto", pide el encargo), así que los tonos se invierten.
const COLOR_FONDO = '#f6f6f3';
const COLOR_LOTE = '#dcdcd7';
const COLOR_LOTE_BORDE = '#b9b9b2';
const COLOR_AREA_COMUN = '#e6e0d2';
const COLOR_NO_DISPONIBLE_PLANO = '#8f8f89';

type PuntoM = [number, number];

// El dato trae Y = norte, y el SVG crece hacia abajo — sin invertir, el plano sale de cabeza.
function aRuta(puntos: PuntoM[]): string {
    return puntos.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${-y}`).join(' ') + ' Z';
}

export default function PlanoUbicacionLote({ clave, inmueble, disponible }: Props) {
    const nodoId = nodoIdPorInmueble(inmueble);
    const datosLotes = useLotesDeNodo(nodoId);
    const datosAreas = useAreasComunesDeNodo(nodoId);

    const plano = useMemo(() => {
        if (!datosLotes) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const considerar = (puntos: PuntoM[]) => {
            puntos.forEach(([x, y]) => {
                const sx = x;
                const sy = -y;
                if (sx < minX) minX = sx;
                if (sx > maxX) maxX = sx;
                if (sy < minY) minY = sy;
                if (sy > maxY) maxY = sy;
            });
        };
        datosLotes.lotes.forEach((l) => considerar(l.poligono_m));
        (datosAreas?.areas || []).forEach((a) => considerar(a.poligono_m));

        const anchoBruto = maxX - minX;
        const altoBruto = maxY - minY;
        const relleno = Math.max(anchoBruto, altoBruto) * 0.06;
        minX -= relleno; minY -= relleno; maxX += relleno; maxY += relleno;
        const ancho = maxX - minX;
        const alto = maxY - minY;
        const diagonal = Math.hypot(ancho, alto);

        // Umbral de legibilidad y tamaño de texto: proporcionales a la diagonal del plano
        // completo (a ojo, mismo espíritu que CLAVE_DISTANCIA_LEGIBLE_M en reticulaLotesConfig.ts
        // — ahí el umbral es en metros de distancia; acá, en proporción del plano, porque
        // LUANNA y ZANURA no tienen la misma extensión real).
        const umbralLegible = diagonal * 0.035;
        const tamanoFuente = diagonal * 0.02;

        const areas = (datosAreas?.areas || []).map((a, i) => ({ id: i, d: aRuta(a.poligono_m) }));

        // El lote elegido se dibuja aparte, encima de todo, para que nunca lo tape un vecino.
        const loteElegido = datosLotes.lotes.find((l) => l.clave === clave);
        const lotes = datosLotes.lotes
            .filter((l) => l.clave !== clave)
            .map((l) => ({ clave: l.clave, d: aRuta(l.poligono_m) }));

        const resaltado = (() => {
            if (!loteElegido) return null;
            const xs = loteElegido.poligono_m.map(([x]) => x);
            const ys = loteElegido.poligono_m.map(([, y]) => -y);
            const anchoLote = Math.max(...xs) - Math.min(...xs);
            const altoLote = Math.max(...ys) - Math.min(...ys);
            return {
                d: aRuta(loteElegido.poligono_m),
                cx: (Math.min(...xs) + Math.max(...xs)) / 2,
                cy: (Math.min(...ys) + Math.max(...ys)) / 2,
                legible: Math.min(anchoLote, altoLote) > umbralLegible,
            };
        })();

        return {
            viewBox: `${minX} ${minY} ${ancho} ${alto}`,
            areas,
            lotes,
            resaltado,
            tamanoFuente,
        };
    }, [datosLotes, datosAreas, clave]);

    if (!plano) return null;

    const colorResaltado = disponible ? COLOR_DISPONIBLE : COLOR_NO_DISPONIBLE_PLANO;

    return (
        <div className="plano-ubicacion-lote-contenedor">
            <svg viewBox={plano.viewBox} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
                <rect x="-100000" y="-100000" width="200000" height="200000" fill={COLOR_FONDO} />
                {plano.areas.map((a) => (
                    <path key={`area-${a.id}`} d={a.d} fill={COLOR_AREA_COMUN} stroke="none" />
                ))}
                {plano.lotes.map((l) => (
                    <path
                        key={l.clave}
                        d={l.d}
                        fill={COLOR_LOTE}
                        stroke={COLOR_LOTE_BORDE}
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
                {plano.resaltado && (
                    <>
                        <path
                            d={plano.resaltado.d}
                            fill={colorResaltado}
                            stroke={colorResaltado}
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                        />
                        {plano.resaltado.legible && (
                            <text
                                x={plano.resaltado.cx}
                                y={plano.resaltado.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={plano.tamanoFuente}
                                fontWeight={700}
                                fill="#ffffff"
                                stroke="rgba(0,0,0,0.35)"
                                strokeWidth={plano.tamanoFuente * 0.18}
                                paintOrder="stroke fill"
                            >
                                {clave}
                            </text>
                        )}
                    </>
                )}
            </svg>
            <div className="plano-norte" title="Norte">
                <svg viewBox="0 0 10 14" width="9" height="13"><path d="M5 0 L9 8 L6 8 L6 14 L4 14 L4 8 L1 8 Z" fill="currentColor" /></svg>
                <span>N</span>
            </div>
        </div>
    );
}
