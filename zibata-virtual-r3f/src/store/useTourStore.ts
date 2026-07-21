// src/store/useTourStore.ts
import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { generarVersionBlur, convertirAWebP } from '../utils/imagenAWebp';

const getInitialNode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('nodo') || 'zibata';
};

// Categoría de las tomas aéreas de dron (debe coincidir con el valor guardado en Supabase)
export const CATEGORIA_VISTA_AEREA = 'Exteriores Zibatá';
// Nivel más alto de la jerarquía (Zibatá completo, un único nodo): por encima de él
// no hay nada a lo que "volver", así que el botón de vista aérea no debe aparecer ahí.
export const CATEGORIA_ZIBATA = 'Zibatá';
// Id del único nodo de nivel "Zibatá" — destino al que sube el botón "Volver a Vista
// Aérea" cuando se pulsa desde un nodo de nivel "Exteriores Zibatá".
export const NODO_ZIBATA_ID = 'zibata';

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
    ultimoNodoAereo: string;
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
    adminPanelActivo: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | 'editorLabels' | 'editorZonas' | 'explorador' | null;
    setAdminPanelActivo: (panel: 'nuevoNodo' | 'editorHotspots' | 'editarNodo' | 'editorLabels' | 'editorZonas' | 'explorador' | null) => void;
    actualizarPosicionLabel: (id: string, x: number, y: number, z: number) => Promise<void>;
    actualizarNodoActual: (cambios: any) => Promise<void>;
    borrarNodoActual: () => Promise<{ ok: boolean; error?: string }>;
    borrarNodo: (id: string) => Promise<{ ok: boolean; error?: string }>;
    marcarNodoPrincipal: (id: string) => Promise<void>;
    zonasActivas: boolean;
    toggleZonasActivas: () => void;
    generarBlurParaNodo: (id: string) => Promise<{ ok: boolean; error?: string }>;
    generarMiniaturaParaNodo: (id: string) => Promise<{ ok: boolean; error?: string }>;
    reoptimizarFoto360ParaNodo: (id: string) => Promise<{ ok: boolean; error?: string; sinCambios?: boolean }>;
    actualizarPosicionHotspot: (id: string, x: number, y: number, z: number) => Promise<void>;
    crearNuevoHotspot: (nodoId?: string) => Promise<void>;
    hotspotSeleccionadoId: string | null;
    setHotspotSeleccionadoId: (id: string | null) => void;
    actualizarPropiedadesHotspot: (id: string, destino: string) => Promise<void>;
    actualizarTipoIconoNodo: (id: string, tipo: string) => Promise<void>;
    actualizarTextoHotspot: (hotspotId: string, texto: string) => Promise<void>;
    borrarHotspot: (id: string) => Promise<void>;
    labelSeleccionadoId: string | null;
    setLabelSeleccionadoId: (id: string | null) => void;
    crearNuevoLabel: (nodoId?: string) => Promise<void>;
    actualizarPropiedadesLabel: (id: string, campo: string, valor: any) => Promise<void>;
    borrarLabel: (id: string) => Promise<void>;
    fovActual: number;
    setFovActual: (fov: number) => void;
    capturaAbierta: boolean;
    setCapturaAbierta: (val: boolean) => void;

    // --- EDITOR: ZONAS (polígonos clicables sobre la esfera) ---
    zonaSeleccionadaId: string | null;
    setZonaSeleccionadaId: (id: string | null) => void;
    verticeZonaSeleccionado: number | null;
    setVerticeZonaSeleccionado: (indice: number | null) => void;
    dibujandoZona: boolean;
    setDibujandoZona: (val: boolean) => void;
    puntosZonaEnProceso: { x: number; y: number; z: number }[];
    agregarPuntoZonaEnProceso: (x: number, y: number, z: number) => void;
    quitarUltimoPuntoZonaEnProceso: () => void;
    limpiarPuntosZonaEnProceso: () => void;
    guardarNuevaZona: (nodoOrigenId: string, destino: string, nombre: string, color: string) => Promise<void>;
    actualizarPropiedadesZona: (id: string, campo: string, valor: any) => Promise<void>;
    actualizarVerticeZona: (id: string, indice: number, x: number, y: number, z: number) => Promise<void>;
    borrarZona: (id: string) => Promise<void>;
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
    ultimoNodoAereo: 'zibata',
    // Las zonas (polígonos) empiezan apagadas: el visitante ve la foto limpia y las
    // activa con el botón "Activar Zonas" cuando quiere explorar/viajar por ellas.
    zonasActivas: false,
    toggleZonasActivas: () => set((s) => ({ zonasActivas: !s.zonasActivas })),

    // --- CARGA DESDE SUPABASE ---
    cargarNodos: async () => {
        const { data, error } = await supabase
            .from('nodos')
            .select(`
                *,
                hotspots:hotspots!hotspots_nodo_origen_id_fkey(*),
                labels(*),
                zonas:zonas!zonas_nodo_origen_id_fkey(*)
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
                tipoIcono:    nodoDB.tipo || 'flechas',
                ui: {
                    titulo:    nodoDB.titulo,
                    categoria: nodoDB.categoria || 'General',       // ← columna nueva
                    miniatura: nodoDB.miniatura_url || nodoDB.foto_url,
                },
                hotspots: nodoDB.hotspots.map((h: any) => ({
                    id:       h.id,
                    destino:  h.nodo_destino_id,
                    posicion: { x: h.x, y: h.y, z: h.z },
                })),
                // ✅ CÓDIGO NUEVO (Pon este)
                labels: nodoDB.labels.map((l: any) => ({
                    id:       l.id,
                    texto_es: l.texto_es, // 👈 Extraemos el español
                    texto_en: l.texto_en, // 👈 Extraemos el inglés
                    target:   { x: l.x, y: l.y, z: l.z },
                    offset:   { x: 0, y: l.offset_y || 15, z: 0 },
                    hotspotId: l.hotspot_id || undefined,
                })),
                zonas: (nodoDB.zonas || []).map((z: any) => ({
                    id:       z.id,
                    destino:  z.nodo_destino_id,
                    nombre:   z.nombre,
                    color:    z.color || '#5CB82A',
                    puntos:   z.puntos || [],
                })),
                esPrincipal: !!nodoDB.es_principal,
            };
        });

        // Preferimos el nodo que venga explícito en la URL (?nodo=...); si no hay o no
        // existe, usamos el que esté marcado como "principal" desde el Explorador; si
        // nadie lo marcó, caemos en 'zibata' (o, en su defecto, el primero disponible).
        const params = new URLSearchParams(window.location.search);
        const nodoDeUrl = params.get('nodo');
        const nodoPrincipal = Object.keys(diccionarioNodos).find((id) => diccionarioNodos[id].esPrincipal);

        let nodoFinal = (nodoDeUrl && diccionarioNodos[nodoDeUrl]) ? nodoDeUrl : (nodoPrincipal || 'zibata');
        if (!diccionarioNodos[nodoFinal]) nodoFinal = Object.keys(diccionarioNodos)[0];

        // Si aterrizamos directo en una escena aérea (ej. al abrir la página), la recordamos
        // como punto de regreso para el botón "Volver a Vista Aérea"
        const esVistaAereaInicial = diccionarioNodos[nodoFinal]?.ui?.categoria === CATEGORIA_VISTA_AEREA;

        set({
            nodos: diccionarioNodos,
            nodoActual: nodoFinal,
            cargandoNodos: false,
            ...(esVistaAereaInicial ? { ultimoNodoAereo: nodoFinal } : {}),
        });
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
            .insert([{ nodo_origen_id: nodoOrigen, nodo_destino_id: nodoOrigen, x: 0, y: 0, z: -50, tipo: 'flechas' }]);
        if (!error) await get().cargarNodos();
    },

    actualizarPropiedadesHotspot: async (id, destino) => {
        // Optimista local: buscamos el hotspot en TODOS los nodos (puede no ser el activo, ej. desde el Explorador)
        const nodosActuales = { ...get().nodos };
        for (const nId of Object.keys(nodosActuales)) {
            const nodo = nodosActuales[nId];
            if (nodo.hotspots?.some((h: any) => h.id === id)) {
                nodosActuales[nId] = {
                    ...nodo,
                    hotspots: nodo.hotspots.map((h: any) => (h.id === id ? { ...h, destino } : h)),
                };
                break;
            }
        }
        set({ nodos: nodosActuales });
        // Nube
        const { error } = await supabase.from('hotspots').update({ nodo_destino_id: destino }).eq('id', id);
        if (error) console.error("Error al actualizar hotspot:", error);
    },

    // El ícono de un hotspot ya no se elige a mano: se hereda del tipo del nodo destino
    // (ver tipoIcono más abajo). Esta acción es la que fija ese tipo, una vez por nodo,
    // sin importar cuántos hotspots de otros nodos apunten hacia él.
    actualizarTipoIconoNodo: async (id, tipo) => {
        const nodosActuales = { ...get().nodos };
        if (nodosActuales[id]) {
            nodosActuales[id] = { ...nodosActuales[id], tipoIcono: tipo };
            set({ nodos: nodosActuales });
        }
        const { error } = await supabase.from('nodos').update({ tipo }).eq('id', id);
        if (error) console.error("Error al actualizar el tipo de ícono del nodo:", error);
    },

    borrarHotspot: async (id) => {
        const { error } = await supabase.from('hotspots').delete().eq('id', id);
        if (!error) {
            set({ hotspotSeleccionadoId: null });
            get().cargarNodos();
        }
    },

    // Agrega/actualiza/quita el label "atado" a un hotspot (vacío = el hotspot va solo).
    actualizarTextoHotspot: async (hotspotId, texto) => {
        const nodos = get().nodos;
        let nodoOrigenId: string | null = null;
        let hotspot: any = null;
        for (const nodo of Object.values(nodos)) {
            const encontrado = (nodo as any).hotspots?.find((h: any) => h.id === hotspotId);
            if (encontrado) {
                nodoOrigenId = Object.keys(nodos).find((k) => nodos[k] === nodo) || null;
                hotspot = encontrado;
                break;
            }
        }
        if (!hotspot || !nodoOrigenId) return;

        const labelExistente = Object.values(nodos)
            .flatMap((nodo: any) => nodo.labels || [])
            .find((l: any) => l.hotspotId === hotspotId);

        const textoLimpio = texto.trim();

        try {
            if (!textoLimpio) {
                if (labelExistente) {
                    const { error } = await supabase.from('labels').delete().eq('id', labelExistente.id);
                    if (error) throw error;
                }
            } else if (labelExistente) {
                const { error } = await supabase.from('labels')
                    .update({ texto_es: textoLimpio, texto_en: textoLimpio })
                    .eq('id', labelExistente.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('labels').insert([{
                    nodo_id: nodoOrigenId,
                    hotspot_id: hotspotId,
                    texto_es: textoLimpio,
                    texto_en: textoLimpio,
                    x: hotspot.posicion.x,
                    y: hotspot.posicion.y,
                    z: hotspot.posicion.z,
                    offset_y: 60,
                }]);
                if (error) throw error;
            }
            await get().cargarNodos();
        } catch (error) {
            console.error('Error al actualizar el texto del hotspot:', error);
        }
    },

    // --- EDITOR: ZONAS (polígonos clicables sobre la esfera) ---
    zonaSeleccionadaId: null,
    setZonaSeleccionadaId: (id) => set({ zonaSeleccionadaId: id, verticeZonaSeleccionado: null }),
    verticeZonaSeleccionado: null,
    setVerticeZonaSeleccionado: (indice) => set({ verticeZonaSeleccionado: indice }),
    dibujandoZona: false,
    setDibujandoZona: (val) => set({ dibujandoZona: val }),
    puntosZonaEnProceso: [],
    agregarPuntoZonaEnProceso: (x, y, z) => set((s) => ({ puntosZonaEnProceso: [...s.puntosZonaEnProceso, { x, y, z }] })),
    quitarUltimoPuntoZonaEnProceso: () => set((s) => ({ puntosZonaEnProceso: s.puntosZonaEnProceso.slice(0, -1) })),
    limpiarPuntosZonaEnProceso: () => set({ puntosZonaEnProceso: [], dibujandoZona: false }),

    guardarNuevaZona: async (nodoOrigenId, destino, nombre, color) => {
        const puntos = get().puntosZonaEnProceso;
        if (puntos.length < 3) return;
        const { error } = await supabase.from('zonas').insert([{
            nodo_origen_id: nodoOrigenId,
            nodo_destino_id: destino,
            nombre,
            color,
            puntos,
        }]);
        if (error) { console.error('Error al guardar la zona:', error); return; }
        set({ puntosZonaEnProceso: [], dibujandoZona: false });
        await get().cargarNodos();
    },

    actualizarPropiedadesZona: async (id, campo, valor) => {
        const columnMap: any = { destino: 'nodo_destino_id', nombre: 'nombre', color: 'color' };
        const nodosActuales = { ...get().nodos };
        for (const nId of Object.keys(nodosActuales)) {
            const nodo = nodosActuales[nId];
            if (nodo.zonas?.some((z: any) => z.id === id)) {
                nodosActuales[nId] = {
                    ...nodo,
                    zonas: nodo.zonas.map((z: any) => (z.id === id ? { ...z, [campo]: valor } : z)),
                };
                break;
            }
        }
        set({ nodos: nodosActuales });
        const { error } = await supabase.from('zonas').update({ [columnMap[campo] || campo]: valor }).eq('id', id);
        if (error) console.error('Error al actualizar zona:', error);
    },

    actualizarVerticeZona: async (id, indice, x, y, z) => {
        const nodos = get().nodos;
        let puntosNuevos: any = null;
        for (const nId of Object.keys(nodos)) {
            const zona = nodos[nId].zonas?.find((zz: any) => zz.id === id);
            if (zona) {
                puntosNuevos = zona.puntos.map((p: any, i: number) => (i === indice ? { x, y, z } : p));
                break;
            }
        }
        if (!puntosNuevos) return;
        // Optimista local
        const nodosActuales = { ...get().nodos };
        for (const nId of Object.keys(nodosActuales)) {
            const nodo = nodosActuales[nId];
            if (nodo.zonas?.some((zz: any) => zz.id === id)) {
                nodosActuales[nId] = {
                    ...nodo,
                    zonas: nodo.zonas.map((zz: any) => (zz.id === id ? { ...zz, puntos: puntosNuevos } : zz)),
                };
                break;
            }
        }
        set({ nodos: nodosActuales });
        const { error } = await supabase.from('zonas').update({ puntos: puntosNuevos }).eq('id', id);
        if (error) console.error('Error al actualizar vértice de zona:', error);
    },

    borrarZona: async (id) => {
        const { error } = await supabase.from('zonas').delete().eq('id', id);
        if (!error) {
            set({ zonaSeleccionadaId: null, verticeZonaSeleccionado: null });
            await get().cargarNodos();
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

    // Marca un nodo como el punto de inicio del recorrido (sin ?nodo= en la URL).
    // Solo puede haber uno: primero desmarcamos el anterior, luego marcamos el nuevo.
    marcarNodoPrincipal: async (id) => {
        const { error: errDesmarcar } = await supabase.from('nodos').update({ es_principal: false }).eq('es_principal', true);
        if (errDesmarcar) { console.error('Error al desmarcar el nodo principal anterior:', errDesmarcar); return; }

        const { error: errMarcar } = await supabase.from('nodos').update({ es_principal: true }).eq('id', id);
        if (errMarcar) { console.error('Error al marcar el nodo principal:', errMarcar); return; }

        await get().cargarNodos();
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

            // 2.5 Limpiar zonas que salen de este nodo o que otras zonas usan como destino
            const { error: errZonasOrigen } = await supabase.from('zonas').delete().eq('nodo_origen_id', id);
            if (errZonasOrigen) throw errZonasOrigen;
            const { error: errZonasDestino } = await supabase.from('zonas').delete().eq('nodo_destino_id', id);
            if (errZonasDestino) throw errZonasDestino;

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
                const nodosActualizados = get().nodos;
                const nodosRestantes = Object.keys(nodosActualizados);
                const nodoPrincipal = nodosRestantes.find((nId) => nodosActualizados[nId].esPrincipal);
                const siguienteNodo = nodoPrincipal || (nodosRestantes.includes('zibata') ? 'zibata' : nodosRestantes[0]);

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

    // Genera y sube la versión blur de una foto 360 YA existente (sin necesidad de volver a subirla).
    // Sirve para "rellenar" escenas antiguas que se crearon antes de tener esta función.
    generarBlurParaNodo: async (id) => {
        const nodo = get().nodos[id];
        if (!nodo?.archivo) return { ok: false, error: 'El nodo no tiene foto 360' };

        try {
            const respuesta = await fetch(nodo.archivo);
            if (!respuesta.ok) throw new Error('No se pudo descargar la foto original');
            const blob = await respuesta.blob();
            const archivoOriginal = new File([blob], 'original', { type: blob.type || 'image/webp' });

            const archivoBlur = await generarVersionBlur(archivoOriginal);
            const nombre = `${id}-360-blur-${Math.random().toString(36).substring(7)}.webp`;

            const { error: errUpload } = await supabase.storage.from('fotos_tour').upload(nombre, archivoBlur);
            if (errUpload) throw errUpload;
            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(nombre);

            const { error: errUpdate } = await supabase.from('nodos').update({ archivo_blur_url: data.publicUrl }).eq('id', id);
            if (errUpdate) throw errUpdate;

            return { ok: true };
        } catch (error: any) {
            console.error(`Error generando blur para ${id}:`, error);
            return { ok: false, error: error.message };
        }
    },

    // Genera y sube una miniatura real a partir de la foto 360 YA existente, para nodos que
    // se quedaron sin miniatura (y por eso su "miniatura" cae de vuelta a la foto completa).
    generarMiniaturaParaNodo: async (id) => {
        const nodo = get().nodos[id];
        if (!nodo?.archivo) return { ok: false, error: 'El nodo no tiene foto 360' };

        try {
            const respuesta = await fetch(nodo.archivo);
            if (!respuesta.ok) throw new Error('No se pudo descargar la foto original');
            const blob = await respuesta.blob();
            const archivoOriginal = new File([blob], 'original', { type: blob.type || 'image/webp' });

            const archivoMini = await convertirAWebP(archivoOriginal, { calidad: 0.75, maxAncho: 800, maxAlto: 600 });
            const nombre = `${id}-thumb-${Math.random().toString(36).substring(7)}.webp`;

            const { error: errUpload } = await supabase.storage.from('fotos_tour').upload(nombre, archivoMini);
            if (errUpload) throw errUpload;
            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(nombre);

            const { error: errUpdate } = await supabase.from('nodos').update({ miniatura_url: data.publicUrl }).eq('id', id);
            if (errUpdate) throw errUpdate;

            return { ok: true };
        } catch (error: any) {
            console.error(`Error generando miniatura para ${id}:`, error);
            return { ok: false, error: error.message };
        }
    },

    // Re-descarga la foto 360 YA subida y, si excede el tamaño máximo de textura seguro para
    // GPU (8192x4096), la reescala con buena calidad y la vuelve a subir. Sin esto, el navegador
    // hace ese mismo reescalado en tiempo real dentro del visor 3D, pero con un algoritmo básico
    // (Three.js: "Texture has been resized..."), lo que se ve granulado/borroso en el teléfono.
    reoptimizarFoto360ParaNodo: async (id) => {
        const nodo = get().nodos[id];
        if (!nodo?.archivo) return { ok: false, error: 'El nodo no tiene foto 360' };

        try {
            const respuesta = await fetch(nodo.archivo);
            if (!respuesta.ok) throw new Error('No se pudo descargar la foto original');
            const blob = await respuesta.blob();
            const archivoOriginal = new File([blob], 'original', { type: blob.type || 'image/webp' });

            const bitmap = await createImageBitmap(archivoOriginal);
            const yaEstaBien = bitmap.width <= 8192 && bitmap.height <= 4096;
            bitmap.close();
            if (yaEstaBien) return { ok: true, sinCambios: true };

            const archivoOptimizado = await convertirAWebP(archivoOriginal, { calidad: 0.85, maxAncho: 8192, maxAlto: 4096 });
            const nombre = `${id}-360-${Math.random().toString(36).substring(7)}.webp`;

            const { error: errUpload } = await supabase.storage.from('fotos_tour').upload(nombre, archivoOptimizado);
            if (errUpload) throw errUpload;
            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(nombre);

            const { error: errUpdate } = await supabase.from('nodos').update({ foto_url: data.publicUrl }).eq('id', id);
            if (errUpdate) throw errUpdate;

            return { ok: true };
        } catch (error: any) {
            console.error(`Error reoptimizando foto 360 para ${id}:`, error);
            return { ok: false, error: error.message };
        }
    },

    // --- NAVEGACIÓN ---
    setNodoActual: (id) => {
        const esVistaAerea = get().nodos[id]?.ui?.categoria === CATEGORIA_VISTA_AEREA;
        set({ nodoActual: id, zonasActivas: false, ...(esVistaAerea ? { ultimoNodoAereo: id } : {}) });
    },
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

        // Si el destino es una toma aérea, la recordamos como punto de regreso
        const esVistaAerea = nodosDB[id]?.ui?.categoria === CATEGORIA_VISTA_AEREA;

        set({
            isTransitioning: true, fadeActivo: true, menuAbierto: false, panelActivo: null,
            zonasActivas: false,
            ...(esVistaAerea ? { ultimoNodoAereo: id } : {}),
        });
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
    fovActual: 90, // FOV de reposo del tour (ver IntroAnimacion.tsx)
    setFovActual: (fov) => set({ fovActual: fov }),
    capturaAbierta: false,
    setCapturaAbierta: (val) => set({ capturaAbierta: val }),
}));