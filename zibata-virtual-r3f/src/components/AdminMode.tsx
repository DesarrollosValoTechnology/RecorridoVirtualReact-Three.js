import { useState, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useTourStore } from '../store/useTourStore';

export default function AdminMode() {
    const { setAdminPanelActivo, cargarNodos, nodos } = useTourStore();
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    
    // 1. ESTADOS PARA LOS ARCHIVOS
    const [archivo360, setArchivo360] = useState<File | null>(null);
    const [archivoMini, setArchivoMini] = useState<File | null>(null);

    // 2. ESTADOS PARA CATEGORÍAS
    // Extraemos las categorías únicas de los nodos que ya están en el Store
    const categoriasExistentes = useMemo(() => {
        const categorias = Object.values(nodos).map((n: any) => n.ui?.categoria || 'General');
        return Array.from(new Set(categorias)); // Set elimina los duplicados
    }, [nodos]);

    // Seleccionamos la primera por defecto
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categoriasExistentes[0] || 'General');
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [esNuevaCategoria, setEsNuevaCategoria] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        titulo: '',
        mapa_x: 50,
        mapa_y: 50,
        lat: '',
        lng: '',
        norte_offset: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFile360Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setArchivo360(e.target.files[0]);
    };

    const handleMiniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setArchivoMini(e.target.files[0]);
    };

    // Manejador del desplegable de categorías
    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'NUEVA') {
            setEsNuevaCategoria(true);
        } else {
            setEsNuevaCategoria(false);
            setCategoriaSeleccionada(e.target.value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!archivo360 || !archivoMini) {
            setMensaje('❌ Por favor selecciona ambas imágenes (360 y Miniatura)');
            return;
        }

        setCargando(true);
        setMensaje('Subiendo imágenes a Supabase...');

        try {
            // Decidir qué categoría usar (la del select o la escrita a mano)
            const categoriaFinal = esNuevaCategoria ? (nuevaCategoria.trim() || 'General') : categoriaSeleccionada;

            // --- PASO 1: Subir Foto 360 ---
            const name360 = `${formData.id}-360-${Math.random().toString(36).substring(7)}.webp`;
            const { error: err360 } = await supabase.storage.from('fotos_tour').upload(name360, archivo360);
            if (err360) throw err360;
            const { data: url360 } = supabase.storage.from('fotos_tour').getPublicUrl(name360);

            // --- PASO 2: Subir Miniatura ---
            const nameMini = `${formData.id}-thumb-${Math.random().toString(36).substring(7)}.webp`;
            const { error: errMini } = await supabase.storage.from('fotos_tour').upload(nameMini, archivoMini);
            if (errMini) throw errMini;
            const { data: urlMini } = supabase.storage.from('fotos_tour').getPublicUrl(nameMini);

            setMensaje('Registrando en base de datos...');

            // --- PASO 3: Insertar en Tabla Nodos ---
            const { error: insertError } = await supabase
                .from('nodos')
                .insert([{
                    id: formData.id.toLowerCase().replace(/\s+/g, '_'),
                    titulo: formData.titulo,
                    categoria: categoriaFinal, // 👈 Se guarda la categoría dinámica
                    foto_url: url360.publicUrl,
                    miniatura_url: urlMini.publicUrl,
                    mapa_x: Number(formData.mapa_x),
                    mapa_y: Number(formData.mapa_y),
                    lat: formData.lat ? Number(formData.lat) : null,
                    lng: formData.lng ? Number(formData.lng) : null,
                    norte_offset: Number(formData.norte_offset)
                }]);

            if (insertError) throw insertError;

            setMensaje('✅ ¡Escena creada con éxito!');
            await cargarNodos(); // Recargamos para que aparezca en el menú
            
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Error: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // 🎨 SISTEMA DE DISEÑO "RAYCAST PREMIUM"
    // ==========================================
    const panelGlobalStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(15, 15, 15, 0.65)', backdropFilter: 'blur(16px)',              
        padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', width: '420px', maxHeight: '90vh', 
        overflowY: 'auto', color: 'white', zIndex: 99999, fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const labelStyle: React.CSSProperties = { 
        display: 'block', fontSize: '10px', color: '#999', marginBottom: '6px', 
        marginTop: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase'
    };

    const inputPremiumStyle: React.CSSProperties = { 
        width: '100%', padding: '10px 12px', borderRadius: '10px', 
        border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
    };

    const btnPremiumStyle: React.CSSProperties = {
        width: '100%', padding: '14px', marginTop: '20px', 
        backgroundColor: cargando ? 'rgba(255, 255, 255, 0.05)' : '#5cb82a', 
        color: cargando ? '#888' : '#fff', border: 'none', borderRadius: '12px', 
        cursor: cargando ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s', 
        fontSize: '14px', boxShadow: cargando ? 'none' : '0 4px 15px rgba(92, 184, 42, 0.3)'
    };

    return (
        <div style={panelGlobalStyle}>
            {/* BOTÓN CERRAR SUPERIOR */}
            <button 
                onClick={() => setAdminPanelActivo(null)} 
                style={{ 
                    position: 'absolute', top: '24px', right: '24px', background: 'none', 
                    border: 'none', color: '#888', cursor: 'pointer', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#888'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(92, 184, 42, 0.2)', color: '#5cb82a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Crear Nuevo Nodo</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>Añade una nueva escena al recorrido</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <label style={labelStyle}>ID DEL NODO (SIN ESPACIOS, EJ. plaza_norte)</label>
                <input type="text" name="id" required style={inputPremiumStyle} onChange={handleInputChange} />

                <label style={labelStyle}>TÍTULO PARA EL MENÚ PÚBLICO</label>
                <input type="text" name="titulo" required style={inputPremiumStyle} onChange={handleInputChange} />

                {/* 🚨 NUEVO: SELECTOR DE CATEGORÍAS */}
                <label style={labelStyle}>CATEGORÍA</label>
                <select 
                    style={inputPremiumStyle} 
                    value={esNuevaCategoria ? 'NUEVA' : categoriaSeleccionada} 
                    onChange={handleCategoriaChange}
                >
                    {categoriasExistentes.map((cat, i) => (
                        <option key={i} value={cat as string} style={{ color: 'black' }}>
                            {cat as string}
                        </option>
                    ))}
                    <option value="NUEVA" style={{ color: 'black', fontWeight: 'bold' }}>
                        + CREAR NUEVA CATEGORÍA...
                    </option>
                </select>

                {esNuevaCategoria && (
                    <div style={{ marginTop: '10px', animation: 'fadeIn 0.3s ease' }}>
                        <label style={{ ...labelStyle, color: '#4a90e2' }}>NOMBRE DE LA NUEVA CATEGORÍA</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej. Interiores" 
                            style={inputPremiumStyle} 
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{...labelStyle, color: '#e2a74a'}}>FOTO 360 (.WEBP)</label>
                        <input type="file" accept=".webp" required style={{...inputPremiumStyle, padding: '7px', fontSize: '11px'}} onChange={handleFile360Change} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{...labelStyle, color: '#4a90e2'}}>MINIATURA (400x300)</label>
                        <input type="file" accept=".webp,.jpg" required style={{...inputPremiumStyle, padding: '7px', fontSize: '11px'}} onChange={handleMiniChange} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px', paddingTop: '5px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>MAPA X (%)</label>
                        <input type="number" name="mapa_x" step="0.1" style={inputPremiumStyle} defaultValue={50} onChange={handleInputChange} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>MAPA Y (%)</label>
                        <input type="number" name="mapa_y" step="0.1" style={inputPremiumStyle} defaultValue={50} onChange={handleInputChange} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={cargando}
                    style={btnPremiumStyle}
                    onMouseOver={(e) => !cargando && (e.currentTarget.style.backgroundColor = '#6bd132')}
                    onMouseOut={(e) => !cargando && (e.currentTarget.style.backgroundColor = '#5cb82a')}
                >
                    {cargando ? 'Subiendo archivos e insertando...' : 'Guardar Escena'}
                </button>
            </form>

            {mensaje && (
                <div style={{ 
                    marginTop: '20px', padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 500, borderRadius: '8px',
                    backgroundColor: mensaje.includes('Error') || mensaje.includes('❌') ? 'rgba(255, 77, 77, 0.1)' : 'rgba(92, 184, 42, 0.1)',
                    color: mensaje.includes('Error') || mensaje.includes('❌') ? '#ff4d4d' : '#5cb82a',
                    border: mensaje.includes('Error') || mensaje.includes('❌') ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid rgba(92, 184, 42, 0.2)'
                }}>
                    {mensaje}
                </div>
            )}
        </div>
    );
}