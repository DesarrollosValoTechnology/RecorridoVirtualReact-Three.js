// src/store/useTourStore.ts
import { create } from 'zustand';
import { nodosTour } from '../data/nodos';

// 🚨 ESTA LISTA DEBE ESTAR COMPLETA
interface TourState {
    nodoActual: string;
    isTransitioning: boolean;
    fadeActivo: boolean;
    logoVisible: boolean;
    logoTranslucido: boolean;
    mostrarElementos3D: boolean;
    userQuiereRotacion: boolean;
    idiomaActual: 'es' | 'en';
    
    // LAS QUE FALTABAN:
    menuAbierto: boolean; 
    panelActivo: 'contacto' | 'compartir' | 'ubicacion' | 'mapa' | null;

    setNodoActual: (id: string) => void;
    setFadeActivo: (val: boolean) => void;
    setIsTransitioning: (val: boolean) => void;
    setLogoVisible: (val: boolean) => void;
    setLogoTranslucido: (val: boolean) => void;
    setMostrarElementos3D: (val: boolean) => void;
    setUserQuiereRotacion: (val: boolean) => void;
    setMenuAbierto: (val: boolean) => void; // 🚨
    setPanelActivo: (val: 'contacto' | 'compartir' | 'ubicacion' | 'mapa' | null) => void; // 🚨
    
    toggleRotacion: () => void;
    cambiarIdioma: () => void;
    cargarNodo: (id: string) => void;
}

export const useTourStore = create<TourState>((set, get) => ({
    nodoActual: 'zibata',
    isTransitioning: false,
    fadeActivo: false,
    logoVisible: true,
    logoTranslucido: false,
    mostrarElementos3D: false,
    userQuiereRotacion: true,
    idiomaActual: 'es',
    menuAbierto: false,
    panelActivo: null,

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
        set({ isTransitioning: true, fadeActivo: true });
        setTimeout(() => { set({ nodoActual: id }); }, 500);
    },
}));