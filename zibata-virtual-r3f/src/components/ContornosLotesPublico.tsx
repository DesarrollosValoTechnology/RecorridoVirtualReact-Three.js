// src/components/ContornosLotesPublico.tsx
//
// Contorno de TODOS los lotes en la vista pública: contexto que le da sentido a la imagen (se
// ve la lotificación), pero no protagonista. Línea fina, blanca, uniforme, muy transparente —
// sin relleno, sin distinguir disponibilidad (eso lo dice el marcador; ver MarcadoresLotes.tsx)
// y sin ningún handler de puntero, a propósito: toda la interacción sigue en el marcador. Ver
// encargo-ajuste-marcadores-recorrido360.md y encargo-visibilidad-reticula-recorrido360.md.
//
// En admin sigue viéndose la versión completa (contorno + relleno + color + clave) en
// ReticulaLotes.tsx, sin cambios — ese es el que se usa para calibrar.
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '../store/useTourStore';
import {
    ajusteReticulaPorDefecto,
    CONTORNO_HALO_COLOR,
    CONTORNO_HALO_GROSOR_PX,
    CONTORNO_HALO_OPACIDAD,
    CONTORNO_LOTE_GROSOR_PX,
    CONTORNO_PUBLICO_OPACIDAD,
    NODOS_CON_RETICULA,
} from '../data/reticulaLotesConfig';
import { prepararLotesBase, useLotesDeNodo } from '../utils/datosLotes';

// El color por disponibilidad no aplica aquí, así que no hace falta pedirle nada a
// useDisponibilidadDeNodo — se le pasa un mapa vacío a prepararLotesBase y se ignora el campo
// `disponible` del resultado.
const SIN_DISPONIBILIDAD: Record<string, boolean> = {};

export default function ContornosLotesPublico() {
    const nodoActual = useTourStore((state) => state.nodoActual);
    const ajustesReticula = useTourStore((state) => state.ajustesReticula);

    const config = NODOS_CON_RETICULA[nodoActual];
    const datos = useLotesDeNodo(config ? nodoActual : null);
    const ajuste = ajustesReticula[nodoActual] ?? ajusteReticulaPorDefecto(nodoActual);

    const contornos = useMemo(() => {
        return prepararLotesBase(datos, ajuste, SIN_DISPONIBILIDAD).map((l) => ({
            clave: l.clave,
            puntos: [...l.vectores, l.vectores[0].clone()],
        }));
    }, [datos, ajuste.offsetX, ajuste.offsetZ, ajuste.alturaM]);

    if (!config || contornos.length === 0) return null;

    return (
        <group rotation={[0, THREE.MathUtils.degToRad(ajuste.yawDeg), 0]}>
            {contornos.map((c) => (
                // depthTest={false} + renderOrder: garantía explícita de que se ve siempre
                // encima de la esfera (aunque hoy nada la ocluye). Los marcadores (Html, DOM
                // real) ya quedan por encima de esto sin código adicional — un <Html> de drei
                // se dibuja fuera del canvas WebGL, así que ninguna línea puede pasarle por
                // encima. Esfera → retícula (con su halo) → marcadores.
                //
                // Dos líneas superpuestas, no una: una sombra oscura más ancha DETRÁS (el
                // halo) y la línea clara encima. Sin esto, una línea blanca se lava por
                // completo sobre tramos de terracería casi blanca — no es un problema de
                // grosor/opacidad, es de contraste (misma razón por la que el marcador es un
                // chip oscuro con glifo claro, no un ícono blanco suelto).
                <group key={c.clave}>
                    <Line
                        points={c.puntos}
                        color={CONTORNO_HALO_COLOR}
                        lineWidth={CONTORNO_HALO_GROSOR_PX}
                        transparent
                        opacity={CONTORNO_HALO_OPACIDAD}
                        depthTest={false}
                        renderOrder={1}
                    />
                    <Line
                        points={c.puntos}
                        color="#ffffff"
                        lineWidth={CONTORNO_LOTE_GROSOR_PX}
                        transparent
                        opacity={CONTORNO_PUBLICO_OPACIDAD}
                        depthTest={false}
                        renderOrder={2}
                    />
                </group>
            ))}
        </group>
    );
}
