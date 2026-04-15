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
    adminPanelActivo: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | null;
    setAdminPanelActivo: (panel: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | null) => void;
    actualizarNodoActual: (cambios: any) => Promise<void>;
    actualizarPosicionHotspot: (id: string, x: number, y: number, z: number) => Promise<void>;
    crearNuevoHotspot: () => Promise<void>;
    hotspotSeleccionadoId: string | null;
    setHotspotSeleccionadoId: (id: string | null) => void;
    actualizarPropiedadesHotspot: (id: string, destino: string, tipo: string) => Promise<void>;
    borrarHotspot: (id: string) => Promise<void>;
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
                labels: nodoDB.labels.map((l: any) => ({
                    id:     l.id,
                    texto:  l.texto,
                    target: { x: l.x, y: l.y, z: l.z },
                    offset: { x: 0, y: l.offset_y || 15, z: 0 },
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

    crearNuevoHotspot: async () => {
        const nodoOrigen = get().nodoActual;
        const { error } = await supabase
            .from('hotspots')
            .insert([{ nodo_origen_id: nodoOrigen, nodo_destino_id: nodoOrigen, x: 0, y: 0, z: -50, tipo: 'pasos' }]);
        if (!error) await get().cargarNodos();
    },

    actualizarPropiedadesHotspot: async (id, destino, tipo) => {
        // Optimista local
        const nodosActuales = { ...get().nodos };
        const nodoId = get().nodoActual;
        if (nodosActuales[nodoId]) {
            nodosActuales[nodoId].hotspots = nodosActuales[nodoId].hotspots.map((h: any) =>
                h.id === id ? { ...h, destino, tipo } : h
            );
            set({ nodos: nodosActuales });
        }
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

    // --- NAVEGACIÓN ---
    setNodoActual:        (id)  => set({ nodoActual: id }),
    setFadeActivo:        (val) => set({ fadeActivo: val }),
    setIsTransitioning:   (val) => set({ isTransitioning: val }),
    setLogoVisible:       (val) => set({ logoVisible: val }),
    setLogoTranslucido:   (val) => set({ logoTranslucido: val }),
    setMostrarElementos3D:(val) => set({ mostrarElementos3D: val }),
    setUserQuiereRotacion:(val) => set({ userQuiereRotacion: val }),
    setMenuAbierto:       (val) => set({ menuAbierto: val }),
    setPanelActivo:       (val) => set({ panelActivo: val }),
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
}));