//src/components/AdminMode
import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function AdminMode() {
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        id: '',
        titulo: '',
        mapa_x: 50,
        mapa_y: 50,
        lat: '',
        lng: '',
        norte_offset: 0
    });
    const [archivo, setArchivo] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchivo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setMensaje('Subiendo imagen 360...');

        try {
            if (!archivo) throw new Error('Por favor selecciona una imagen .webp');
            if (!formData.id) throw new Error('El ID del nodo es obligatorio');

            // 1. Subir la imagen al Bucket de Supabase (carpeta 'fotos_tour')
            const fileExt = archivo.name.split('.').pop();
            const fileName = `${formData.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('fotos_tour')
                .upload(fileName, archivo);

            if (uploadError) throw uploadError;

            // 2. Obtener la URL pública de la imagen
            const { data: publicUrlData } = supabase.storage
                .from('fotos_tour')
                .getPublicUrl(fileName);

            setMensaje('Guardando datos en la base...');

            // 3. Insertar el registro en la tabla 'nodos'
            const { error: insertError } = await supabase
                .from('nodos')
                .insert([{
                    id: formData.id.toLowerCase().replace(/\s+/g, '_'), // Limpiamos el ID por si acaso
                    titulo: formData.titulo,
                    foto_url: publicUrlData.publicUrl,
                    mapa_x: Number(formData.mapa_x),
                    mapa_y: Number(formData.mapa_y),
                    lat: formData.lat ? Number(formData.lat) : null,
                    lng: formData.lng ? Number(formData.lng) : null,
                    norte_offset: Number(formData.norte_offset)
                }]);

            if (insertError) throw insertError;

            setMensaje('✅ ¡Nodo creado con éxito!');
            // Limpiar formulario opcionalmente aquí
            
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Error: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    // ESTILOS EN LÍNEA (Adaptados a tu UI oscura/glassmorphism)
    const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '12px', color: '#ccc', textTransform: 'uppercase' as const, letterSpacing: '1px' };
    const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' };

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(10px)',
            padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
            width: '400px', zIndex: 99999, color: 'white', fontFamily: 'sans-serif'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                🏗️ Crear Nuevo Nodo
            </h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label style={labelStyle}>ID del Nodo (sin espacios)</label>
                    <input type="text" name="id" required style={inputStyle} placeholder="ej. alberca_club" onChange={handleInputChange} />
                </div>

                <div>
                    <label style={labelStyle}>Título Público</label>
                    <input type="text" name="titulo" required style={inputStyle} placeholder="ej. Alberca Principal" onChange={handleInputChange} />
                </div>

                <div>
                    <label style={labelStyle}>Fotografía 360 (.webp)</label>
                    <input type="file" accept=".webp,.jpg,.jpeg" required style={inputStyle} onChange={handleFileChange} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Mapa X (%)</label>
                        <input type="number" name="mapa_x" step="0.1" style={inputStyle} defaultValue={50} onChange={handleInputChange} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Mapa Y (%)</label>
                        <input type="number" name="mapa_y" step="0.1" style={inputStyle} defaultValue={50} onChange={handleInputChange} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Latitud (GPS)</label>
                        <input type="number" name="lat" step="any" style={inputStyle} onChange={handleInputChange} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Longitud (GPS)</label>
                        <input type="number" name="lng" step="any" style={inputStyle} onChange={handleInputChange} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={cargando}
                    style={{
                        width: '100%', padding: '12px', marginTop: '10px',
                        backgroundColor: cargando ? '#555' : '#ffffff', 
                        color: cargando ? '#aaa' : '#000',
                        border: 'none', borderRadius: '20px', fontWeight: 'bold', 
                        cursor: cargando ? 'not-allowed' : 'pointer', transition: '0.3s'
                    }}
                >
                    {cargando ? 'Procesando...' : 'Guardar y Subir Nodo'}
                </button>
            </form>

            {mensaje && (
                <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: mensaje.includes('Error') ? '#ff4d4d' : '#4dff4d' }}>
                    {mensaje}
                </div>
            )}
        </div>
    );
}