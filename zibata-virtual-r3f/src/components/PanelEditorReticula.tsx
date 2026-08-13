// src/components/PanelEditorReticula.tsx
//
// Panel admin del experimento "retícula de lotes" (ver encargo-reticula-lotes-recorrido360.md).
// Cuatro controles y ni uno más: posición X/Z del dron, giro (yaw) y altura de vuelo. NO hay
// control de escala — los lotes ya vienen en metros reales y la cámara a una altura real, así
// que la escala aparente sale sola de esa geometría.
import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useTourStore } from '../store/useTourStore';
import { NODOS_CON_RETICULA, ajusteReticulaPorDefecto } from '../data/reticulaLotesConfig';

export default function PanelEditorReticula() {
    const nodoActual = useTourStore((s) => s.nodoActual);
    const ajustesReticula = useTourStore((s) => s.ajustesReticula);
    const actualizarAjusteReticula = useTourStore((s) => s.actualizarAjusteReticula);
    const resetearAjusteReticula = useTourStore((s) => s.resetearAjusteReticula);
    const reticulaLotesVisible = useTourStore((s) => s.reticulaLotesVisible);
    const toggleReticulaLotes = useTourStore((s) => s.toggleReticulaLotes);
    const setAdminPanelActivo = useTourStore((s) => s.setAdminPanelActivo);

    const config = NODOS_CON_RETICULA[nodoActual];
    const ajuste = ajustesReticula[nodoActual] ?? ajusteReticulaPorDefecto(nodoActual);

    const [local, setLocal] = useState(ajuste);
    useEffect(() => setLocal(ajuste), [nodoActual]); // eslint-disable-line react-hooks/exhaustive-deps

    const panelGlobalStyle: CSSProperties = {
        position: 'absolute', top: '20px', right: '20px', width: '300px',
        backgroundColor: 'rgba(15, 15, 15, 0.65)',
        backdropFilter: 'blur(16px)',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        color: 'white', zIndex: 100000, fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const labelStyle: CSSProperties = {
        display: 'block', fontSize: '10px', color: '#999',
        marginBottom: '6px', marginTop: '12px', fontWeight: 600, letterSpacing: '0.5px'
    };

    const inputPremiumStyle: CSSProperties = {
        width: '100%', padding: '10px 12px', borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
    };

    const btnPremiumStyle: CSSProperties = {
        width: '100%', padding: '12px', marginTop: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
    };

    if (!config) {
        return (
            <div style={panelGlobalStyle}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Retícula de Lotes</h3>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                    Este nodo ("{nodoActual}") no tiene retícula de lotes. Solo aplica a LUANNA y ZANURA.
                </p>
                <button onClick={() => setAdminPanelActivo(null)} style={btnPremiumStyle}>Cerrar Panel</button>
            </div>
        );
    }

    const handleNumero = (campo: keyof typeof local) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        setLocal((s) => ({ ...s, [campo]: valor }));
        actualizarAjusteReticula(nodoActual, { [campo]: valor });
    };

    const handleRestablecer = () => {
        resetearAjusteReticula(nodoActual);
        setLocal(ajusteReticulaPorDefecto(nodoActual));
    };

    return (
        <div style={panelGlobalStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(92, 184, 42, 0.2)', color: '#5cb82a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Retícula de Lotes</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{config.inmueble}</p>
                </div>
            </div>

            <p style={{ fontSize: '11px', color: '#888', lineHeight: 1.5, margin: 0 }}>
                Ajusta a ojo contra lo que se ve en la foto: caminos, terracerías, linderos.
                Sin control de escala — la altura real ya la determina.
            </p>

            <p style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
                (Mientras este panel está abierto ves la retícula sin importar el interruptor
                público de abajo — así puedes ajustar aunque esté apagada para el visitante.)
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={reticulaLotesVisible} onChange={toggleReticulaLotes} />
                <span style={{ fontSize: '12px' }}>Encendida para el público ahora mismo</span>
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>POSICIÓN X (m)</label>
                    <input type="number" step="1" min={-400} max={400} value={local.offsetX} style={inputPremiumStyle} onChange={handleNumero('offsetX')} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>POSICIÓN Z (m)</label>
                    <input type="number" step="1" min={-400} max={400} value={local.offsetZ} style={inputPremiumStyle} onChange={handleNumero('offsetZ')} />
                </div>
            </div>

            <label style={labelStyle}>GIRO / NORTE DE LA FOTO ({local.yawDeg}°)</label>
            <input type="range" min={0} max={360} value={local.yawDeg} style={{ width: '100%', accentColor: '#5cb82a' }} onChange={handleNumero('yawDeg')} />

            <label style={labelStyle}>ALTURA DE VUELO (m)</label>
            <input type="number" step="1" min={1} value={local.alturaM} style={inputPremiumStyle} onChange={handleNumero('alturaM')} />

            <button
                onClick={handleRestablecer}
                style={{ ...btnPremiumStyle, marginTop: '14px', backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
                Restablecer a valores reales
            </button>

            <button onClick={() => setAdminPanelActivo(null)} style={btnPremiumStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                Cerrar Panel
            </button>
        </div>
    );
}
