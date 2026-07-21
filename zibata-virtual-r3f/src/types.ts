// src/types.ts

export type Idioma = 'es' | 'en';
export type TipoIcono =
    | 'flechas'
    | 'dron'
    | 'portico'
    | 'discovery-center'
    | 'anahuac'
    | 'bbva-prox'
    | 'golf'
    | 'heb'
    | 'walmart'
    | 'parques'
    | 'plazas-comerciales';

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
    id: string;          // ✅ Añadido: se usa en HotspotEditable, PanelEditorHotspots, etc.
    destino: string;
    posicion: IVector3;
    debug?: boolean;
}

export interface ILabel {
    id: string;          // ✅ Añadido: se usa en LabelEditable, PanelEditorLabels, etc.
    texto_es?: string;   // ✅ Renombrado: era "texto", ahora bilingüe
    texto_en?: string;   // ✅ Añadido: campo inglés
    target: IVector3;
    offset: IVector3;
    hotspotId?: string;  // Si viene de un hotspot (texto agregado desde su editor), su id
}

export interface IZona {
    id: string;
    destino: string;
    nombre?: string;
    color: string;
    puntos: IVector3[]; // vértices ordenados del polígono, sobre la superficie de la esfera
}

export interface INodo {
    tipo: 'foto';
    tipoIcono: TipoIcono;
    archivo: string;
    archivoBlur?: string;
    lat?: number;
    lng?: number;
    mapaX?: number;
    mapaY?: number;
    norteOffset?: number;
    solPos?: IVector3;
    ui?: IUIInfo;
    hotspots?: IHotspot[];
    labels?: ILabel[];
    zonas?: IZona[];
    esPrincipal?: boolean;
}

export interface INodosTour {
    [id: string]: INodo;
}