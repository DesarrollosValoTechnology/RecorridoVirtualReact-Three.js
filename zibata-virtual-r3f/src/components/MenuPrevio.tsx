// src/components/MenuPrevio.tsx
import { useState, useEffect, useRef } from 'react';
import './MenuPrevio.css'; 

interface MenuPrevioProps {
    onIrAlRecorrido: () => void;
    onIrAGaleria: () => void;
    onIrAShowroomUnity: () => void;
}

export default function MenuPrevio({ onIrAlRecorrido, onIrAGaleria, onIrAShowroomUnity }: MenuPrevioProps) {
    const [animacionSalida, setAnimacionSalida] = useState(false);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    
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
            if (mostrarMapa) {
                videoRef.current.pause(); // Pausa el video si el modal está abierto
            } else {
                videoRef.current.play().catch(err => console.log("Video play bloqueado:", err)); // Reanuda al cerrar
            }
        }
    }, [mostrarMapa]);

    // 🚨 3. INICIALIZAR GOOGLE MAPS CON RETRASO DE ANIMACIÓN
    useEffect(() => {
        if (mostrarMapa && mapRef.current) {
            const google = (window as any).google;
            if (google && google.maps) {
                
                // Esperamos 600ms a que la animación CSS termine y el contenedor sea estable
                const timer = setTimeout(() => {
                    new google.maps.Map(mapRef.current!, {
                        center: { lat: 20.6710, lng: -100.3260 }, 
                        zoom: 14.5,
                        mapTypeId: 'hybrid', 
                        disableDefaultUI: false,
                        streetViewControl: true, // Activado para tus recorridos 360
                        mapTypeControl: false
                    });
                }, 600);

                return () => clearTimeout(timer); // Limpieza si el componente se desmonta antes
            }
        }
    }, [mostrarMapa]);

    return (
        <div className={`menu-kiosco-wrapper ${animacionSalida ? 'oculto' : ''}`}>
            
            {/* EL VIDEO DE FONDO (Ahora con videoRef asignado) */}
            <video 
                ref={videoRef} 
                src="/Assets/Macros Supraterra 2025 - Aeropuerto 1920x1080.mp4"
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
                <button className="menu-grid-btn">Master Plan</button>
                <button className="menu-grid-btn" onClick={() => setMostrarMapa(true)}>Ubicación</button>
                <button className="menu-grid-btn" onClick={() => manejarClic(onIrAShowroomUnity)}>Show Room</button>
                <button className="menu-grid-btn">Inversión</button>
                <button className="menu-grid-btn" onClick={() => manejarClic(onIrAlRecorrido)}>Simulador</button>
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

        </div>
    );
}