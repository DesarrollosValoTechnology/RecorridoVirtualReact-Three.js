// src/data/nodos.ts
import type { INodosTour } from '../types';

export const nodosTour: INodosTour = {
    // 1. NODO INICIAL (Vista Aérea General)
    "zibata": {
        tipo: "foto",
        archivo: "/Assets/zibata.webp",
        // 🚨 TUS COORDENADAS REALES DE INICIO 🚨
        lat: 20.676716850667205,
        lng: -100.33542417900068,
        // 🚨 NUEVO: CALIBRADOR DE BRÚJULA (En grados) 🚨
        norteOffset: 118.25,
        solPos: { x: 308, y: 308, z: 4 },
        ui: {
            categoria: "Exteriores Zibatá",
            titulo: "Zibatá Vista Aerea",
            miniatura: "/Assets/zibata_mini.jpeg"
        },
        hotspots: [
            { destino: "jamadi", tipo: "drone", posicion: { x: -10, y: -50, z: -30 } /*debug: true*/ },
            { destino: "discovery", tipo: "pasos", posicion: { x: -95, y: -80, z: -230 } }
        ],
        labels: [
            { 
                texto: "LBL_ENTRADA", 
                target: { x: -40, y: -60, z: -150 }, 
                offset: { x: 0, y: 120, z: 0 }      
            },
            { 
                texto: "LBL_CARRETERA", //Fray Junipero
                target: { x: 450, y: -130, z: -80 },
                offset: { x: 0, y: 45, z: 0 } 
            },
            { 
                texto: "LBL_CARRETERA2", //Chichimequillas
                target: { x: -150, y: -130, z: 580 },
                offset: { x: 0, y: 45, z: 0 }      
            },
            { 
                texto: "LBL_COLEGIO", //Colegio Newland
                target: { x: -65, y: -130, z: 170 },
                offset: { x: 0, y: 45, z: 0 }   
            },
            { 
                texto: "LBL_PLAZA2", //Plaza Centro Z
                target: { x: -40, y: -130, z: 170 },
                offset: { x: 0, y: 120, z: 0 }    
            },
            { 
                texto: "LBL_CARRETERA3", //Libramiento
                target: { x: -240, y: -130, z: -600 },
                offset: { x: 0, y: 150, z: 0 }    
            },
            { 
                texto: "LBL_SUPER", 
                target: { x: -120, y: -130, z: -255 },
                offset: { x: 0, y: 10, z: 0 }      
            },
            { 
                texto: "LBL_PLAZA", 
                target: { x: -90, y: -100, z: -255 },
                offset: { x: 0, y: 90, z: 0 }
            }
        ]
    },

    // 2. PARQUE JAMADI
    "jamadi": {
        tipo: "foto",
        archivo: "/Assets/foto_jamadi.jpg", 
        lat: 20.677500,
        lng: -100.335400,
        ui: {
            categoria: "Amenidades",
            titulo: "Parque Jamadi",
            miniatura: "/Assets/jamadi_miniatura.webp" 
        },
        hotspots: [
            { destino: "zibata", tipo: "persona", posicion: { x: 100, y: -20, z: 50 } },
            { destino: "discovery", tipo: "casa", posicion: { x: -120, y: -10, z: -40 } }
        ],
        labels: [
            { 
                texto: "Área de Juegos Jamadi", 
                target: { x: -150, y: -5, z: -30 }, 
                offset: { x: 0, y: 12, z: 0 }
            }
        ]
    },

    // 3. Discovery
    "discovery": {
        tipo: "foto",
        archivo: "/Assets/Discovery.png", 
        lat: 20.675413,
        lng: -100.321751,
        ui: {
            categoria: "Amenidades",
            titulo: "Discovery",
            miniatura: "/Assets/discovery_mini.jpg" 
        },
        hotspots: [
            { destino: "jamadi", tipo: "persona", posicion: { x: -50, y: -10, z: 150 } },
            { destino: "discoveryprincipal", tipo: "pasos", posicion: { x: 20, y: -10, z: -100 } }
        ],
        labels: [
            { 
                texto: "Modelo Base - 120m²", 
                target: { x: 10, y: -20, z: -90 }, 
                offset: { x: 0, y: 20, z: 0 }
            }
        ]
    },

    // 4. INTERIOR DISCOVERY
    "discoveryprincipal": {
        tipo: "foto",
        archivo: "/Assets/DiscoveryPrincipal.png", 
        lat: 20.675910,
        lng: -100.334010,
        hotspots: [
            { destino: "discovery", tipo: "persona", posicion: { x: 0, y: -40, z: 120 } }
        ],
        labels: [
            { 
                texto: "LBL_COWORKING", 
                target: { x: 40, y: -10, z: 50 }, 
                offset: { x: 0, y: 10, z: 0 }
            }
        ]
    },

    // 5. CASA CLUB
    "casa_club": {
        tipo: "foto",
        archivo: "/Assets/casaclub.jpeg", 
        lat: 20.676500,
        lng: -100.337000,
        ui: {
            categoria: "Amenidades",
            titulo: "Casa Club Principal",
            miniatura: "/Assets/thumb_casaclub.png" 
        },
        hotspots: [
            { destino: "zibata", tipo: "persona", posicion: { x: -100, y: -20, z: -50 } },
            { destino: "cancha_padel", tipo: "persona", posicion: { x: 150, y: -10, z: 20 } }
        ],
        labels: [
            { 
                texto: "Alberca Semi-Olímpica", 
                target: { x: -40, y: -15, z: 80 }, 
                offset: { x: 0, y: 15, z: 0 }
            }
        ]
    },

    // 6. CANCHAS DE PÁDEL
    "cancha_padel": {
        tipo: "foto",
        archivo: "/assets/padel.jpeg", 
        lat: 20.676300,
        lng: -100.337200,
        ui: {
            categoria: "Amenidades",
            titulo: "Canchas de Pádel",
            miniatura: "/Assets/thumb_padel.png" 
        },
        hotspots: [
            { destino: "casa_club", tipo: "casa", posicion: { x: -80, y: -15, z: 100 } }
        ],
        labels: [
            { 
                texto: "Cancha Profesional de Pádel", 
                target: { x: 20, y: -10, z: -50 }, 
                offset: { x: 0, y: 12, z: 0 }
            }
        ]
    }
};