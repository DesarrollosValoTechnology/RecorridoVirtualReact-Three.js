// src/components/Simulador.tsx
import { useState } from 'react';
import './Simulador.css';

interface SimuladorProps {
    onCerrar: () => void;
}

// 1. TUS DATOS REALES DE FIGMA (Preparados para la futura conexión a base de datos)
const lotesDemo = [
    { 
        id: 'Lote 05', 
        estado: 'apartado', 
        trazo: "M554.5 274L643.5 296L654 252.5L567 227.5L554.5 274Z", // 👈 El primero
        area: '180.5 m²',
        precio: '$1,450,000 MXN',
        imagenDespiece: '/Assets/renders/TCLNXXIV16-005.jpg'
    },
    { 
        id: 'Lote 06', 
        estado: 'vendido', 
        trazo: "M545 318.5L633 342.5L643.5 296L554.5 274L545 318.5Z", // 👈 El tercero (que era el de en medio)
        area: '210.2 m²',
        precio: '$1,680,000 MXN',
        imagenDespiece: '/Assets/renders/TCLNXXIV16-006.jpg'
    },
    { 
        id: 'Lote 07', 
        estado: 'disponible', 
        trazo: "M545 318.5L533 365L577.5 376.25L622 387.5L633 342.5L545 318.5Z", // 👈 El segundo (que era el de abajo)
        area: '195.0 m²',
        precio: '$1,520,000 MXN',
        imagenDespiece: '/Assets/renders/TCLNXXIV16-006.jpg'
    }
];

// Colores semi-transparentes para que se note el render de fondo
const coloresEstado: Record<string, string> = {
    disponible: 'rgba(34, 197, 94, 0.4)',  // Verde
    apartado: 'rgba(234, 179, 8, 0.5)',    // Amarillo
    vendido: 'rgba(239, 68, 68, 0.4)'       // Rojo
};

// Función auxiliar para calcular la distancia entre dos dedos (Pinch-to-Zoom)
const calcularDistancia = (t1: React.Touch, t2: React.Touch) => {
    return Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2)
    );
};

