// src/components/OverlayUI.tsx
import { useEffect, useState } from 'react'; //
import { useTourStore } from '../store/useTourStore'; //
import { nodosTour } from '../data/nodos'; //
import SocialBar from './SocialBar'; //
import { xrStore } from '../store/xrStore'; //

export default function OverlayUI() {
    const store = useTourStore();
    const infoNodo = nodosTour[store.nodoActual];
    const idiomaActual = useTourStore(state => state.idiomaActual);
    const cambiarIdioma = useTourStore(state => state.cambiarIdioma);
    
    
    // 🚨 ESTADO PARA DETECTAR SOPORTE VR
    const [vrSupported, setVrSupported] = useState(false);

    useEffect(() => {
        // Verificamos si el navegador soporta VR (requiere HTTPS o localhost)
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                setVrSupported(supported);
            });
        }
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // Lógica para entrar a VR usando tu botón personalizado
    const entrarVR = async () => {
        if (!vrSupported) {
            console.warn("VR no soportado en este dispositivo/navegador.");
            return;
        }
        try {
            await xrStore.enterVR();
        } catch (error) {
            console.error("Error al entrar en VR:", error);
        }
    };

    // Se esconde durante la caída cinematográfica inicial
    if (!infoNodo || (store.isTransitioning && !store.mostrarElementos3D)) return null;

    return (
        <div id="ui-overlay">
            
            {/* 1. INFO NODO (Arriba Izquierda) */}
            <div 
                id="info-nodo-actual" 
                style={{ 
                    opacity: store.menuAbierto ? 0 : 1, 
                    transition: 'opacity 0.4s ease' 
                }}
            >
                <div id="info-titulo">{infoNodo.ui?.titulo || "Zibatá Vista Aérea"}</div>
                <div id="info-categoria">{infoNodo.ui?.categoria || "EXTERIORES ZIBATÁ"}</div>
            </div>

            {/* 2. BOTONES ACCIÓN (Arriba Derecha) */}
            <div className="ui-top-right">
                <div className="herramientas-pill">    
                    {/* 🚨 TU BOTÓN VR ORIGINAL CON LÓGICA DE SOPORTE */}
                    <button 
                        className="btn-icon" 
                        title="Realidad Virtual" 
                        onClick={entrarVR}
                        style={{ 
                            opacity: vrSupported ? 1 : 0.3, // Se sombreado si no hay soporte
                            cursor: vrSupported ? 'pointer' : 'default',
                            transition: 'opacity 0.3s ease'
                        }}
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
                        {/* Deja tu SVG intacto aquí */}
                        {idiomaActual === 'es' ? 'EN' : 'ES'}
                    </button>
                    <button className="btn-icon" onClick={() => store.setPanelActivo('compartir')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                    <button className="btn-icon" onClick={toggleFullscreen}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    </button>
                </div>
                <button className="btn-contacto" onClick={() => store.setPanelActivo('contacto')}>CONTACT US</button>
            </div>

            {/* 3. REDES SOCIALES */}
            <SocialBar />

            {/* 4. BARRA INFERIOR */}
            <div className="ui-bottom-bar-pill">
                <button onClick={() => store.setMenuAbierto(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    <span>MENU</span>
                </button>
                <button onClick={() => store.setPanelActivo('ubicacion')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>LOCATION</span>
                </button>
                <button onClick={() => store.setPanelActivo('mapa')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                    <span>MAP</span>
                </button>
            </div>
        </div>
    );
}