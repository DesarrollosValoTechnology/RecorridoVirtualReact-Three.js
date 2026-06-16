// src/components/Simulador.tsx
import { useState } from 'react';
import './Simulador.css';

interface SimuladorProps {
    onCerrar: () => void;
}

export default function Simulador({ onCerrar }: SimuladorProps) {
    // Controlamos en qué paso del pipeline estamos
    const [vistaActiva, setVistaActiva] = useState<'seleccion' | 'vistaAerea'>('seleccion');
    const [desarrolloActual, setDesarrolloActual] = useState<string>('');

    const manejarSeleccion = (nombre: string) => {
        setDesarrolloActual(nombre);
        setVistaActiva('vistaAerea');
    };

    return (
        <div className="simulador-wrapper">
            {/* Botón global para cerrar el simulador y volver al menú principal */}
            <button className="btn-cerrar-simulador" onClick={onCerrar}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>

            {/* --- PASO 1: SELECCIÓN DE FRACCIONAMIENTO --- */}
            {vistaActiva === 'seleccion' && (
                <div className="simulador-panel-cristal fadeIn">
                    <h2 className="simulador-titulo">Simulador</h2>
                    <p className="simulador-subtitulo">Selecciona un desarrollo</p>
                    
                    <div className="simulador-grid-desarrollos">
                        {/* Botón Luanna */}
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('LUANNA')}>
                            {/* Cambia esta ruta por tu logo real cuando lo tengas */}
                            <img src="/Assets/logo_luanna.png" alt="Luanna" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span>LUANNA</span>
                        </button>

                        {/* Botón Zanura */}
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('ZANURA')}>
                            <img src="/Assets/logo_zanura.png" alt="Zanura" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span>ZANURA</span>
                        </button>

                        {/* Botón Town Center */}
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('TOWN CENTER')}>
                            <img src="/Assets/logo_towncenter.png" alt="Town Center" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span>TOWN CENTER</span>
                        </button>
                    </div>
                </div>
            )}

            {/* --- PASO 2: VISTA AÉREA (Loteo) --- */}
            {vistaActiva === 'vistaAerea' && (
                <div className="simulador-vista-aerea-container fadeIn">
                    {/* Header de la vista aérea */}
                    <div className="simulador-aerea-header">
                        <button className="btn-volver-aerea" onClick={() => setVistaActiva('seleccion')}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a desarrollos
                        </button>
                        <h3 className="titulo-desarrollo-activo">{desarrolloActual} - VISTA AÉREA 360</h3>
                    </div>

                    {/* Contenedor de la imagen/render interactivo */}
                    <div className="simulador-render-box">
                        {/* Esta es tu imagen provisional. Ajusta la ruta a cualquier JPG que tengas a la mano */}
                        <img 
                            src="/Assets/renders/renderZona.jpeg"
                            alt={`Render aéreo de ${desarrolloActual}`} 
                            className="img-render-aereo"
                        />
                        <div className="overlay-instrucciones">
                            <p>Toca un lote para ver su despiece</p> {/* Preparando terreno para la fase 2 */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}