import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useTourStore } from '../store/useTourStore';

export default function PanelEditorZonas() {
    const {
        setAdminPanelActivo,
        nodos, nodoActual,
        zonaSeleccionadaId, setZonaSeleccionadaId, setVerticeZonaSeleccionado,
        dibujandoZona, setDibujandoZona,
        puntosZonaEnProceso, quitarUltimoPuntoZonaEnProceso, limpiarPuntosZonaEnProceso,
        guardarNuevaZona, actualizarPropiedadesZona, borrarZona,
    } = useTourStore();

    const zonasDelNodo = nodos[nodoActual]?.zonas || [];
    const zonaActiva = zonasDelNodo.find((z: any) => z.id === zonaSeleccionadaId);
    const hayBorrador = puntosZonaEnProceso.length > 0;

    // Lista de todos los nodos disponibles para usar como destino
    // (mostramos el ID, no el título: puede haber varios nodos con el mismo título
    // público —ej. "Zibatá Vista Aérea"— y el ID es lo único que los distingue aquí)
    const opcionesDestino = Object.entries(nodos).map(([id]: any) => ({
        id, titulo: id
    }));

    const [destinoBorrador, setDestinoBorrador] = useState('');
    const [nombreBorrador, setNombreBorrador] = useState('');
    const [colorBorrador, setColorBorrador] = useState('#5CB82A');

    // Al terminar de dibujar (hay puntos pero ya no se están agregando más),
    // preparamos un destino por default para el formulario de guardado.
    useEffect(() => {
        if (hayBorrador && !dibujandoZona && !destinoBorrador) {
            const primerOtroNodo = opcionesDestino.find((o) => o.id !== nodoActual);
            setDestinoBorrador(primerOtroNodo?.id || nodoActual);
        }
    }, [hayBorrador, dibujandoZona]); // eslint-disable-line react-hooks/exhaustive-deps

    // ==========================================
    // 🎨 SISTEMA DE DISEÑO "RAYCAST PREMIUM"
    // ==========================================
    const panelGlobalStyle: CSSProperties = {
        position: 'absolute', top: '20px', left: '90px', width: '320px',
        backgroundColor: 'rgba(15, 15, 15, 0.65)', backdropFilter: 'blur(16px)',
        padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', color: 'white', zIndex: 100000,
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const inputPremiumStyle: CSSProperties = {
        width: '100%', padding: '10px 12px', borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
    };

    const btnPremiumStyle: CSSProperties = {
        width: '100%', padding: '14px', marginTop: '10px',
        backgroundColor: '#5CB82A',
        color: '#fff', border: 'none', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '14px',
        boxShadow: '0 4px 15px rgba(92, 184, 42, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    };

    const btnSecundarioStyle: CSSProperties = {
        width: '100%', padding: '10px', marginTop: '8px',
        backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
        cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
    };

    const iniciarDibujo = () => {
        setZonaSeleccionadaId(null);
        setVerticeZonaSeleccionado(null);
        setDestinoBorrador('');
        setNombreBorrador('');
        setColorBorrador('#5CB82A');
        setDibujandoZona(true);
    };

    const cancelarBorrador = () => {
        limpiarPuntosZonaEnProceso();
        setDestinoBorrador('');
        setNombreBorrador('');
    };

    const guardar = async () => {
        if (!destinoBorrador) return;
        await guardarNuevaZona(nodoActual, destinoBorrador, nombreBorrador, colorBorrador);
        setDestinoBorrador('');
        setNombreBorrador('');
    };

    return (
        <div style={panelGlobalStyle}>
            <button
                onClick={() => setAdminPanelActivo(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(92, 184, 42, 0.2)', color: '#5CB82A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M12 2v20" /><path d="M12 2 2 7l10 5 10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Editor de Zonas</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>Regiones clicables sobre la foto</p>
                </div>
            </div>

            {hayBorrador ? (
                dibujandoZona ? (
                    <div style={{ backgroundColor: 'rgba(92, 184, 42, 0.08)', border: '1px solid rgba(92, 184, 42, 0.2)', padding: '15px', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>
                            Dibujando zona: <strong style={{ color: '#5CB82A' }}>{puntosZonaEnProceso.length}</strong> punto{puntosZonaEnProceso.length === 1 ? '' : 's'}.
                            <br />Haz clic en la escena 3D para ir agregando el contorno.
                        </p>
                        <button onClick={quitarUltimoPuntoZonaEnProceso} disabled={puntosZonaEnProceso.length === 0} style={btnSecundarioStyle}>
                            ↩️ Quitar último punto
                        </button>
                        <button onClick={() => setDibujandoZona(false)} disabled={puntosZonaEnProceso.length < 3} style={{ ...btnPremiumStyle, opacity: puntosZonaEnProceso.length < 3 ? 0.5 : 1, cursor: puntosZonaEnProceso.length < 3 ? 'not-allowed' : 'pointer' }}>
                            ✓ Cerrar Zona
                        </button>
                        <button onClick={cancelarBorrador} style={{ ...btnSecundarioStyle, color: '#ff4d4d' }}>
                            Cancelar
                        </button>
                        {puntosZonaEnProceso.length < 3 && (
                            <p style={{ fontSize: '11px', color: '#888', margin: '10px 0 0 0' }}>* Necesitas al menos 3 puntos para cerrar la zona.</p>
                        )}
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'rgba(92, 184, 42, 0.08)', border: '1px solid rgba(92, 184, 42, 0.2)', padding: '15px', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#5CB82A', fontWeight: 'bold' }}>NUEVA ZONA ({puntosZonaEnProceso.length} puntos)</p>

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>NODO DESTINO (¿A dónde viaja?)</label>
                        <select
                            style={{ ...inputPremiumStyle, marginBottom: '10px' }}
                            value={destinoBorrador}
                            onChange={(e) => setDestinoBorrador(e.target.value)}
                        >
                            {opcionesDestino.map((opc) => (
                                <option key={opc.id} value={opc.id} style={{ color: 'black' }}>{opc.titulo}</option>
                            ))}
                        </select>

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>NOMBRE (opcional)</label>
                        <input
                            type="text"
                            style={{ ...inputPremiumStyle, marginBottom: '10px' }}
                            value={nombreBorrador}
                            onChange={(e) => setNombreBorrador(e.target.value)}
                            placeholder="Ej. Golf"
                        />

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>COLOR</label>
                        <input
                            type="color"
                            style={{ width: '100%', height: '36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                            value={colorBorrador}
                            onChange={(e) => setColorBorrador(e.target.value)}
                        />

                        <button onClick={guardar} style={btnPremiumStyle}>💾 Guardar Zona</button>
                        <button onClick={cancelarBorrador} style={{ ...btnSecundarioStyle, color: '#ff4d4d' }}>Cancelar</button>
                    </div>
                )
            ) : zonaActiva ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ backgroundColor: 'rgba(92, 184, 42, 0.08)', border: '1px solid rgba(92, 184, 42, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#5CB82A', fontWeight: 'bold' }}>EDITANDO ZONA SELECCIONADA</p>

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>NODO DESTINO (¿A dónde viaja?)</label>
                        <select
                            style={{ ...inputPremiumStyle, marginBottom: '10px' }}
                            value={zonaActiva.destino}
                            onChange={(e) => actualizarPropiedadesZona(zonaActiva.id, 'destino', e.target.value)}
                        >
                            {opcionesDestino.map((opc) => (
                                <option key={opc.id} value={opc.id} style={{ color: 'black' }}>{opc.titulo}</option>
                            ))}
                        </select>

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>NOMBRE</label>
                        <input
                            type="text"
                            style={{ ...inputPremiumStyle, marginBottom: '10px' }}
                            value={zonaActiva.nombre || ''}
                            onChange={(e) => actualizarPropiedadesZona(zonaActiva.id, 'nombre', e.target.value)}
                            placeholder="Ej. Golf"
                        />

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>COLOR</label>
                        <input
                            type="color"
                            style={{ width: '100%', height: '36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'pointer', marginBottom: '10px' }}
                            value={zonaActiva.color || '#5CB82A'}
                            onChange={(e) => actualizarPropiedadesZona(zonaActiva.id, 'color', e.target.value)}
                        />

                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>
                            * Selecciona un vértice (puntito blanco sobre el contorno) y arrástralo con la cruceta para ajustar la forma.
                        </p>

                        <button
                            onClick={() => borrarZona(zonaActiva.id)}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            🗑️ Borrar Zona
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5', margin: '0 0 20px 0', textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    👆 Selecciona una zona en la escena 3D para editarla o crea una nueva.
                </p>
            )}

            {!hayBorrador && (
                <button onClick={iniciarDibujo} style={btnPremiumStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                    Nueva Zona
                </button>
            )}
        </div>
    );
}
