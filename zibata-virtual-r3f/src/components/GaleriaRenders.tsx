// src/components/GaleriaRenders.tsx
import { useState } from 'react';

interface GaleriaProps {
    onVolverAlMenu: () => void;
}

export default function GaleriaRenders({ onVolverAlMenu }: GaleriaProps) {
    // 🚨 1. AHORA TENEMOS TÍTULOS Y DESCRIPCIONES PARA CADA RENDER
    const renders = [
        {
            src: '/Assets/renders/casa.jpg',
            titulo: 'Fachada Principal',
            desc: 'Diseño arquitectónico contemporáneo con acabados en piedra natural, maderas finas y excelente iluminación natural.'
        },
        {
            src: '/Assets/renders/interior.jpg',
            titulo: 'Sala de Estar y Comedor',
            desc: 'Espacios abiertos de doble altura diseñados para la convivencia familiar, con vistas panorámicas al desarrollo.'
        },
        {
            src: '/Assets/renders/exterior.jpg',
            titulo: 'Cocina de Autor',
            desc: 'Isla central de cuarzo blanco, equipamiento de grado profesional y gabinetes con cierre lento.'
        },
        {
            src: '/Assets/renders/escritorio.webp',
            titulo: 'Recámara Principal (Master Suite)',
            desc: 'Amplia suite con vestidor tipo walk-in closet, baño completo con doble lavabo y terraza privada.'
        },
        {
            src: '/Assets/renders/casa.webp',
            titulo: 'Terraza y Área Social',
            desc: 'Espacio exterior ideal para reuniones, con preparación para asador y acceso directo a las amenidades.'
        }
    ];

    const [indiceActual, setIndiceActual] = useState(0);

    const irSiguiente = () => {
        setIndiceActual((prev) => (prev === renders.length - 1 ? 0 : prev + 1));
    };

    const irAnterior = () => {
        setIndiceActual((prev) => (prev === 0 ? renders.length - 1 : prev - 1));
    };

    return (
        <div 
            style={{ 
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                backgroundColor: '#000', zIndex: 100, overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* 1. FONDO INMERSIVO DESENFOCADO */}
            {renders.map((render, index) => (
                <img 
                    key={`bg-${index}`}
                    src={render.src} 
                    alt="Fondo"
                    style={{
                        position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%', 
                        objectFit: 'cover', 
                        filter: 'blur(40px) brightness(0.3)', // Desenfoque extremo y oscurecido
                        transition: 'opacity 1s ease-in-out',
                        opacity: index === indiceActual ? 1 : 0,
                        zIndex: 1
                    }}
                />
            ))}
            
            {/* 2. BOTÓN VOLVER (Esquina Superior Izquierda) */}
            <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 110 }}>
                <button 
                    onClick={onVolverAlMenu}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(12px)',
                        color: 'white', padding: '12px 24px', borderRadius: '9999px',
                        border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '13px', fontWeight: 600,
                        letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.6)'}
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    VOLVER AL MENÚ
                </button>
            </div>

            {/* 3. IMÁGENES PRINCIPALES (Con tamaño uniforme y relleno Cover) */}
                        <div style={{ 
                            position: 'absolute', 
                            top: '10vh', // Lo bajamos un poquito desde el techo
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: '85vw',  // Ancho fijo gigante (85% de la pantalla)
                            height: '65vh', // Alto fijo gigante (65% de la pantalla)
                            zIndex: 10 
                        }}>
                            {renders.map((render, index) => (
                                <img 
                                    key={`img-${index}`}
                                    src={render.src} 
                                    alt={render.titulo} 
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover', // 🚨 LA MAGIA: Rellena todo el cuadro siempre
                                        borderRadius: '16px',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                        opacity: index === indiceActual ? 1 : 0,
                                        transform: index === indiceActual ? 'scale(1)' : 'scale(0.95)',
                                        pointerEvents: index === indiceActual ? 'auto' : 'none'
                                    }}
                                />
                            ))}
                        </div>

            {/* 4. PANEL DE TEXTO Y DESCRIPCIÓN (Abajo al Centro) */}
            <div style={{ 
                position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                width: '90%', maxWidth: '800px', zIndex: 110,
                backgroundColor: 'rgba(20, 20, 20, 0.7)', backdropFilter: 'blur(16px)',
                borderRadius: '20px', padding: '24px 32px', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <h2 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '22px', fontWeight: 500, letterSpacing: '0.02em' }}>
                        {renders[indiceActual].titulo}
                    </h2>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6', fontWeight: 300 }}>
                        {renders[indiceActual].desc}
                    </p>
                </div>

                {/* CONTADOR EN EL PANEL */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px',
                    color: 'white', letterSpacing: '0.1em', fontSize: '14px', fontWeight: 500
                }}>
                    {indiceActual + 1} / {renders.length}
                </div>
            </div>

            {/* 5. CONTROLES DE NAVEGACIÓN (Flechas flotantes) */}
            <div 
                onClick={irAnterior}
                style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 110, cursor: 'pointer', padding: '20px' }}
            >
                <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '50%', padding: '16px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </div>
            </div>

            <div 
                onClick={irSiguiente}
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 110, cursor: 'pointer', padding: '20px' }}
            >
                <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '50%', padding: '16px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>

        </div>
    );
}