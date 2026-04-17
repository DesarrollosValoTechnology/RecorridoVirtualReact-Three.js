import type { CSSProperties } from 'react';
import { useTourStore } from '../store/useTourStore';

export default function PanelEditorLabels() {
    const { 
        setAdminPanelActivo, 
        nodos, nodoActual, 
        labelSeleccionadoId, 
        actualizarPropiedadesLabel, 
        crearNuevoLabel,            
        borrarLabel                 
    } = useTourStore();

    const labelsDelNodo = nodos[nodoActual]?.labels || [];
    const labelActivo = labelsDelNodo.find((l: any) => l.id === labelSeleccionadoId);

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
        backgroundColor: '#e2a74a', // Dorado/Naranja para los labels
        color: '#fff', border: 'none', borderRadius: '12px', 
        cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '14px',
        boxShadow: '0 4px 15px rgba(226, 167, 74, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    };

    return (
        <div style={panelGlobalStyle}>
            <button 
                onClick={() => setAdminPanelActivo(null)} 
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#888'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(226, 167, 74, 0.2)', color: '#e2a74a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Etiquetas 3D</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>Señala puntos de interés</p>
                </div>
            </div>

            {labelActivo ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ backgroundColor: 'rgba(226, 167, 74, 0.08)', border: '1px solid rgba(226, 167, 74, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                        
                        {/* CAMPO ESPAÑOL */}
                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px', fontWeight: 'bold' }}>🇲🇽 TEXTO (ESPAÑOL)</label>
                        <input 
                            type="text"
                            style={{ ...inputPremiumStyle, marginBottom: '15px' }}
                            value={labelActivo.texto_es || ''}
                            onChange={(e) => actualizarPropiedadesLabel(labelActivo.id, 'texto_es', e.target.value)}
                            placeholder="Ej. Colegio Newland"
                        />

                        {/* CAMPO INGLÉS */}
                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px', fontWeight: 'bold' }}>🇺🇸 TEXTO (INGLÉS) - Opcional</label>
                        <input 
                            type="text"
                            style={{ ...inputPremiumStyle, marginBottom: '15px' }}
                            value={labelActivo.texto_en || ''}
                            onChange={(e) => actualizarPropiedadesLabel(labelActivo.id, 'texto_en', e.target.value)}
                            placeholder="Ej. Newland College"
                        />

                        <label style={{ display: 'block', fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>ALTURA DEL POSTE (OFFSET Y)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <input 
                                type="range" 
                                min="0" 
                                max="300" 
                                value={labelActivo.offset?.y || 0}
                                onChange={(e) => actualizarPropiedadesLabel(labelActivo.id, 'offset_y', Number(e.target.value))}
                                style={{ flex: 1, accentColor: '#e2a74a' }}
                            />
                            <span style={{ fontSize: '12px', color: '#e2a74a', fontWeight: 'bold', minWidth: '35px' }}>
                                {labelActivo.offset?.y || 0}
                            </span>
                        </div>

                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 15px 0' }}>
                            * Para mover la posición en el piso, arrastra el punto de anclaje naranja directamente en la escena 3D.
                        </p>

                        <button 
                            onClick={() => borrarLabel(labelActivo.id)}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            🗑️ Borrar Etiqueta
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5', margin: '0 0 20px 0', textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    👆 Selecciona una etiqueta en la escena 3D para editar su texto o altura.
                </p>
            )}

            <button 
                onClick={crearNuevoLabel}
                style={btnPremiumStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eeb863'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2a74a'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                Añadir Etiqueta
            </button>
        </div>
    );
}