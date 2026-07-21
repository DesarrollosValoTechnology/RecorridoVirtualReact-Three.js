// src/components/OverlayUI.tsx
import { useRef, useState } from 'react';
import { useTourStore, CATEGORIA_VISTA_AEREA, CATEGORIA_ZIBATA, NODO_ZIBATA_ID } from '../store/useTourStore';
import SocialBar from './SocialBar';
import { diccionario } from '../data/diccionario';
import MapaBase from './MapaBase';
import { useClickAfuera } from '../utils/useClickAfuera';

// 🚨 1. LE DECIMOS A TYPESCRIPT QUÉ DATOS VAMOS A RECIBIR
interface OverlayProps {
    esAppEscritorio?: boolean;
    isAdmin?: boolean;
    onVolverAlMenu?: () => void;
}

// 🚨 2. RECIBIMOS LOS DATOS EN LA FUNCIÓN PRINCIPAL
export default function OverlayUI({ esAppEscritorio, isAdmin, onVolverAlMenu }: OverlayProps) {
    const store = useTourStore();
    // ✅ Leemos la info del nodo actual directamente del store (datos de Supabase)
    const nodos       = useTourStore((state) => state.nodos);
    const infoNodo    = nodos[store.nodoActual];
    const idiomaActual  = useTourStore((state) => state.idiomaActual);
    const cambiarIdioma = useTourStore((state) => state.cambiarIdioma);

    const t = diccionario[idiomaActual];

    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Barra de herramientas (arriba a la derecha): colapsable solo en móvil
    // (en escritorio la CSS ignora este estado y siempre se ve completa)
    const [herramientasAbiertas, setHerramientasAbiertas] = useState(false);
    const herramientasRef = useRef<HTMLDivElement>(null);
    useClickAfuera(herramientasRef, herramientasAbiertas, () => setHerramientasAbiertas(false));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // Se esconde durante la caída cinematográfica inicial y mientras se está encuadrando una captura
    if (!infoNodo || (store.isTransitioning && !store.mostrarElementos3D) || store.capturaAbierta) return null;

    const esVistaAerea = infoNodo.ui?.categoria === CATEGORIA_VISTA_AEREA;
    const esZibata      = infoNodo.ui?.categoria === CATEGORIA_ZIBATA;
    // No asumimos que el nodo de nivel "Zibatá" tenga por id literal 'zibata': lo buscamos
    // por categoría (con ese id como último respaldo, por si aún no cargaron los nodos).
    const nodoZibataId = Object.keys(nodos).find((id) => nodos[id]?.ui?.categoria === CATEGORIA_ZIBATA) || NODO_ZIBATA_ID;

    return (
        <div id="ui-overlay">

            {/* 🚨 3. EL NUEVO BOTÓN DE VOLVER (Solo aparece en la App Kiosco) 🚨 */}
            {esAppEscritorio && onVolverAlMenu && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, pointerEvents: 'auto' }}>
                    <button 
                        onClick={onVolverAlMenu}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(26, 26, 26, 0.85)',
                            backdropFilter: 'blur(10px)',
                            color: 'rgba(255, 255, 255, 0.95)',
                            padding: '10px 20px',
                            borderRadius: '9999px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.95)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.85)'}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        VOLVER AL MENÚ
                    </button>
                </div>
            )}

            {/* 1. INFO NODO (Arriba Izquierda) */}
            <div
                id="info-nodo-actual"
                style={{ 
                    opacity: store.menuAbierto ? 0 : 1, 
                    transition: 'opacity 0.4s ease',
                    /* 🚨 Empujamos el texto hacia abajo SI el botón de volver existe */
                    marginTop: esAppEscritorio ? '60px' : '0px'
                }}
            >
                <div id="info-titulo">{infoNodo.ui?.titulo    || t["UI_TITULO_DEFECTO"]}</div>
                <div id="info-categoria">{infoNodo.ui?.categoria || t["UI_CATEGORIA_DEFECTO"]}</div>
                {/* Fecha en que se tomaron las fotos 360 (solo escritorio: en móvil no hay espacio) */}
                <div id="info-fecha">{t["UI_FECHA_FOTOS"]}</div>
            </div>

            {/* 1.5 VOLVER A VISTA AÉREA (jerarquía de 3 niveles: Zibatá → Exteriores Zibatá →
                cualquier otro nodo. En "Zibatá" no hay nada más arriba, así que no se muestra.
                Desde "Exteriores Zibatá" sube al nodo Zibatá; desde cualquier otro nodo, sube
                al último nodo "Exteriores Zibatá" visitado. */}
            {!esZibata && (
                <button
                    id="btn-volver-aerea"
                    onClick={() => store.cargarNodo(esVistaAerea ? nodoZibataId : store.ultimoNodoAereo)}
                    style={{ opacity: store.menuAbierto ? 0 : 1, pointerEvents: store.menuAbierto ? 'none' : 'auto' }}
                    title="Volver a la vista aérea de dron"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 10 7 7"/><path d="m10 14-3 3"/><path d="m14 10 3-3"/><path d="m14 14 3 3"/>
                        <path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/><path d="M19.637 14a4 4 0 1 1-5.432 5.868"/>
                        <path d="M4.367 10a4 4 0 1 1 5.438-5.862"/><path d="M9.795 19.862a4 4 0 1 1-5.429-5.873"/>
                        <rect x="10" y="8" width="4" height="8" rx="1"/>
                    </svg>
                    <span>Volver a Vista Aérea</span>
                </button>
            )}

            {/* 1.6 ACTIVAR ZONAS (solo si este nodo tiene zonas/polígonos dibujados) */}
            {!!infoNodo.zonas?.length && (
                <button
                    id="btn-activar-zonas"
                    onClick={() => store.toggleZonasActivas()}
                    style={{ opacity: store.menuAbierto ? 0 : 1, pointerEvents: store.menuAbierto ? 'none' : 'auto' }}
                    title={store.zonasActivas ? 'Ocultar zonas y volver a la experiencia normal' : 'Ver y viajar por zonas de este mapa'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h20"/><path d="M12 2v20"/><path d="M12 2 2 7l10 5 10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
                    </svg>
                    <span>{store.zonasActivas ? 'Ocultar Zonas' : 'Iniciar experiencia'}</span>
                </button>
            )}

            {/* 2. BOTONES ACCIÓN (Arriba Derecha) */}
            <div className="ui-top-right" ref={herramientasRef}>
                <button
                    className="btn-icon btn-herramientas-toggle"
                    title="Más opciones"
                    onClick={() => setHerramientasAbiertas((v) => !v)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
                </button>
                <div className={`herramientas-pill ${herramientasAbiertas ? 'herramientas-abiertas' : ''}`}>
                    <button
                        className="btn-icon"
                        title="Tomar captura"
                        onClick={() => store.setCapturaAbierta(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                    </button>

                    <button className="btn-icon" onClick={store.toggleRotacion} title="Girar Cámara">
                        {store.userQuiereRotacion ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13"/><path d="M2 12h8.5"/><path d="M20 6V4a2 2 0 1 0-4 0v2"/><rect width="8" height="5" x="14" y="6" rx="1"/></svg>
                        )}
                    </button>

                    {!isAdmin && (
                        <button className="btn-icon" onClick={cambiarIdioma} title="Cambiar Idioma">
                            {idiomaActual === 'es' ? 'ES' : 'EN'}
                        </button>
                    )}

                    {!isAdmin && (
                        <button className="btn-icon" onClick={() => store.setPanelActivo('compartir')} title={t["UI_COMPARTIR_TITULO"]}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    )}

                    {!esIOS && !isAdmin && (
                        <button className="btn-icon" onClick={toggleFullscreen} title="Pantalla Completa">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                    )}
                </div>

                {!isAdmin && (
                    <button className="btn-contacto" onClick={() => store.setPanelActivo('contacto')}>
                        {t["UI_BTN_CONTACTO"]}
                    </button>
                )}
            </div>

            {/* 3. REDES SOCIALES (ocultas en modo admin) */}
            {!isAdmin && <SocialBar />}

            {/* 4. BARRA INFERIOR */}
            <div className="ui-bottom-bar-pill">
                <button onClick={() => store.setMenuAbierto(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    <span>{t["UI_BTN_MENU"]}</span>
                </button>
                <button onClick={() => store.setPanelActivo('ubicacion')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{t["UI_BTN_UBICACION"]}</span>
                </button>
                <button onClick={() => store.setPanelActivo('mapa')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                    <span>{t["UI_BTN_MAPA"]}</span>
                </button>
            </div>

            {/* 5. MINIMAPA GTA */}
            <MapaBase esMinimapa={true} />
        </div>
    );
}