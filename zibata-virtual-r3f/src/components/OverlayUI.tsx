// src/components/OverlayUI.tsx
import { useEffect, useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import SocialBar from './SocialBar';
import { xrStore } from '../store/xrStore';
import { diccionario } from '../data/diccionario';
import MapaBase from './MapaBase';

// 🚨 1. LE DECIMOS A TYPESCRIPT QUÉ DATOS VAMOS A RECIBIR
interface OverlayProps {
    esAppEscritorio?: boolean;
    onVolverAlMenu?: () => void;
}

// 🚨 2. RECIBIMOS LOS DATOS EN LA FUNCIÓN PRINCIPAL
export default function OverlayUI({ esAppEscritorio, onVolverAlMenu }: OverlayProps) {
    const store = useTourStore();
    // ✅ Leemos la info del nodo actual directamente del store (datos de Supabase)
    const nodos       = useTourStore((state) => state.nodos);
    const infoNodo    = nodos[store.nodoActual];
    const idiomaActual  = useTourStore((state) => state.idiomaActual);
    const cambiarIdioma = useTourStore((state) => state.cambiarIdioma);

    const t = diccionario[idiomaActual];

    const [vrSupported, setVrSupported] = useState(false);
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    useEffect(() => {
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(setVrSupported);
        }
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const entrarVR = async () => {
        if (!vrSupported) return;
        try { await xrStore.enterVR(); }
        catch (error) { console.error("Error al entrar en VR:", error); }
    };

    // Se esconde durante la caída cinematográfica inicial
    if (!infoNodo || (store.isTransitioning && !store.mostrarElementos3D)) return null;

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
            </div>

            {/* 2. BOTONES ACCIÓN (Arriba Derecha) */}
            <div className="ui-top-right">
                <div className="herramientas-pill">
                    <button
                        className="btn-icon"
                        title="Realidad Virtual"
                        onClick={entrarVR}
                        style={{ opacity: vrSupported ? 1 : 0.3, cursor: vrSupported ? 'pointer' : 'default', transition: 'opacity 0.3s ease' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="11" rx="2"></rect>
                            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                        </svg>
                    </button>

                    <button className="btn-icon" onClick={store.toggleRotacion} title="Girar Cámara">
                        {store.userQuiereRotacion ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                        )}
                    </button>

                    <button className="btn-icon" onClick={cambiarIdioma} title="Cambiar Idioma">
                        {idiomaActual === 'es' ? 'EN' : 'ES'}
                    </button>

                    <button className="btn-icon" onClick={() => store.setPanelActivo('compartir')} title={t["UI_COMPARTIR_TITULO"]}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>

                    {!esIOS && (
                        <button className="btn-icon" onClick={toggleFullscreen} title="Pantalla Completa">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                    )}
                </div>

                <button className="btn-contacto" onClick={() => store.setPanelActivo('contacto')}>
                    {t["UI_BTN_CONTACTO"]}
                </button>
            </div>

            {/* 3. REDES SOCIALES */}
            <SocialBar />

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