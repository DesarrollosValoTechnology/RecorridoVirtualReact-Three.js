import { useTourStore } from '../store/useTourStore';

export default function PanelInspector() {
    const { nodos, nodoActual, hotspotSeleccionadoId, setHotspotSeleccionadoId, actualizarPropiedadesHotspot, borrarHotspot } = useTourStore();

    // Buscamos los datos del hotspot seleccionado
    const hotspot = nodos[nodoActual]?.hotspots.find((h: any) => h.id === hotspotSeleccionadoId);
    
    if (!hotspot) return null;

    const inputStyle = { width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#333', color: 'white', border: '1px solid #444' };

    return (
        <div style={{
            position: 'absolute', top: '20px', right: '20px', width: '250px',
            backgroundColor: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(10px)',
            padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', zIndex: 100000, fontFamily: 'sans-serif'
        }}>
            <button onClick={() => setHotspotSeleccionadoId(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✖</button>
            <h4 style={{ marginTop: 0 }}>🔍 Inspector</h4>
            
            <label style={{ fontSize: '11px', color: '#aaa' }}>NODO DESTINO</label>
            <select 
                value={hotspot.destino} 
                style={inputStyle}
                onChange={(e) => actualizarPropiedadesHotspot(hotspot.id, e.target.value, hotspot.tipo)}
            >
                {Object.keys(nodos).map(id => (
                    <option key={id} value={id}>{nodos[id].ui.titulo || id}</option>
                ))}
            </select>

            <label style={{ fontSize: '11px', color: '#aaa' }}>ICONO</label>
            <select 
                value={hotspot.tipo} 
                style={inputStyle}
                onChange={(e) => actualizarPropiedadesHotspot(hotspot.id, hotspot.destino, e.target.value)}
            >
                <option value="pasos">👣 Pasos</option>
                <option value="drone">🚁 Drone</option>
                <option value="casa">🏠 Casa</option>
                <option value="persona">🚶 Persona</option>
            </select>

            <button 
                onClick={() => { if(confirm('¿Borrar este hotspot?')) borrarHotspot(hotspot.id) }}
                style={{ width: '100%', padding: '8px', backgroundColor: '#611', color: '#f55', border: '1px solid #f55', borderRadius: '5px', cursor: 'pointer' }}
            >
                🗑️ Eliminar Punto
            </button>
        </div>
    );
}