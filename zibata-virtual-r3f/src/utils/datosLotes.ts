// src/utils/datosLotes.ts
//
// Carga y preparación compartida de datos de lotes — usada tanto por la vista de admin
// (ReticulaLotes.tsx, contornos completos para calibrar) como por la vista pública
// (MarcadoresLotes.tsx, un ícono por lote). Nada aquí sabe de React más que los dos hooks de
// carga; el resto es matemática pura para no duplicarla entre ambos componentes.
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '../supabase/client';
import {
    NODOS_CON_RETICULA,
    type AjusteReticula,
    type AreasComunesArchivoDTO,
    type LotesArchivoDTO,
} from '../data/reticulaLotesConfig';

// --- Cache a nivel de módulo: entrar/salir del panel admin, o de marcadores a contornos y
// volver, no debe repetir peticiones. Compartida por ambos hooks/componentes. ---
const cacheLotes = new Map<string, LotesArchivoDTO>();
const cacheDisponibilidad = new Map<string, Record<string, boolean>>();
const cacheAreasComunes = new Map<string, AreasComunesArchivoDTO>();

export function useLotesDeNodo(nodoId: string | null): LotesArchivoDTO | null {
    const [datos, setDatos] = useState<LotesArchivoDTO | null>(
        nodoId ? cacheLotes.get(nodoId) ?? null : null
    );

    useEffect(() => {
        if (!nodoId || !NODOS_CON_RETICULA[nodoId]) {
            setDatos(null);
            return;
        }

        const cacheado = cacheLotes.get(nodoId);
        if (cacheado) {
            setDatos(cacheado);
            return;
        }

        let cancelado = false;
        fetch(NODOS_CON_RETICULA[nodoId].archivoLotes)
            .then((r) => r.json())
            .then((json: LotesArchivoDTO) => {
                if (cancelado) return;
                cacheLotes.set(nodoId, json);
                setDatos(json);
            })
            .catch((err) => console.error('No se pudo cargar la retícula de lotes:', err));

        return () => {
            cancelado = true;
        };
    }, [nodoId]);

    return datos;
}

// Áreas comunes: solo las usa PlanoUbicacionLote.tsx (encargo-plano-ubicacion-recorrido360.md)
// para que los lotes no se vean flotando en el vacío. Mismo patrón fetch+cache que
// useLotesDeNodo, archivo aparte.
export function useAreasComunesDeNodo(nodoId: string | null): AreasComunesArchivoDTO | null {
    const [datos, setDatos] = useState<AreasComunesArchivoDTO | null>(
        nodoId ? cacheAreasComunes.get(nodoId) ?? null : null
    );

    useEffect(() => {
        if (!nodoId || !NODOS_CON_RETICULA[nodoId]) {
            setDatos(null);
            return;
        }

        const cacheado = cacheAreasComunes.get(nodoId);
        if (cacheado) {
            setDatos(cacheado);
            return;
        }

        let cancelado = false;
        fetch(NODOS_CON_RETICULA[nodoId].archivoAreasComunes)
            .then((r) => r.json())
            .then((json: AreasComunesArchivoDTO) => {
                if (cancelado) return;
                cacheAreasComunes.set(nodoId, json);
                setDatos(json);
            })
            .catch((err) => console.error('No se pudo cargar las áreas comunes:', err));

        return () => {
            cancelado = true;
        };
    }, [nodoId]);

    return datos;
}

// Un lote sin fila en `lotes_disponibilidad` se trata como no disponible: nunca invitar a
// pedir un lote del que no hay dato (ver public.lotes_disponibilidad, vista de solo lectura
// creada por puertas-publicas-recorrido.sql).
export function useDisponibilidadDeNodo(nodoId: string | null, inmueble: string | undefined): Record<string, boolean> {
    const [datos, setDatos] = useState<Record<string, boolean>>(
        nodoId ? cacheDisponibilidad.get(nodoId) ?? {} : {}
    );

    useEffect(() => {
        if (!nodoId || !inmueble) {
            setDatos({});
            return;
        }

        const cacheado = cacheDisponibilidad.get(nodoId);
        if (cacheado) {
            setDatos(cacheado);
            return;
        }

        let cancelado = false;
        supabase
            .from('lotes_disponibilidad')
            .select('clave,disponible')
            .eq('inmueble', inmueble)
            .then(({ data, error }) => {
                if (cancelado) return;
                if (error) {
                    console.error('No se pudo cargar la disponibilidad de lotes:', error);
                    return;
                }
                const mapa: Record<string, boolean> = {};
                (data || []).forEach((fila: any) => { mapa[fila.clave] = !!fila.disponible; });
                cacheDisponibilidad.set(nodoId, mapa);
                setDatos(mapa);
            });

        return () => {
            cancelado = true;
        };
    }, [nodoId, inmueble]);

    return datos;
}

export interface LotePreparadoBase {
    clave: string;
    /** Vértices del polígono, sin cerrar, en espacio LOCAL (antes de rotar por el yaw —
     *  igual que en ReticulaLotes.tsx, esa rotación la aplica el <group> envolvente). */
    vectores: THREE.Vector3[];
    centroide: THREE.Vector3;
    /** Distancia 3D cámara→lote. Estático: la cámara vive fija en el origen, solo rota. */
    distanciaCamara: number;
    disponible: boolean;
}

/** El cálculo por-lote que comparten la vista de admin (contornos) y la pública (marcadores):
 *  proyección Este->X/Norte->-Z/Arriba->Y, centroide y disponibilidad. No incluye nada
 *  específico de cómo se dibuja cada uno (eso lo arma cada componente).
 *
 *  Nota histórica (encargo-visibilidad-reticula-recorrido360.md): hasta aquí hubo también un
 *  desvanecido pensado para un parche borroso bajo el dron que este panorama NO tiene — el
 *  dron captura el 360 completo, suelo incluido, y la esfera se subdividió con más polígonos
 *  justo para esa zona. Se quitó por completo: estaba borrando retícula real sin ninguna
 *  razón, justo donde más se mira en un nodo aéreo. */
export function prepararLotesBase(
    datos: LotesArchivoDTO | null,
    ajuste: AjusteReticula,
    disponibilidad: Record<string, boolean>
): LotePreparadoBase[] {
    if (!datos) return [];

    return datos.lotes.map((lote) => {
        const puntosCrudos = lote.poligono_m.map(
            ([x, y]) => new THREE.Vector3(x - ajuste.offsetX, -ajuste.alturaM, -(y - ajuste.offsetZ))
        );

        // Algunos polígonos del DXF ya traen el primer vértice repetido al final.
        const vectores =
            puntosCrudos.length > 1 &&
            puntosCrudos[0].distanceToSquared(puntosCrudos[puntosCrudos.length - 1]) < 1e-6
                ? puntosCrudos.slice(0, -1)
                : puntosCrudos;

        const centroide = new THREE.Vector3();
        vectores.forEach((v) => centroide.add(v));
        centroide.divideScalar(vectores.length);

        return {
            clave: lote.clave,
            vectores,
            centroide,
            distanciaCamara: centroide.length(),
            disponible: disponibilidad[lote.clave] ?? false,
        };
    });
}
