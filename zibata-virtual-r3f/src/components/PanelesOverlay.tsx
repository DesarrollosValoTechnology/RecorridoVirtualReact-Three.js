// src/components/PanelesOverlay.tsx
import { useEffect, useState } from 'react'; // 🚨 Agregamos useState
import { useTourStore } from '../store/useTourStore';
import { nodosTour } from '../data/nodos';
import { abrirMapaInteractivo } from '../utils/mapaRadar';

export default function PanelesOverlay() {
    const store = useTourStore();
    
    // 🚨 Estado para controlar qué acordeones están abiertos
    const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});

    const cerrarMenu = () => store.setMenuAbierto(false);
    const cerrarPanel = () => store.setPanelActivo(null);

    useEffect(() => {
        if (store.panelActivo === 'ubicacion') {
            abrirMapaInteractivo();
        }
    }, [store.panelActivo]);

    // Agrupar nodos
    const categorias = Object.entries(nodosTour).reduce((acc: any, [id, info]) => {
        const cat = info.ui?.categoria || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({ id, ...info.ui });
        return acc;
    }, {});

    // 🚨 Función para abrir/cerrar categorías
    const toggleCategoria = (nombreCat: string) => {
        setCategoriasExpandidas(prev => ({
            ...prev,
            [nombreCat]: prev[nombreCat] === false ? true : false
        }));
    };

    return (
        <>
            {/* 1. PANEL: MENÚ */}
            <div className={`panel-generico ${store.menuAbierto ? '' : 'oculto'}`} onClick={cerrarMenu}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarMenu}>✖</button>
                    <h2 className="form-title">Zonas del Recorrido</h2>
                    
                    <div className="menu-contenido" style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '10px' }}>
                        {Object.entries(categorias).map(([nombreCat, nodos]: any) => {
                            // Por defecto están abiertas (true) a menos que se hayan cerrado explícitamente (false)
                            const estaAbierta = categoriasExpandidas[nombreCat] !== false; 

                            return (
                                <div key={nombreCat} className="categoria-seccion">
                                    {/* 🚨 NUEVO BOTÓN DE CATEGORÍA ESTILO HEADER ACORDEÓN */}
                                    <button 
                                        className="btn-categoria-limpio" 
                                        onClick={() => toggleCategoria(nombreCat)}
                                    >
                                        <span className="cat-icono">{estaAbierta ? '▼' : '▶'}</span>
                                        <span className="cat-nombre">{nombreCat}</span>
                                        <span className="cat-linea"></span>
                                    </button>

                                    {/* 🚨 LA REJILLA AHORA RESPONDE AL ESTADO */}
                                    <div className={`rejilla-nodos ${estaAbierta ? '' : 'colapsada'}`}>
                                        {nodos.map((nodo: any) => (
                                            <div 
                                                key={nodo.id} 
                                                className={`tarjeta-nodo ${store.nodoActual === nodo.id ? 'activa' : ''}`}
                                                onClick={() => {
                                                    store.cargarNodo(nodo.id);
                                                    cerrarMenu();
                                                }}
                                            >
                                                <img src={nodo.miniatura} alt={nodo.titulo} loading="lazy" />
                                                <span>{nodo.titulo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ... LOS DEMÁS PANELES QUEDAN EXACTAMENTE IGUAL ... */}
            {/* 2. PANEL: MAPA */}
            <div className={`panel-generico ${store.panelActivo === 'mapa' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <h2 className="form-title">Interactive Map</h2>
                    <p style={{ color: '#ccc' }}>Coming soon...</p>
                </div>
            </div>

            {/* 3. PANEL: LOCATION */}
            <div className={`panel-generico ${store.panelActivo === 'ubicacion' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <div className="map-premium-controls">
                        <button className="btn-map-style active" data-style="satelite">Satélite</button>
                        <button className="btn-map-style" data-style="hibrido">Híbrido</button>
                        <button className="btn-map-style" data-style="normal">Plano</button>
                    </div>
                    <div id="mapa-satelital" style={{ width: '100%', height: '100%' }}></div>
                    <div id="contenedor-iconos-mapa" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}></div>
                    <div id="punto-central-radar" style={{ position: 'absolute', width: '12px', height: '12px', background: 'white', borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 5 }}></div>
                    <svg id="cono-radar-svg" width="6000" height="6000" style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'center center', pointerEvents: 'none', zIndex: 2 }}>
                        <path id="cono-radar-path" d="" fill="transparent" />
                    </svg>
                    <div id="tooltip-preview">
                        <img id="img-preview" src={undefined} alt="preview" />
                        <span id="titulo-preview"></span>
                    </div>
                </div>
            </div>

            {/* 4. PANEL: CONTACTO */}
            <div className={`panel-generico ${store.panelActivo === 'contacto' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <h2 className="form-title">Contact Us</h2>
                    <p style={{ color: '#ccc' }}>Formulario de contacto pronto...</p>
                </div>
            </div>

            {/* 5. PANEL: COMPARTIR */}
            <div className={`panel-generico ${store.panelActivo === 'compartir' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <h2 className="form-title">Share this Tour</h2>
                    <p style={{ color: '#ccc' }}>Opciones de compartir pronto...</p>
                </div>
            </div>
        </>
    );
}