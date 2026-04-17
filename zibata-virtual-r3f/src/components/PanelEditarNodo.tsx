import { useState, useEffect } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { useTourStore } from '../store/useTourStore';
import { supabase } from '../supabase/client';

export default function PanelEditarNodo() {
    const { nodos, nodoActual, actualizarNodoActual, setAdminPanelActivo } = useTourStore();
    const info = nodos[nodoActual];

    const [datos, setDatos] = useState({
        titulo: '', mapa_x: 0, mapa_y: 0, norte_offset: 0, lat: 0, lng: 0
    });
    const [subiendoMini, setSubiendoMini] = useState(false);

    useEffect(() => {
        if (info) {
            setDatos({
                titulo: info.ui.titulo || '',
                mapa_x: info.mapaX || 0, mapa_y: info.mapaY || 0,
                norte_offset: info.norteOffset || 0,
                lat: info.lat || 0, lng: info.lng || 0
            });
        }
    }, [nodoActual, info]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const valorFinal = name === 'titulo' ? value : Number(value);
        setDatos({ ...datos, [name]: valorFinal });
        if (name !== 'titulo') actualizarNodoActual({ [name]: valorFinal });
    };

    const handleMiniUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setSubiendoMini(true);
        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${nodoActual}-thumb-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error } = await supabase.storage.from('fotos_tour').upload(fileName, file);
            if (error) throw error;

            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(fileName);
            await actualizarNodoActual({ miniatura_url: data.publicUrl });
            alert("✅ ¡Miniatura actualizada correctamente!");
        } catch (error) {
            alert("❌ Hubo un error al subir la miniatura.");
        } finally {
            setSubiendoMini(false);
        }
    };

    // ==========================================
    // 🎨 SISTEMA DE DISEÑO "RAYCAST PREMIUM"
    // ==========================================
    const panelGlobalStyle: CSSProperties = {
        position: 'absolute', top: '20px', right: '20px', width: '300px',
        backgroundColor: 'rgba(15, 15, 15, 0.65)', // Cristal oscuro
        backdropFilter: 'blur(16px)',              // Desenfoca lo que hay detrás
        padding: '24px', 
        borderRadius: '24px',                      // Bordes bien curvos
        border: '1px solid rgba(255, 255, 255, 0.08)', // Borde tipo Apple
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',   // Sombra profunda
        color: 'white', zIndex: 100000, fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const labelStyle: CSSProperties = { 
        display: 'block', fontSize: '10px', color: '#999', 
        marginBottom: '6px', marginTop: '12px', fontWeight: 600, letterSpacing: '0.5px' 
    };

    const inputPremiumStyle: CSSProperties = { 
        width: '100%', padding: '10px 12px', borderRadius: '10px', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Hueco hundido en el cristal
        color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
    };

    const btnPremiumStyle: CSSProperties = {
        width: '100%', padding: '12px', marginTop: '20px', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', 
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', 
        cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
    };

    return (
        <div style={panelGlobalStyle}>
            
            {/* CABECERA */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(92, 184, 42, 0.2)', color: '#5cb82a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Configuración</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>ID: <span style={{ color: '#ccc' }}>{nodoActual}</span></p>
                </div>
            </div>

            <label style={labelStyle}>TÍTULO PÚBLICO</label>
            <input name="titulo" value={datos.titulo} style={inputPremiumStyle} onChange={handleChange} onBlur={() => actualizarNodoActual({ titulo: datos.titulo })} />

            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>POS. X (%)</label><input type="number" name="mapa_x" value={datos.mapa_x} style={inputPremiumStyle} onChange={handleChange} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>POS. Y (%)</label><input type="number" name="mapa_y" value={datos.mapa_y} style={inputPremiumStyle} onChange={handleChange} /></div>
            </div>

            <label style={labelStyle}>AJUSTE NORTE ({datos.norte_offset}°)</label>
            <input type="range" name="norte_offset" min="0" max="360" value={datos.norte_offset} style={{ width: '100%', accentColor: '#5cb82a' }} onChange={handleChange} />

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px', paddingTop: '5px' }}>
                <label style={{ ...labelStyle, color: '#4a90e2' }}>📍 GOOGLE MAPS (GPS)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}><label style={labelStyle}>LATITUD</label><input type="number" name="lat" step="any" value={datos.lat} style={inputPremiumStyle} onChange={handleChange} /></div>
                    <div style={{ flex: 1 }}><label style={labelStyle}>LONGITUD</label><input type="number" name="lng" step="any" value={datos.lng} style={inputPremiumStyle} onChange={handleChange} /></div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px', paddingTop: '5px' }}>
                <label style={{ ...labelStyle, color: '#e2a74a' }}>🖼️ MINIATURA (400x300px)</label>
                <input type="file" accept="image/*" onChange={handleMiniUpload} disabled={subiendoMini} style={{ ...inputPremiumStyle, padding: '6px', fontSize: '11px' }} />
                {subiendoMini && <p style={{ color: '#e2a74a', fontSize: '11px', marginTop: '5px' }}>Subiendo...</p>}
            </div>

            <button onClick={() => setAdminPanelActivo(null)} style={btnPremiumStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                Cerrar Panel
            </button>
        </div>
    );
}