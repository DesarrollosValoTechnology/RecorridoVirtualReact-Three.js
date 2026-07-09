// src/store/useTourStore.ts
import { create } from 'zustand';
import { supabase } from '../supabase/client';

const getInitialNode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('nodo') || 'zibata';
};

interface TourState {
    nodoActual: string;
    isTransitioning: boolean;
    fadeActivo: boolean;
    logoVisible: boolean;
    logoTranslucido: boolean;
    mostrarElementos3D: boolean;
    userQuiereRotacion: boolean;
    idiomaActual: 'es' | 'en';
    menuAbierto: boolean;
    panelActivo: 'contacto' | 'compartir' | 'ubicacion' | 'mapa' | null;
    nodos: Record<string, any>;
    cargandoNodos: boolean;
    cargarNodos: () => Promise<void>;
    setNodoActual: (id: string) => void;
    setFadeActivo: (val: boolean) => void;
    setIsTransitioning: (val: boolean) => void;
    setLogoVisible: (val: boolean) => void;
    setLogoTranslucido: (val: boolean) => void;
    setMostrarElementos3D: (val: boolean) => void;
    setUserQuiereRotacion: (val: boolean) => void;
    setMenuAbierto: (val: boolean) => void;
    setPanelActivo: (val: any) => void;
    toggleRotacion: () => void;
    cambiarIdioma: () => void;
    cargarNodo: (id: string) => void;
    tooltipHover: { titulo: string, miniatura: string, x: number, y: number } | null;
    setTooltipHover: (data: any) => void;
    adminPanelActivo: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | 'editorLabels' | 'explorador' | null;
    setAdminPanelActivo: (panel: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | 'editorLabels' | 'explorador' | null) => void;
    actualizarPosicionLabel: (id: string, x: number, y: number, z: number) => Promise<void>;
    actualizarNodoActual: (cambios: any) => Promise<void>;
    borrarNodoActual: () => Promise<{ ok: boolean; error?: string }>;
    borrarNodo: (id: string) => Promise<{ ok: boolean; error?: string }>;
    actualizarPosicionHotspot: (id: string, x: number, y: number, z: number) => Promise<void>;
    crearNuevoHotspot: (nodoId?: string) => Promise<void>;
    hotspotSeleccionadoId: string | null;
    setHotspotSeleccionadoId: (id: string | null) => void;
    actualizarPropiedadesHotspot: (id: string, destino: string, tipo: string) => Promise<void>;
    borrarHotspot: (id: string) => Promise<void>;
    labelSeleccionadoId: string | null;
    setLabelSeleccionadoId: (id: string | null) => void;
    crearNuevoLabel: (nodoId?: string) => Promise<void>;
    actualizarPropiedadesLabel: (id: string, campo: string, valor: any) => Promise<void>;
    borrarLabel: (id: string) => Promise<void>;
}

