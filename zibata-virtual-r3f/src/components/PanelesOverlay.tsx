// src/components/PanelesOverlay.tsx
import { useEffect, useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import { abrirMapaInteractivo } from '../utils/mapaRadar';
import FormularioContacto from './FormularioContacto';
import { diccionario } from '../data/diccionario';
import MapaBase from './MapaBase';

export default function PanelesOverlay() {
    const store = useTourStore();
    // ✅ Leemos los nodos desde el store (Supabase), sin archivo estático
    const nodos = useTourStore((state) => state.nodos);

    const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});
    const [copiado, setCopiado] = useState(false);

    const t = diccionario[store.idiomaActual];

    const cerrarMenu  = () => store.setMenuAbierto(false);
    const cerrarPanel = () => store.setPanelActivo(null);

    useEffect(() => {
        if (store.panelActivo === 'ubicacion') abrirMapaInteractivo();
    }, [store.panelActivo]);

    // ✅ Agrupamos por categoría usando los nodos del store
    const categorias = Object.entries(nodos).reduce((acc: any, [id, info]) => {
        const cat = info.ui?.categoria || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({ id, ...info.ui });
        return acc;
    }, {});

    const toggleCategoria = (nombreCat: string) => {
        setCategoriasExpandidas(prev => ({ ...prev, [nombreCat]: prev[nombreCat] === false ? true : false }));
    };

    return (
        <>
            {/* 1. PANEL: MENÚ */}
            <div className={`panel-generico ${store.menuAbierto ? '' : 'oculto'}`} onClick={cerrarMenu}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarMenu}>✖</button>
                    <h2 className="form-title">{t["UI_MENU_ZONAS"]}</h2>

                    <div className="menu-contenido" style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '10px' }}>
                        {Object.entries(categorias).map(([nombreCat, nodosCategoria]: any) => {
                            const estaAbierta = categoriasExpandidas[nombreCat] !== false;

                            return (
                                <div key={nombreCat} className="categoria-seccion">
                                    <button className="btn-categoria-limpio" onClick={() => toggleCategoria(nombreCat)}>
                                        <span className="cat-icono">{estaAbierta ? '▼' : '▶'}</span>
                                        <span className="cat-nombre">{nombreCat}</span>
                                        <span className="cat-linea"></span>
                                    </button>

                                    <div className={`rejilla-nodos ${estaAbierta ? '' : 'colapsada'}`}>
                                        {nodosCategoria.map((nodo: any) => (
                                            <div
                                                key={nodo.id}
                                                className={`tarjeta-nodo ${store.nodoActual === nodo.id ? 'activa' : ''}`}
                                                onClick={() => { store.cargarNodo(nodo.id); cerrarMenu(); }}
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

            {/* 2. PANEL: MAPA */}
            <div className={`panel-generico ${store.panelActivo === 'mapa' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <h2 className="form-title">{t["UI_MAPA_TITULO"]}</h2>
                    <div style={{ width: '100%', height: '65vh', position: 'relative', overflow: 'hidden', borderRadius: '12px', marginTop: '15px' }}>
                        {store.panelActivo === 'mapa' && <MapaBase esMinimapa={false} />}
                    </div>
                </div>
            </div>

            {/* 3. PANEL: UBICACIÓN (Google Maps satélital) */}
            <div className={`panel-generico ${store.panelActivo === 'ubicacion' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido map-container" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>

                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', position: 'relative' }}>
                        <div className="map-premium-controls">
                            <button className="btn-map-style active" data-style="satelite">{t["UI_MAPA_SATELITE"] || "Satélite"}</button>
                            <button className="btn-map-style" data-style="hibrido">{t["UI_MAPA_HIBRIDO"]  || "Híbrido"}</button>
                            <button className="btn-map-style" data-style="normal">{t["UI_MAPA_PLANO"]   || "Plano"}</button>
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
            </div>

            {/* 4. PANEL: CONTACTO */}
            <div className={`panel-generico ${store.panelActivo === 'contacto' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <div style={{ overflowY: 'auto', maxHeight: '85vh', paddingRight: '10px' }}>
                        <h2 className="form-title" style={{ textAlign: 'center' }}>{t["UI_CONTACTO_TITULO"]}</h2>
                        <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>{t["UI_CONTACTO_SUB"]}</p>
                        <FormularioContacto />
                    </div>
                </div>
            </div>

            {/* 5. PANEL: COMPARTIR */}
            <div className={`panel-generico ${store.panelActivo === 'compartir' ? '' : 'oculto'}`} onClick={cerrarPanel}>
                <div className="panel-contenido" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-cerrar-panel" onClick={cerrarPanel}>✖</button>
                    <h2 className="form-title" style={{ textAlign: 'center' }}>{t["UI_COMPARTIR_TITULO"]}</h2>
                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{t["UI_COMPARTIR_SUB"]}</p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}${window.location.pathname}?nodo=${store.nodoActual}`}
                            style={{ flexGrow: 1, padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?nodo=${store.nodoActual}`);
                                setCopiado(true);
                                setTimeout(() => setCopiado(false), 2000);
                            }}
                            style={{ background: 'var(--zibata-verde)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                        >
                            {copiado ? t["UI_COPIADO"] : t["UI_COPIAR"]}
                        </button>
                    </div>

                    <div style={{ marginTop: '12px', color: 'var(--zibata-verde)', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', opacity: copiado ? 1 : 0, transition: 'opacity 0.3s' }}>
                        {t["UI_MENSAJE_COPIADO"]}
                    </div>
                </div>
            </div>
        </>
    );
}