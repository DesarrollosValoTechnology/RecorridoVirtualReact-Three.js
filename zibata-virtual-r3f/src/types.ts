// src/types.ts

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
    id: string;          // ✅ Añadido: se usa en HotspotEditable, PanelEditorHotspots, etc.
    destino: string;
    tipo: TipoIcono;
    posicion: IVector3;
    debug?: boolean;
}

export interface ILabel {
    id: string;          // ✅ Añadido: se usa en LabelEditable, PanelEditorLabels, etc.
    texto_es?: string;   // ✅ Renombrado: era "texto", ahora bilingüe
    texto_en?: string;   // ✅ Añadido: campo inglés
    target: IVector3;
    offset: IVector3;
}

export interface INodo {
    tipo: 'foto';
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
}

export interface INodosTour {
    [id: string]: INodo;
}