export const useTourStore = create<TourState>((set, get) => ({
    // --- ESTADOS INICIALES ---
    adminPanelActivo: null,
    setAdminPanelActivo: (panel) => set({ adminPanelActivo: panel }),

    nodoActual: getInitialNode(),
    isTransitioning: false,
    fadeActivo: false,
    logoVisible: true,
    logoTranslucido: false,
    mostrarElementos3D: false,
    userQuiereRotacion: true,
    idiomaActual: 'es',
    menuAbierto: false,
    panelActivo: null,
    tooltipHover: null,
    nodos: {},
    cargandoNodos: true,

    // --- CARGA DESDE SUPABASE ---
    cargarNodos: async () => {
        const { data, error } = await supabase
            .from('nodos')
            .select(`
                *,
                hotspots:hotspots!hotspots_nodo_origen_id_fkey(*),
                labels(*)
            `);

        if (error) {
            console.error("Error al cargar Supabase:", error);
            set({ cargandoNodos: false });
            return;
        }

        const diccionarioNodos: Record<string, any> = {};

        data.forEach((nodoDB) => {
            diccionarioNodos[nodoDB.id] = {
                tipo: 'foto',
                // 🗄️ Campos migrados desde nodos.ts → Supabase
                archivo:      nodoDB.foto_url,
                archivoBlur:  nodoDB.archivo_blur_url || nodoDB.foto_url,
                lat:          nodoDB.lat,
                lng:          nodoDB.lng,
                mapaX:        nodoDB.mapa_x,
                mapaY:        nodoDB.mapa_y,
                norteOffset:  nodoDB.norte_offset,
                ui: {
                    titulo:    nodoDB.titulo,
                    categoria: nodoDB.categoria || 'General',       // ← columna nueva
                    miniatura: nodoDB.miniatura_url || nodoDB.foto_url,
                },
                hotspots: nodoDB.hotspots.map((h: any) => ({
                    id:       h.id,
                    destino:  h.nodo_destino_id,
                    tipo:     h.tipo,
                    posicion: { x: h.x, y: h.y, z: h.z },
                })),
                // ✅ CÓDIGO NUEVO (Pon este)
                labels: nodoDB.labels.map((l: any) => ({
                    id:       l.id,
                    texto_es: l.texto_es, // 👈 Extraemos el español
                    texto_en: l.texto_en, // 👈 Extraemos el inglés
                    target:   { x: l.x, y: l.y, z: l.z },
                    offset:   { x: 0, y: l.offset_y || 15, z: 0 },
                })),
            };
        });

        let nodoFinal = get().nodoActual;
        if (!diccionarioNodos[nodoFinal]) nodoFinal = 'zibata';

        set({ nodos: diccionarioNodos, nodoActual: nodoFinal, cargandoNodos: false });
    },

    // --- EDITOR: HOTSPOTS ---
    hotspotSeleccionadoId: null,
    setHotspotSeleccionadoId: (id) => set({ hotspotSeleccionadoId: id }),

    actualizarPosicionHotspot: async (id, x, y, z) => {
        // Optimista local
        const nodosActuales = { ...get().nodos };
        const nodoId = get().nodoActual;
        if (nodosActuales[nodoId]) {
            nodosActuales[nodoId].hotspots = nodosActuales[nodoId].hotspots.map((h: any) =>
                h.id === id ? { ...h, posicion: { x, y, z } } : h
            );
            set({ nodos: nodosActuales });
        }
        // Nube
        const { error } = await supabase.from('hotspots').update({ x, y, z }).eq('id', id);
        if (error) console.error("Error al guardar posición:", error);
    },

    crearNuevoHotspot: async (nodoId) => {
        const nodoOrigen = nodoId || get().nodoActual;
        const { error } = await supabase
            .from('hotspots')
            .insert([{ nodo_origen_id: nodoOrigen, nodo_destino_id: nodoOrigen, x: 0, y: 0, z: -50, tipo: 'pasos' }]);
        if (!error) await get().cargarNodos();
    },

    actualizarPropiedadesHotspot: async (id, destino, tipo) => {
        // Optimista local: buscamos el hotspot en TODOS los nodos (puede no ser el activo, ej. desde el Explorador)
        const nodosActuales = { ...get().nodos };
        for (const nId of Object.keys(nodosActuales)) {
            const nodo = nodosActuales[nId];
            if (nodo.hotspots?.some((h: any) => h.id === id)) {
                nodosActuales[nId] = {
                    ...nodo,
                    hotspots: nodo.hotspots.map((h: any) => (h.id === id ? { ...h, destino, tipo } : h)),
                };
                break;
            }
        }
        set({ nodos: nodosActuales });
        // Nube
        const { error } = await supabase.from('hotspots').update({ nodo_destino_id: destino, tipo }).eq('id', id);
        if (error) console.error("Error al actualizar hotspot:", error);
    },

    borrarHotspot: async (id) => {
        const { error } = await supabase.from('hotspots').delete().eq('id', id);
        if (!error) {
            set({ hotspotSeleccionadoId: null });
            get().cargarNodos();
        }
    },

    // --- EDITOR: NODO ---
    actualizarNodoActual: async (cambios) => {
        const id = get().nodoActual;
        const { error } = await supabase.from('nodos').update(cambios).eq('id', id);

        if (error) {
            console.error("Error al actualizar nodo:", error);
        } else {
            const nodosActuales = { ...get().nodos };
            if (nodosActuales[id]) {
                nodosActuales[id] = {
                    ...nodosActuales[id],
                    mapaX:       cambios.mapa_x       !== undefined ? cambios.mapa_x       : nodosActuales[id].mapaX,
                    mapaY:       cambios.mapa_y       !== undefined ? cambios.mapa_y       : nodosActuales[id].mapaY,
                    norteOffset: cambios.norte_offset !== undefined ? cambios.norte_offset : nodosActuales[id].norteOffset,
                    lat:         cambios.lat          !== undefined ? cambios.lat          : nodosActuales[id].lat,
                    lng:         cambios.lng          !== undefined ? cambios.lng          : nodosActuales[id].lng,
                };
                nodosActuales[id].ui.titulo    = cambios.titulo    || nodosActuales[id].ui.titulo;
                nodosActuales[id].ui.categoria = cambios.categoria || nodosActuales[id].ui.categoria;
                set({ nodos: nodosActuales });
                console.log("✅ Nodo actualizado correctamente");
            }
        }
    },

    // --- EDITOR: BORRAR NODO ---
    // Genérico: borra cualquier nodo por id (lo usa tanto el panel de config del nodo activo como el Explorador)
    borrarNodo: async (id) => {
        const nodoInfo = get().nodos[id];
        const eraElActivo = get().nodoActual === id;

        try {
            // 1. Limpiar hotspots que salen de este nodo o que otros nodos usan para llegar a él
            const { error: errHsOrigen } = await supabase.from('hotspots').delete().eq('nodo_origen_id', id);
            if (errHsOrigen) throw errHsOrigen;
            const { error: errHsDestino } = await supabase.from('hotspots').delete().eq('nodo_destino_id', id);
            if (errHsDestino) throw errHsDestino;

            // 2. Limpiar labels del nodo
            const { error: errLabels } = await supabase.from('labels').delete().eq('nodo_id', id);
            if (errLabels) throw errLabels;

            // 3. Borrar archivos de Storage asociados (best-effort, no bloquea el borrado si falla)
            const rutasArchivo = [nodoInfo?.archivo, nodoInfo?.archivoBlur, nodoInfo?.ui?.miniatura]
                .filter((url): url is string => typeof url === 'string' && url.includes('/fotos_tour/'))
                .map((url) => url.split('/fotos_tour/')[1]);
            if (rutasArchivo.length > 0) {
                await supabase.storage.from('fotos_tour').remove(rutasArchivo);
            }

            // 4. Borrar el nodo
            const { error: errNodo } = await supabase.from('nodos').delete().eq('id', id);
            if (errNodo) throw errNodo;

            // 5. Recargar y, si borramos el nodo que estábamos viendo, saltar a otro válido
            await get().cargarNodos();

            if (eraElActivo) {
                const nodosRestantes = Object.keys(get().nodos);
                const siguienteNodo = nodosRestantes.includes('zibata') ? 'zibata' : nodosRestantes[0];

                if (siguienteNodo) {
                    const nuevaUrl = new URL(window.location.href);
                    nuevaUrl.searchParams.set('nodo', siguienteNodo);
                    window.history.pushState({}, '', nuevaUrl);
                    set({ nodoActual: siguienteNodo });
                }
                set({ adminPanelActivo: null });
            }

            return { ok: true };
        } catch (error: any) {
            console.error("Error al borrar nodo:", error);
            return { ok: false, error: error.message };
        }
    },

    borrarNodoActual: async () => get().borrarNodo(get().nodoActual),

    // --- NAVEGACIÓN ---
    setNodoActual:        (id)  => set({ nodoActual: id }),
    setFadeActivo:        (val) => set({ fadeActivo: val }),
    setIsTransitioning:   (val) => set({ isTransitioning: val }),
    setLogoVisible:       (val) => set({ logoVisible: val }),
    setLogoTranslucido:   (val) => set({ logoTranslucido: val }),
    setMostrarElementos3D:(val) => set({ mostrarElementos3D: val }),
    setUserQuiereRotacion:(val) => set({ userQuiereRotacion: val }),
    setMenuAbierto:       (val) => set({ menuAbierto: val }),
    // 🚨 ESTE ES EL NUEVO BLOQUE (Asegúrate de que termine con coma al final)
    setPanelActivo: (val) => {
        set({ panelActivo: val });
        // Si cerramos un panel, por pura seguridad borramos cualquier tooltip flotante
        if (val === null) {
            set({ tooltipHover: null });
        }
    },
    toggleRotacion: () => set((s) => ({ userQuiereRotacion: !s.userQuiereRotacion })),
    cambiarIdioma:  () => set((s) => ({ idiomaActual: s.idiomaActual === 'es' ? 'en' : 'es' })),
    setTooltipHover:(val) => set({ tooltipHover: val }),

    cargarNodo: (id) => {
        if (get().isTransitioning || id === get().nodoActual) return;
        const nodosDB = get().nodos;
        const preloadImg = new Image();
        if (nodosDB[id]?.archivo) preloadImg.src = nodosDB[id].archivo;

        const nuevaUrl = new URL(window.location.href);
        nuevaUrl.searchParams.set('nodo', id);
        window.history.pushState({}, '', nuevaUrl);

        set({ isTransitioning: true, fadeActivo: true, menuAbierto: false, panelActivo: null });
        setTimeout(() => set({ nodoActual: id }), 500);
    },
    labelSeleccionadoId: null,

    setLabelSeleccionadoId: (id) => set({ labelSeleccionadoId: id }),

    crearNuevoLabel: async (nodoId) => {
        const { nodoActual, cargarNodos } = get();
        // Posición inicial frente a la cámara
        const nuevoLabel = {
            nodo_id: nodoId || nodoActual,
            texto_es: 'Nueva Etiqueta',
            texto_en: 'New Label',
            x: 0, y: 0, z: -5,
            offset_y: 120
        };

        const { error } = await supabase.from('labels').insert([nuevoLabel]);
        if (!error) await cargarNodos();
    },

    actualizarPropiedadesLabel: async (id, campo, valor) => {
        // 1. Actualización Optimista (Local): buscamos el label en TODOS los nodos (puede no ser el activo)
        const nodosActuales = { ...get().nodos };
        for (const nId of Object.keys(nodosActuales)) {
            const nodo = nodosActuales[nId];
            const label = nodo.labels?.find((l: any) => l.id === id);
            if (label) {
                nodosActuales[nId] = {
                    ...nodo,
                    labels: nodo.labels.map((l: any) => {
                        if (l.id !== id) return l;
                        if (campo === 'offset_y') return { ...l, offset: { ...l.offset, y: valor } };
                        return { ...l, [campo]: valor };
                    }),
                };
                break;
            }
        }
        set({ nodos: nodosActuales });

        // 2. Actualización en Nube
        const columnMap: any = { 'offset_y': 'offset_y', 'texto_es': 'texto_es', 'texto_en': 'texto_en' };
        await supabase.from('labels').update({ [columnMap[campo] || campo]: valor }).eq('id', id);
    },

    borrarLabel: async (id) => {
        const { cargarNodos } = get();
        const { error } = await supabase.from('labels').delete().eq('id', id);
        if (!error) {
            set({ labelSeleccionadoId: null });
            await cargarNodos();
        }
    },
    // --- AGREGA ESTA FUNCIÓN EN EL CUERPO DEL STORE ---
    actualizarPosicionLabel: async (id, x, y, z) => {
        const { nodos, nodoActual } = get();
        const nuevosNodos = { ...nodos };
        const label = nuevosNodos[nodoActual].labels.find((l: any) => l.id === id);

        if (label) {
            // Actualización optimista local 
            // (Usamos .target porque así lo definiste en tu función cargarNodos)
            label.target = { x, y, z };
            set({ nodos: nuevosNodos });
        }

        // Actualización en Supabase
        const { error } = await supabase.from('labels').update({ x, y, z }).eq('id', id);
        if (error) console.error("Error al guardar posición del label:", error);
    },
}));