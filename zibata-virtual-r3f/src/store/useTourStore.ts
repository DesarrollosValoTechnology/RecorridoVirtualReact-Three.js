// src/store/useTourStore.ts
import { create } from 'zustand';
import { supabase } from '../supabase/client'; // 👈 Asegúrate de que la ruta sea correcta

// 🚨 Ahora solo leemos la URL, la validación estricta se hace DESPUÉS de descargar la base de datos
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

    // 🌟 LO NUEVO PARA LA BASE DE DATOS
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
    setPanelActivo: (val: 'contacto' | 'compartir' | 'ubicacion' | 'mapa' | null) => void; 
    
    toggleRotacion: () => void;
    cambiarIdioma: () => void;
    cargarNodo: (id: string) => void;
    
    tooltipHover: { titulo: string, miniatura: string, x: number, y: number } | null;
    setTooltipHover: (data: any) => void;

    adminPanelActivo: 'nuevoNodo' | 'editorHotspots' | null;
    setAdminPanelActivo: (panel: 'nuevoNodo' | 'editorHotspots' | null) => void;
}

export const useTourStore = create<TourState>((set, get) => ({

    // Dentro de tu store (create):
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

    // 🌟 ESTADOS INICIALES DE LA BASE DE DATOS
    nodos: {},
    cargandoNodos: true,

    // 🌟 EL TRADUCTOR DE SUPABASE
    cargarNodos: async () => {
        // 1. Descargamos todo de golpe usando relaciones
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

        // 2. Convertimos el Array de la BD al diccionario que tu app ama
        const diccionarioNodos: Record<string, any> = {};
        
        data.forEach((nodoDB) => {
            diccionarioNodos[nodoDB.id] = {
                tipo: 'foto', // Si luego usas video, lo metes a la BD
                archivo: nodoDB.foto_url,
                mapaX: nodoDB.mapa_x,
                mapaY: nodoDB.mapa_y,
                norteOffset: nodoDB.norte_offset,
                ui: { 
                    titulo: nodoDB.titulo, 
                    categoria: "Exteriores", // Puedes hacerlo dinámico después
                    miniatura: nodoDB.foto_url 
                },
                hotspots: nodoDB.hotspots.map((h: any) => ({
                    id: h.id, 
                    destino: h.nodo_destino_id,
                    tipo: h.tipo,
                    posicion: { x: h.x, y: h.y, z: h.z }
                })),
                labels: nodoDB.labels.map((l: any) => ({
                    id: l.id,
                    texto: l.texto,
                    target: { x: l.x, y: l.y, z: l.z },
                    offset: { x: 0, y: l.offset_y, z: 0 } // 🌟 Conectado a Supabase
                }))
            };
        });

        // 3. Validación de URL post-carga (Si pusieron basura en la URL, los mandamos a zibata)
        let nodoFinal = get().nodoActual;
        if (!diccionarioNodos[nodoFinal]) {
            nodoFinal = 'zibata';
        }

        // 4. Guardamos en el estado general
        set({ 
            nodos: diccionarioNodos, 
            nodoActual: nodoFinal,
            cargandoNodos: false 
        });
    },

    setNodoActual: (id) => set({ nodoActual: id }),
    setFadeActivo: (val) => set({ fadeActivo: val }),
    setIsTransitioning: (val) => set({ isTransitioning: val }),
    setLogoVisible: (val) => set({ logoVisible: val }),
    setLogoTranslucido: (val) => set({ logoTranslucido: val }),
    setMostrarElementos3D: (val) => set({ mostrarElementos3D: val }),
    setUserQuiereRotacion: (val) => set({ userQuiereRotacion: val }),
    setMenuAbierto: (val) => set({ menuAbierto: val }),
    setPanelActivo: (val) => set({ panelActivo: val }),

    toggleRotacion: () => set((state) => ({ userQuiereRotacion: !state.userQuiereRotacion })),
    cambiarIdioma: () => set((state) => ({ 
        idiomaActual: state.idiomaActual === 'es' ? 'en' : 'es' 
    })),

    cargarNodo: (id) => {
        if (get().isTransitioning || id === get().nodoActual) return;
        
        // 🚨 OJO AQUÍ: Ahora lee de get().nodos en lugar del archivo estático
        const nodosDB = get().nodos;
        const preloadImg = new Image();
        if(nodosDB[id]?.archivo) {
            preloadImg.src = nodosDB[id].archivo;
        }

        const nuevaUrl = new URL(window.location.href);
        nuevaUrl.searchParams.set('nodo', id);
        window.history.pushState({}, '', nuevaUrl);

        set({ 
            isTransitioning: true, 
            fadeActivo: true,
            menuAbierto: false,
            panelActivo: null
        });

        setTimeout(() => { set({ nodoActual: id }); }, 500);
    },
    
    setTooltipHover: (val) => set({ tooltipHover: val }),
}));