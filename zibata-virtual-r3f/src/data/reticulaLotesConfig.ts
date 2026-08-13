// src/data/reticulaLotesConfig.ts
//
// Config estática del experimento "retícula de lotes sobre terreno" (ver
// encargo-reticula-lotes-recorrido360.md). Solo aplica a los dos nodos del recorrido que
// muestran terreno sin construir: LUANNA y ZANURA. Si algún día se apaga el experimento,
// basta con vaciar NODOS_CON_RETICULA.

/** Ajuste manual de un nodo: dónde estaba el dron y a qué altura voló. Sin escala: los
 *  lotes ya vienen en metros reales, la escala aparente sale sola de la altura real. */
export interface AjusteReticula {
    offsetX: number;
    offsetZ: number;
    yawDeg: number;
    alturaM: number;
}

export interface NodoConReticula {
    /** Ruta pública del JSON de lotes (ya extraído del DXF, no se parsea en el navegador). */
    archivoLotes: string;
    /** Ruta pública del JSON de áreas comunes — mismo marco de metros locales que los lotes.
     *  Solo se usa para el plano de ubicación (PlanoUbicacionLote.tsx), le da forma al
     *  conjunto para que los lotes no se vean flotando en el vacío. */
    archivoAreasComunes: string;
    /** Altura real de vuelo del dron en metros — valor inicial del control "Altura". */
    alturaRealM: number;
    inmueble: string;
}

/** Los dos únicos nodos de terreno del recorrido. Sus ids vienen de la tabla `nodos` en Supabase. */
export const NODOS_CON_RETICULA: Record<string, NodoConReticula> = {
    luanna: {
        archivoLotes: '/data/lotes-luanna-metros-locales.json',
        archivoAreasComunes: '/data/areas-comunes-luanna-metros-locales.json',
        alturaRealM: 60,
        inmueble: 'LUANNA',
    },
    zibataaereozanura: {
        archivoLotes: '/data/lotes-zanura-metros-locales.json',
        archivoAreasComunes: '/data/areas-comunes-zanura-metros-locales.json',
        alturaRealM: 120,
        inmueble: 'ZANURA',
    },
};

/** Ajuste por defecto de un nodo: dron centrado, sin girar, a su altura real (nunca en 1). */
export function ajusteReticulaPorDefecto(nodoId: string): AjusteReticula {
    return {
        offsetX: 0,
        offsetZ: 0,
        yawDeg: 0,
        alturaM: NODOS_CON_RETICULA[nodoId]?.alturaRealM ?? 60,
    };
}

/** El panel de lote (PanelesOverlay.tsx) solo conoce el `inmueble` ('LUANNA'/'ZANURA'), no el
 *  id de nodo — esto lo resuelve para poder reusar useLotesDeNodo/useAreasComunesDeNodo (y su
 *  caché) en PlanoUbicacionLote.tsx. */
export function nodoIdPorInmueble(inmueble: string): string | null {
    const entrada = Object.entries(NODOS_CON_RETICULA).find(([, cfg]) => cfg.inmueble === inmueble);
    return entrada ? entrada[0] : null;
}

/** Distancia horizontal (m) más allá de la cual la clave del lote deja de dibujarse por
 *  ilegible. Evita amontonar decenas de etiquetas diminutas en los lotes lejanos. */
export const CLAVE_DISTANCIA_LEGIBLE_M = 110;

// --- Disponibilidad (encargo-disponibilidad-publica-recorrido360.md) ---
// Dos colores y ni uno más: sin leyenda elaborada, sin tercer estado, sin distinguir
// apartado/vendido (la vista de Supabase ya los colapsó a propósito en "no disponible").
// Verde = el mismo verde que ya usan el resto de los botones "esto se puede tocar"
// (Volver a Vista Aérea, Activar Zonas, Ver Lotes). Gris apagado = inerte, sin tomar
// prestada la connotación de "error" del rojo.
export const COLOR_DISPONIBLE = '#5cb82a';
export const COLOR_NO_DISPONIBLE = '#888888';

// --- Contorno público (encargo-ajuste-marcadores-recorrido360.md,
// encargo-visibilidad-reticula-recorrido360.md, encargo-afinacion-marcadores-recorrido360.md) ---
// En la vista pública el contorno es contexto, no protagonista: se ve la lotificación completa
// pero discreta, blanca y uniforme (nada de color por disponibilidad — eso ya lo dice el
// marcador, y dos lenguajes compitiendo confunde), sin relleno y sin poder tocarse. Ver
// ContornosLotesPublico.tsx.
//
// Grosor de línea en píxeles de pantalla (drei <Line> usa Line2, así que NO cambia con la
// distancia) — a 1px, en pantallas de alta densidad y en tramos casi paralelos a la dirección
// de vista, tramos enteros quedaban por debajo de media cobertura de píxel y el antialiasing
// los borraba: no estaban tapados, no llegaban a pintarse.
export const CONTORNO_LOTE_GROSOR_PX = 2.25;
export const CONTORNO_PUBLICO_OPACIDAD = 0.18;

