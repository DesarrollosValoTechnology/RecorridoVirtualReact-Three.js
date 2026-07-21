import { useState, useEffect } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { useTourStore } from '../store/useTourStore';
import { supabase } from '../supabase/client';
import { convertirAWebP, generarVersionBlur } from '../utils/imagenAWebp';
import { TIPOS_HOTSPOT } from './Hotspot';

export default function PanelEditarNodo() {
    const { nodos, nodoActual, actualizarNodoActual, actualizarTipoIconoNodo, setAdminPanelActivo, cargarNodos, borrarNodoActual } = useTourStore();
    const info = nodos[nodoActual];

    const [datos, setDatos] = useState({
        titulo: '', mapa_x: 0, mapa_y: 0, norte_offset: 0, lat: 0, lng: 0
    });
    const [subiendoMini, setSubiendoMini] = useState(false);
    const [subiendo360, setSubiendo360] = useState(false);
    const [borrando, setBorrando] = useState(false);

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
            const archivoWebp = await convertirAWebP(e.target.files[0], { calidad: 0.75, maxAncho: 800, maxAlto: 600 });
            const fileName = `${nodoActual}-thumb-${Math.random().toString(36).substring(7)}.webp`;

            const { error } = await supabase.storage.from('fotos_tour').upload(fileName, archivoWebp);
            if (error) throw error;

            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(fileName);
            await actualizarNodoActual({ miniatura_url: data.publicUrl });
            await cargarNodos(); // Refresco completo para que la miniatura se vea en el acto
            alert("✅ ¡Miniatura actualizada correctamente!");
        } catch (error) {
            alert("❌ Hubo un error al subir la miniatura.");
        } finally {
            setSubiendoMini(false);
        }
    };

    const handleFoto360Upload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setSubiendo360(true);
        try {
            const original = e.target.files[0];
            // Tope 8192x4096: evita que el navegador reescale la textura en tiempo real con
            // mala calidad al subirla a la GPU (ver imagenAWebp.ts para más contexto).
            const [archivoWebp, archivoBlur] = await Promise.all([
                convertirAWebP(original, { calidad: 0.82, maxAncho: 8192, maxAlto: 4096 }),
                generarVersionBlur(original),
            ]);

            const fileName = `${nodoActual}-360-${Math.random().toString(36).substring(7)}.webp`;
            const { error } = await supabase.storage.from('fotos_tour').upload(fileName, archivoWebp);
            if (error) throw error;
            const { data } = supabase.storage.from('fotos_tour').getPublicUrl(fileName);

            const nameBlur = `${nodoActual}-360-blur-${Math.random().toString(36).substring(7)}.webp`;
            const { error: errBlur } = await supabase.storage.from('fotos_tour').upload(nameBlur, archivoBlur);
            if (errBlur) throw errBlur;
            const { data: dataBlur } = supabase.storage.from('fotos_tour').getPublicUrl(nameBlur);

            await actualizarNodoActual({ foto_url: data.publicUrl, archivo_blur_url: dataBlur.publicUrl });
            await cargarNodos(); // Refresco completo para que la esfera 3D muestre la nueva foto
            alert("✅ ¡Foto 360 actualizada correctamente!");
        } catch (error) {
            alert("❌ Hubo un error al subir la foto 360.");
        } finally {
            setSubiendo360(false);
        }
    };

    const handleBorrarNodo = async () => {
        const confirmacion1 = window.confirm(
            `¿Seguro que quieres eliminar el nodo "${nodoActual}"?\n\nEsto borrará también sus hotspots, etiquetas y las fotos asociadas. Esta acción no se puede deshacer.`
        );
        if (!confirmacion1) return;

        const confirmacion2 = window.confirm('Última confirmación: ¿ELIMINAR este nodo de forma permanente?');
        if (!confirmacion2) return;

        setBorrando(true);
        try {
            const resultado = await borrarNodoActual();
            if (!resultado.ok) {
                alert(`❌ Error al borrar el nodo: ${resultado.error}`);
            }
        } finally {
            setBorrando(false);
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

            <label style={labelStyle}>TIPO DE ÍCONO (mapa satelital y hotspots que llegan aquí)</label>
            <select
                value={info?.tipoIcono || 'flechas'}
                style={inputPremiumStyle}
                onChange={(e) => actualizarTipoIconoNodo(nodoActual, e.target.value)}
            >
                {TIPOS_HOTSPOT.map((t) => (
                    <option key={t.key} value={t.key} style={{ color: 'black' }}>{t.label}</option>
                ))}
            </select>

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
                <label style={{ ...labelStyle, color: '#4a90e2' }}>🌐 FOTO 360</label>
                <input type="file" accept="image/*" onChange={handleFoto360Upload} disabled={subiendo360} style={{ ...inputPremiumStyle, padding: '6px', fontSize: '11px' }} />
                {subiendo360 && <p style={{ color: '#4a90e2', fontSize: '11px', marginTop: '5px' }}>Convirtiendo y subiendo...</p>}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px', paddingTop: '5px' }}>
                <label style={{ ...labelStyle, color: '#e2a74a' }}>🖼️ MINIATURA (400x300px)</label>
                <input type="file" accept="image/*" onChange={handleMiniUpload} disabled={subiendoMini} style={{ ...inputPremiumStyle, padding: '6px', fontSize: '11px' }} />
                {subiendoMini && <p style={{ color: '#e2a74a', fontSize: '11px', marginTop: '5px' }}>Subiendo...</p>}
            </div>

            <button onClick={() => setAdminPanelActivo(null)} style={btnPremiumStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                Cerrar Panel
            </button>

            <div style={{ borderTop: '1px solid rgba(255,60,60,0.2)', marginTop: '15px', paddingTop: '15px' }}>
                <label style={{ ...labelStyle, color: '#ff4d4d', marginTop: 0 }}>⚠️ ZONA DE PELIGRO</label>
                <button
                    onClick={handleBorrarNodo}
                    disabled={borrando}
                    style={{
                        ...btnPremiumStyle, marginTop: '8px',
                        backgroundColor: borrando ? 'rgba(255,77,77,0.1)' : 'rgba(255,77,77,0.15)',
                        border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d',
                        cursor: borrando ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => !borrando && (e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.25)')}
                    onMouseOut={(e) => !borrando && (e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.15)')}
                >
                    {borrando ? 'Eliminando...' : 'Eliminar este nodo'}
                </button>
            </div>
        </div>
    );
}