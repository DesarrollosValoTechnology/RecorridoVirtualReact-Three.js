// src/components/MenuPrevio.tsx
import { useState, useEffect, useRef } from 'react';
import './MenuPrevio.css'; 

interface MenuPrevioProps {
    onIrAlRecorrido: () => void;
    onIrAGaleria: () => void;
    onIrAShowroomUnity: () => void;
    onIrASimulador: () => void;
}

export default function MenuPrevio({ onIrAlRecorrido, onIrAGaleria, onIrAShowroomUnity, onIrASimulador }: MenuPrevioProps) {
    const [animacionSalida, setAnimacionSalida] = useState(false);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    
    // 👇 borrar esto de wix 👇
    const [mostrarInversion, setMostrarInversion] = useState(false);
    // 👆 hasta aqui 👆

    const mapRef = useRef<HTMLDivElement>(null);
    // 🚨 1. Referencia para controlar el video de fondo
    const videoRef = useRef<HTMLVideoElement>(null); 

    const manejarClic = (destino: () => void) => {
        setAnimacionSalida(true);
        setTimeout(() => {
            destino();
        }, 500); 
    };

    // 🚨 2. EFECTO PARA PAUSAR/REPRODUCIR EL VIDEO (AHORRO DE RECURSOS)
    useEffect(() => {
        if (videoRef.current) {
            // 👇 borrar esto de wix (agregamos mostrarInversion a la condición) 👇
            if (mostrarMapa || mostrarInversion) {
                videoRef.current.pause(); // Pausa el video si algún modal está abierto
            } else {
                videoRef.current.play().catch(err => console.log("Video play bloqueado:", err)); // Reanuda al cerrar
            }
            // 👆 hasta aqui 👆
        }
    }, [mostrarMapa, mostrarInversion]); // <-- También lo agregamos a las dependencias aquí

// 🚨 3. INICIALIZAR GOOGLE MAPS CON RETRASO DE ANIMACIÓN
    useEffect(() => {
        if (mostrarMapa && mapRef.current) {
            const google = (window as any).google;
            if (google && google.maps) {
                
                // Definimos tu paleta oscura corporativa aquí mismo
                const estiloOscuro = [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] }
                ];

                // Esperamos 600ms a que la animación CSS termine
                const timer = setTimeout(() => {
                    new google.maps.Map(mapRef.current!, {
                        center: { lat: 20.6710, lng: -100.3260 }, 
                        zoom: 14.5,
                        // 🚨 Magia de optimización: Mapa vectorial plano
                        mapTypeId: 'roadmap', 
                        // 🚨 Inyectamos el estilo oscuro
                        styles: estiloOscuro,
                        disableDefaultUI: false,
                        streetViewControl: true, // El monito sigue vivo
                        mapTypeControl: false,
                        tilt: 0, // Apaga edificios 3D para salvar RAM
                        maxZoom: 20 // Límite seguro
                    });
                }, 600);

                return () => clearTimeout(timer);
            }
        }
    }, [mostrarMapa]);

    return (
        <div className={`menu-kiosco-wrapper ${animacionSalida ? 'oculto' : ''}`}>
            
            {/* EL VIDEO DE FONDO (Ahora con videoRef asignado) */}
            <video 
                ref={videoRef}
                src="/Assets/videoZibata.remuxed.mp4"
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    objectFit: 'cover', zIndex: -1, filter: 'brightness(0.85)'
                }}
            />

            {/* PANEL IZQUIERDO */}
            <div className="menu-left-panel">
                <img src="/Assets/logo_supraterra.png" alt="Supraterra" className="menu-logo" />
                <img src="/Assets/Recurso 3.png" alt="Fraccionamientos" className="cintillo-logos" />
            </div>

{/* PANEL DERECHO */}
            <div className="menu-right-panel">
                <button className="menu-grid-btn" onClick={() => manejarClic(onIrAGaleria)}>Desarrollo</button>
                
                {/* 🚨 Cambiamos la función a Master Plan para que abra el recorrido 3D */}
                <button className="menu-grid-btn" onClick={() => manejarClic(onIrAlRecorrido)}>Master Plan</button>
                
                <button className="menu-grid-btn" onClick={() => setMostrarMapa(true)}>Ubicación</button>
                <button className="menu-grid-btn" onClick={() => manejarClic(onIrAShowroomUnity)}>Show Room</button>
                
                {/* 👇 borrar esto de wix 👇 */}
                <button className="menu-grid-btn" onClick={() => setMostrarInversion(true)}>Inversión</button>
                {/* 👆 hasta aqui 👆 */}

                <button className="menu-grid-btn"onClick={() => manejarClic(onIrASimulador)}>Simulador</button>
            </div>

            {/* POP-UP DE UBICACIÓN */}
            <div className={`modal-ubicacion-overlay ${mostrarMapa ? 'activo' : ''}`} onClick={() => setMostrarMapa(false)}>
                <div className="modal-ubicacion-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-ubicacion-header">
                        <h2 className="modal-ubicacion-titulo">Ubicación estratégica</h2>
                        <button className="btn-cerrar-modal" onClick={() => setMostrarMapa(false)}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div className="modal-ubicacion-body">
                        <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            </div>

{/* 👇 borrar esto de wix 👇 */}
            {/* POP-UP DE INVERSIÓN (IFRAME WIX) */}
            <div className={`modal-ubicacion-overlay ${mostrarInversion ? 'activo' : ''}`} onClick={() => setMostrarInversion(false)}>
                <div className="modal-ubicacion-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    <div className="modal-ubicacion-header" style={{ padding: '20px 30px', backgroundColor: 'rgba(15, 15, 15, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 className="modal-ubicacion-titulo">Oferta Inmobiliaria</h2>
                        <button className="btn-cerrar-modal" onClick={() => setMostrarInversion(false)}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    {/* 🚨 Agregamos position: relative aquí para que la manita flote dentro de esta caja */}
                    <div className="modal-ubicacion-body" style={{ flex: 1, padding: 0, position: 'relative' }}>
                        
                        {/* 👇 borrar esto de wix (overlay manita) 👇 */}
                        <div className="indicador-scroll-overlay">
                            {/* SVG minimalista de una mano apuntando */}
                            <svg className="icono-manita" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.5V6.5a1.5 1.5 0 00-3 0v8m0-8V5a1.5 1.5 0 00-3 0v8m0-8V4.5a1.5 1.5 0 00-3 0v10.512c0 .413-.083.82-.24 1.196l-1.465 3.515a2.25 2.25 0 002.08 3.127h8.25a2.25 2.25 0 002.25-2.25v-4.521c0-.414-.084-.82-.241-1.196l-1.07-2.569A3 3 0 0015 14.33V11.5z" />
                            </svg>
                            <span className="texto-scroll">Desliza</span>
                        </div>
                        {/* 👆 hasta aqui 👆 */}

                        <iframe 
                            src="https://intoxmediaagency.wixstudio.com/zibata-home/oferta-inmobiliaria-terrenos-comercial-residencial-zibata"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Oferta Inmobiliaria Zibatá"
                        />
                    </div>
                </div>
            </div>
            {/* 👆 hasta aqui 👆 */}

        </div>
    );
}