// El problema real de legibilidad no era solo grosor/opacidad: son líneas claras sobre una foto
// aérea con tramos de terracería casi blanca — ahí una línea blanca desaparece por más gruesa u
// opaca que sea, porque el problema es de CONTRASTE, no de tamaño. Misma solución que ya
// funcionó en los marcadores al invertir a chip oscuro + glifo claro: una sombra oscura, sutil,
// un poco más ancha que la línea, dibujada DETRÁS — así se lee tanto sobre terracería clara
// como sobre monte verde. Ver ContornosLotesPublico.tsx.
export const CONTORNO_HALO_COLOR = '#000000';
export const CONTORNO_HALO_GROSOR_PX = CONTORNO_LOTE_GROSOR_PX + 1.5;
export const CONTORNO_HALO_OPACIDAD = 0.35;

// --- Marcadores de lote (encargo-marcadores-lotes-recorrido360.md,
// encargo-ajuste-marcadores-recorrido360.md) ---
// La vista pública no pinta el polígono como protagonista (satura la imagen, y con 158-220
// lotes por nodo se vuelve una cortina): un chip chico por lote, con la misma casita
// distinguible por FORMA (no solo color) entre disponible y vendido — ver
// public/Assets/Hotspots/lote-*.svg y el CSS .marcador-lote-chip en index.css (el tamaño del
// marcador vive en píxeles de pantalla vía CSS, no en unidades de mundo — ver
// MarcadoresLotes.tsx para por qué).
export const URL_ICONO_LOTE_DISPONIBLE = '/Assets/Hotspots/lote-disponible.svg';
export const URL_ICONO_LOTE_VENDIDO = '/Assets/Hotspots/lote-vendido.svg';

// Distancia en PÍXELS de pantalla bajo la cual dos marcadores se consideran "encimados" y solo
// se muestra el más cercano a la cámara (prioridad SIN cambios: gana el de menor
// `distanciaCamara`, estable porque la cámara nunca se traslada, solo rota). Es el mecanismo
// real que evita la cortina de 220 iconos en ZANURA — y se autoajusta al FOV/zoom porque se
// mide en píxeles, no en metros (un umbral en metros que funcione en LUANNA, a 60 m de altura,
// no engancha en ZANURA, a 120 m — la geometría real de los dos sitios no es proporcional).
//
// DOS umbrales, no uno — histéresis (encargo-afinacion-marcadores-recorrido360.md): con un solo
// valor, un marcador justo en el límite prendía y apagaba al girar la cámara un poco (el
// "parpadeo" que reportó el usuario). Para APARECER hace falta el hueco más exigente (26px,
// ~lo que mide el chip visible); una vez visible, sobrevive hasta que el hueco baje del umbral
// más laxo (22px) — así un roce momentáneo en el borde no lo hace titilar. Ver
// MarcadoresLotes.tsx (guarda qué claves estaban visibles en el cálculo anterior).
export const UMBRAL_APARECER_PX = 26;
export const UMBRAL_DESAPARECER_PX = 22;

// La histéresis, sola, tiene una trampa: cualquier par de lotes cuya separación en pantalla
// caiga entre los dos umbrales (22-26px) queda "atrapado" para siempre en cuanto un
// perturbación mínima de cámara lo empuja una sola vez por encima de 26 — a partir de ahí
// sobrevive indefinidamente con el umbral laxo (22), aunque la cámara vuelva exactamente a
// donde estaba. Con el tiempo (o con cualquier vaivén, por chico que sea) esto va acumulando
// cada vez más marcadores atrapados y termina por deshacer el descarte por colisión. Por eso
// la memoria de "qué estaba visible" se reinicia por completo cada cierto tiempo — no cada
// frame (eso sí sería el parpadeo que se quería evitar), pero sí lo bastante seguido para que
// nunca se acumule sin límite. Ver MarcadoresLotes.tsx.
export const INTERVALO_REINICIO_HISTERESIS_S = 4;

/** Cada cuánto se recalcula qué marcadores se ven (segundos). No hace falta cada frame: 220
 *  proyecciones + comparaciones cada frame es gasto de sobra para algo que no necesita ser
 *  perfectamente fluido. */
export const INTERVALO_RECALCULO_MARCADORES_S = 0.15;

/** Techo de seguridad — no debería activarse nunca con el filtro de colisión funcionando, es
 *  solo para que un caso extremo (todo el mundo alejado a la vez) no dispare 220 marcadores.
 *  Subió de 70 a 100 junto con el umbral más chico: con menos exigencia para encimarse, caben
 *  más marcadores legítimos en pantalla antes de que este techo tenga sentido de aplicarse. */
export const MAX_MARCADORES_VISIBLES = 100;

export interface LoteDTO {
    clave: string;
    superficie_m2: number;
    poligono_m: [number, number][];
}

export interface LotesArchivoDTO {
    inmueble: string;
    unidades: string;
    origen: string;
    altura_dron_m: number;
    nota: string;
    total: number;
    lotes: LoteDTO[];
}

// --- Áreas comunes (encargo-plano-ubicacion-recorrido360.md) ---
// Mismo marco de metros locales que los lotes, sin `clave` (las áreas comunes no la tienen).
// Solo se usan para el plano de ubicación, no en la retícula 3D ni en los marcadores.
export interface AreaComunDTO {
    superficie_m2: number;
    poligono_m: [number, number][];
}

export interface AreasComunesArchivoDTO {
    inmueble: string;
    unidades: string;
    total: number;
    nota: string;
    areas: AreaComunDTO[];
}
