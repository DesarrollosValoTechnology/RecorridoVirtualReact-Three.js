// src/store/useTourStore.ts
import { create } from 'zustand';
import { nodosTour } from '../data/nodos';

// 🚨 1. VALIDACIÓN INICIAL DE LA URL (PUNTO 8) 🚨
// Si el nodo en la URL existe, lo devuelve. Si es basura o no existe, te manda a 'zibata'.
const getInitialNode = () => {
    const params = new URLSearchParams(window.location.search);
    const nodoUrl = params.get('nodo');

    if (nodoUrl && nodosTour[nodoUrl as keyof typeof nodosTour]) {
        return nodoUrl;
    }
    return 'zibata';
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
}

export const useTourStore = create<TourState>((set, get) => ({
    // 🚨 2. USAMOS LA FUNCIÓN SEGURA PARA ARRANCAR
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
        
        // 🚨 EL TRUCO MAGNÍFICO (Punto 1): PRE-CARGA DE IMAGEN
        // Mientras la pantalla se va poniendo negra (500ms), 
        // obligamos al navegador a empezar a descargar la foto en segundo plano.
        const preloadImg = new Image();
        preloadImg.src = (nodosTour as any)[id]?.archivo;

        // Actualizamos la URL dinámicamente
        const nuevaUrl = new URL(window.location.href);
        nuevaUrl.searchParams.set('nodo', id);
        window.history.pushState({}, '', nuevaUrl);

        // Activamos el fade y cerramos los menús
        set({ 
            isTransitioning: true, 
            fadeActivo: true,
            menuAbierto: false,
            panelActivo: null
        });

        // Exactamente a los 500ms (cuando la pantalla ya es 100% negra), 
        // cambiamos el nodo. Como ya pre-cargamos la foto arriba, será casi instantáneo.
        setTimeout(() => { set({ nodoActual: id }); }, 500);
    },
    
    setTooltipHover: (val) => set({ tooltipHover: val }),
}));