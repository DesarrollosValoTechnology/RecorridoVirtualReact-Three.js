import { useTourStore } from '../store/useTourStore';

export default function PanelEditorHotspots() {
    const { 
        setAdminPanelActivo, crearNuevoHotspot, 
        nodos, nodoActual, hotspotSeleccionadoId, 
        actualizarPropiedadesHotspot, borrarHotspot 
    } = useTourStore();

    // Buscamos la info del hotspot que el usuario haya seleccionado (al hacerle click en modo admin)
    const hotspotsDelNodo = nodos[nodoActual]?.hotspots || [];
    const hotspotActivo = hotspotsDelNodo.find((h: any) => h.id === hotspotSeleccionadoId);

    // Lista de todos los nodos disponibles para usar como destino
    const opcionesDestino = Object.entries(nodos).map(([id, info]: any) => ({
        id, titulo: info.ui?.titulo || id
    }));

    // ==========================================
    // 🎨 SISTEMA DE DISEÑO "RAYCAST PREMIUM"
    // ==========================================
    const panelGlobalStyle: React.CSSProperties = {
        position: 'absolute', top: '20px', left: '90px', width: '320px',
        backgroundColor: 'rgba(15, 15, 15, 0.65)', backdropFilter: 'blur(16px)',              
        padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', color: 'white', zIndex: 100000, 
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const inputPremiumStyle: React.CSSProperties = { 
        width: '100%', padding: '10px 12px', borderRadius: '10px', 
        border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
    };

    return (
        <div style={panelGlobalStyle}>
            <button 
                onClick={() => setAdminPanelActivo(null)} 
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(74, 144, 226, 0.2)', color: '#4a90e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/></svg>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Editor de Hotspots</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>Conecta tus escenas</p>
                </div>
            </div>

            {/* SI HAY UN HOTSPOT SELECCIONADO, MOSTRAMOS SUS OPCIONES */}
            {hotspotActivo ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', border: '1px solid rgba(74, 144, 226, 0.3)', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#4a90e2', fontWeight: 'bold' }}>EDITANDO HOTSPOT SELECCIONADO</p>
                        
                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>NODO DESTINO (¿A dónde viaja?)</label>
                        <select 
                            style={{ ...inputPremiumStyle, marginBottom: '10px' }}
                            value={hotspotActivo.destino}
                            onChange={(e) => actualizarPropiedadesHotspot(hotspotActivo.id, e.target.value, hotspotActivo.tipo)}
                        >
                            {opcionesDestino.map((opc) => (
                                <option key={opc.id} value={opc.id} style={{ color: 'black' }}>{opc.titulo}</option>
                            ))}
                        </select>

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>TIPO DE ÍCONO</label>
                        <select 
                            style={inputPremiumStyle}
                            value={hotspotActivo.tipo}
                            onChange={(e) => actualizarPropiedadesHotspot(hotspotActivo.id, hotspotActivo.destino, e.target.value)}
                        >
                            <option value="pasos" style={{ color: 'black' }}>👣 Pasos</option>
                            <option value="drone" style={{ color: 'black' }}>🚁 Drone (Aéreo)</option>
                            <option value="casa" style={{ color: 'black' }}>🏠 Casa / Edificio</option>
                            <option value="info" style={{ color: 'black' }}>ℹ️ Información</option>
                        </select>

                        <button 
                            onClick={() => borrarHotspot(hotspotActivo.id)}
                            style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            🗑️ Borrar Hotspot
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5', margin: '0 0 20px 0', textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    👆 Selecciona un hotspot en la escena 3D para editar su destino o crear uno nuevo.
                </p>
            )}

            <button 
                onClick={crearNuevoHotspot}
                style={{ width: '100%', padding: '14px', backgroundColor: '#4a90e2', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                Crear Nuevo Hotspot
            </button>
        </div>
    );
}