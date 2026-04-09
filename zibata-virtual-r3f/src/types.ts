// src/types.ts

// Tipos básicos para evitar errores de tipeo
export type Idioma = 'es' | 'en';
export type TipoIcono = 'drone' | 'casa' | 'pasos' | 'persona' | 'info';

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IUIInfo {
    categoria: string;
    titulo: string;
    miniatura: string;
}

export interface IHotspot {
    destino: string;
    tipo: TipoIcono;
    posicion: IVector3;
    debug?: boolean; // Ya lo tenías, ¡perfecto!
}

export interface ILabel {
    texto: string;
    target: IVector3;
    offset: IVector3;
}

// El contrato maestro de cómo debe ser un Nodo
export interface INodo {
    tipo: 'foto';
    archivo: string;
    lat: number;
    lng: number;
    norteOffset?: number;
    solPos?: IVector3;
    ui?: IUIInfo;
    hotspots?: IHotspot[];
    labels?: ILabel[];
}

// Diccionario que agrupa todos los nodos
export interface INodosTour {
    [id: string]: INodo;
}