export default function Simulador({ onCerrar }: SimuladorProps) {
    const [vistaActiva, setVistaActiva] = useState<'seleccion' | 'vistaAerea'>('seleccion');
    const [desarrolloActual, setDesarrolloActual] = useState<string>('');
    const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);
    const [despieceAmpliado, setDespieceAmpliado] = useState<string | null>(null);

    // LÓGICA DE NAVEGACIÓN Y CÁMARA (Mouse + Touch Móvil)
    const [isDragging, setIsDragging] = useState(false);
    const [fueArrastrado, setFueArrastrado] = useState(false); 
    const [posicion, setPosicion] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // 🚨 NUEVOS ESTADOS EXCLUSIVOS PARA ZOOM MÓVIL
    const [scale, setScale] = useState(1.2); // Escala por defecto
    const [distanciaInicial, setDistanciaInicial] = useState(0);
    const [escalaInicial, setEscalaInicial] = useState(1.2);

    /* =========================================================
       MANEJADORES PARA ESCRITORIO (MOUSE)
       ========================================================= */
    const iniciarArrastreMouse = (e: React.MouseEvent) => {
        setIsDragging(true);
        setFueArrastrado(false);
        setStartPos({ x: e.clientX - posicion.x, y: e.clientY - posicion.y });
    };

    const mientrasArrastraMouse = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setFueArrastrado(true);
        setPosicion({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    };

    /* =========================================================
       🚨 NUEVOS MANEJADORES PARA MÓVIL (TOUCH COMPATIBLE APK)
       ========================================================= */
    const iniciarArrastreTouch = (e: React.TouchEvent) => {
        setFueArrastrado(false);

        if (e.touches.length === 1) {
            // Un solo dedo: Arrastrar/Panear mapa
            setIsDragging(true);
            const touch = e.touches[0];
            setStartPos({ x: touch.clientX - posicion.x, y: touch.clientY - posicion.y });
        } else if (e.touches.length === 2) {
            // Dos dedos: Inicializar Pinch-to-Zoom
            setIsDragging(false); // Detener paneo para dar prioridad al zoom
            const dist = calcularDistancia(e.touches[0], e.touches[1]);
            setDistanciaInicial(dist);
            setEscalaInicial(scale);
        }
    };

    const mientrasArrastraTouch = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isDragging) {
            // Mover mapa con un dedo
            setFueArrastrado(true);
            const touch = e.touches[0];
            setPosicion({ x: touch.clientX - startPos.x, y: touch.clientY - startPos.y });
        } else if (e.touches.length === 2 && distanciaInicial > 0) {
            // Hacer zoom con dos dedos
            setFueArrastrado(true);
            const distActual = calcularDistancia(e.touches[0], e.touches[1]);
            const factor = distActual / distanciaInicial;
            
            // Limitamos el zoom entre 1.0x y 3.5x para que no rompa el diseño
            const nuevaEscala = Math.max(1.0, Math.min(3.5, escalaInicial * factor));
            setScale(nuevaEscala);
        }
    };

    const soltarArrastreGlobal = () => {
        setIsDragging(false);
        setDistanciaInicial(0);
    };

    const manejarSeleccion = (nombre: string) => {
        setDesarrolloActual(nombre);
        setVistaActiva('vistaAerea');
        setLoteSeleccionado(null);
        setPosicion({ x: 0, y: 0 }); 
        setScale(1.2); // Resetea escala al cambiar de desarrollo
    };

    return (
        <div className="simulador-wrapper">
            <button className="btn-cerrar-simulador" onClick={onCerrar}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>

            {vistaActiva === 'seleccion' && (
                <div className="simulador-panel-cristal fadeIn">
                    <h2 className="simulador-titulo">Simulador</h2>
                    <p className="simulador-subtitulo">Selecciona un desarrollo</p>
                    
                    <div className="simulador-grid-desarrollos">
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('LUANNA')}>
                            <img src="/Assets/CINTILLO LOGO LUANNA.png" alt="Luanna" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </button>
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('ZANURA')}>
                            <img src="/Assets/logo_zanura.png" alt="Zanura" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span>ZANURA</span>
                        </button>
                        <button className="simulador-btn-desarrollo" onClick={() => manejarSeleccion('TOWN CENTER')}>
                            <img src="/Assets/CINTILLO LOGO TOWN CENTER.png" alt="Town Center" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </button>
                    </div>
                </div>
            )}

            {vistaActiva === 'vistaAerea' && (
                <div className="simulador-vista-aerea-container fadeIn">
                    <div className="simulador-aerea-header">
                        <button className="btn-volver-aerea" onClick={() => setVistaActiva('seleccion')}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a desarrollos
                        </button>
                        <h3 className="titulo-desarrollo-activo">{desarrolloActual} - MASTER PLAN INTERACTIVO</h3>
                    </div>

                    <div className="simulador-split-layout">
                        
                        {/* CONTENEDOR INTERACTIVO CON EVENTOS DE MOUSE + TOUCH VINCULADOS */}
                        <div 
                            className="simulador-render-box"
                            onMouseDown={iniciarArrastreMouse}
                            onMouseMove={mientrasArrastraMouse}
                            onMouseUp={soltarArrastreGlobal}
                            onMouseLeave={soltarArrastreGlobal}
                            
                            // 🚨 COMPATIBILIDAD APK MÓVIL
                            onTouchStart={iniciarArrastreTouch}
                            onTouchMove={mientrasArrastraTouch}
                            onTouchEnd={soltarArrastreGlobal}
                        >
                            <svg 
                                viewBox="0 0 1800 1235"
                                className="capa-svg-lotes"
                                preserveAspectRatio="xMidYMid slice"
                                style={{
                                    // 🚨 Inyectamos dinámicamente la escala calculada por el Pinch Zoom
                                    transform: `translate(${posicion.x}px, ${posicion.y}px) scale(${scale})`,
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    transition: isDragging || distanciaInicial > 0 ? 'none' : 'transform 0.1s ease-out'
                                }}
                            >
                                <image 
                                    href="/Assets/renders/renderZona2.jpeg" 
                                    x="100" y="0" width="1600" height="1235" 
                                    preserveAspectRatio="none"
                                />

                                {lotesDemo.map((lote) => (
                                    <path
                                        key={lote.id}
                                        d={lote.trazo}
                                        fill={coloresEstado[lote.estado]}
                                        stroke="rgba(255, 255, 255, 0.6)"
                                        strokeWidth="0.5"
                                        className={`lote-path ${lote.estado}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!fueArrastrado) {
                                                setLoteSeleccionado(lote);
                                            }
                                        }}
                                        style={{
                                            fill: loteSeleccionado?.id === lote.id ? 'rgba(255,255,255,0.6)' : undefined
                                        }}
                                    />
                                ))}
                            </svg>

                            {!loteSeleccionado && (
                                <div className="overlay-instrucciones">
                                    <p>Usa tus dedos para mover o hacer zoom. Toca un lote para cotizar</p>
                                </div>
                            )}
                        </div>

                        {/* PANEL DERECHO DETALLE */}
                        {loteSeleccionado && (
                            <div className="simulador-detalle-panel fadeIn">
                                <div className="detalle-panel-header">
                                    <h4>{loteSeleccionado.id}</h4>
                                    <button 
                                        onClick={() => setLoteSeleccionado(null)} 
                                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '5px' }}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                     <span className={`badge-estado ${loteSeleccionado.estado}`}>{loteSeleccionado.estado}</span>
                                </div>

                                <div className="detalle-grid-cards">
                                    <div className="card-info-tecnica">
                                        <h5>FICHA TÉCNICA</h5>
                                        <p>Superficie: <strong>{loteSeleccionado.area}</strong></p>
                                        <p className="precio-tag">{loteSeleccionado.precio}</p>
                                    </div>
                                    <div className="card-despiece-mini">
                                        <h5>DESPIECE LOTE</h5>
                                        <div 
                                            className="placeholder-plano" 
                                            onClick={() => setDespieceAmpliado(loteSeleccionado.imagenDespiece)}
                                        >
                                            <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.4)" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 5.447-2.724A1 1 0 0121 3.182v10.764a1 1 0 01-.553.894L15 18l-6 2z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 2v18M15 4v14"></path>
                                            </svg>
                                            <span>Ampliar Plano</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-financiamiento">
                                    <h5>ESCENARIOS DE PAGO</h5>
                                    <div className="simulador-opciones-pago">
                                        <button className="btn-pago-opt active">Contado (10% Desc)</button>
                                        <button className="btn-pago-opt">12 Meses</button>
                                        <button className="btn-pago-opt">24 Meses</button>
                                    </div>
                                </div>
                                <div className="card-formulario-lead">
                                    <h5>SOLICITAR COTIZACIÓN FORMAL</h5>
                                    <input type="text" placeholder="Nombre completo" className="simulador-input" />
                                    <input type="email" placeholder="Correo electrónico" className="simulador-input" />
                                    <input type="tel" placeholder="Teléfono" className="simulador-input" />
                                    <button className="btn-enviar-lead" onClick={() => alert('¡Lead guardado!')}>
                                        ENVIAR A ASESOR
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
            
            {despieceAmpliado && (
                <div className="lightbox-overlay fadeIn" onClick={() => setDespieceAmpliado(null)}>
                    <button className="btn-cerrar-lightbox" onClick={() => setDespieceAmpliado(null)}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={despieceAmpliado} 
                            alt="Despiece Técnico" 
                            className="img-despiece-full"
                            onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/1080x1080/1a1a1a/5cb82a?text=Plano+T%C3%A9cnico+Pendiente";
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}