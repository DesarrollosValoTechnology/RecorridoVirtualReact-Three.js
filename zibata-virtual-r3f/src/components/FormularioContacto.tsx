// src/components/FormularioContacto.tsx
//
// Antes era un stub: handleSubmit solo hacía console.log(formData) y decía "enviado" sin
// mandar nada a ningún lado (ver encargo-aviso-privacidad.md, A2). Ahora escribe en la misma
// public.prospectos_web que usa FormularioProspectoLote.tsx, con origen = 'contacto-web' para
// poder distinguir estos prospectos de los que vienen desde un lote. Reutiliza de ese
// formulario: la tabla, el campo trampa contra bots, la regla de al menos un medio de
// contacto, y ahora el aviso de privacidad.
//
// "Interés" y "cómo prefiere ser contactado" se guardan en las columnas `interes` y
// `forma_contacto` (agregadas por consentimiento-aviso-privacidad.sql — ver
// encargo-aviso-privacidad-cierre.md, PARTE E; antes estaba escalado porque no existían).
//
// 🔴 `forma_contacto` tiene un CHECK en la base: solo acepta 'telefono', 'whatsapp',
// 'presencial' o 'correo'. Los <option value=...> de abajo llevan esos valores exactos, no la
// etiqueta que ve el visitante — si mandas la etiqueta, la base rechaza el INSERT.
import { useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import { supabase } from '../supabase/client';
import { diccionario } from '../data/diccionario';
import AvisoPrivacidadTexto from './AvisoPrivacidadTexto';
import { VERSION_AVISO_PRIVACIDAD } from '../data/avisoPrivacidad';

export default function FormularioContacto() {
    const idiomaActual = useTourStore(state => state.idiomaActual);
    const t = diccionario[idiomaActual]; // Atajo mágico para las traducciones

    const [formData, setFormData] = useState({
        nombre: '', interes: '', correo: '', telefono: '', contacto: ''
    });
    const [aceptoAviso, setAceptoAviso] = useState(false);
    const [mostrarAviso, setMostrarAviso] = useState(false);
    // Campo trampa: mismo mecanismo que FormularioProspectoLote.tsx — invisible para una
    // persona, un bot que rellena todo lo que ve en el DOM sí lo llena. El trigger en la base
    // es quien de verdad descarta la fila; esto solo evita mandar la petición en el navegador.
    const [campoTrampa, setCampoTrampa] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');

    const faltaContacto = formData.correo.trim() === '' && formData.telefono.trim() === '';

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre.trim()) return;
        if (faltaContacto) {
            setError(t['UI_LOTE_ERROR_CONTACTO']);
            return;
        }
        if (!aceptoAviso) return; // el botón ya está deshabilitado; doble seguro

        setEnviando(true);
        try {
            // Sin .select(): la tabla es de solo escritura para `anon` (ver
            // FormularioProspectoLote.tsx para el detalle de por qué).
            const { error: errInsert } = await supabase.from('prospectos_web').insert([{
                nombre: formData.nombre.trim(),
                correo: formData.correo.trim() || null,
                telefono: formData.telefono.trim() || null,
                lote_clave: null,
                inmueble: null,
                interes: formData.interes || null,
                forma_contacto: formData.contacto || null,
                acepto_aviso: true,
                version_aviso: VERSION_AVISO_PRIVACIDAD,
                origen: 'contacto-web',
                campo_trampa: campoTrampa,
            }]);

            if (errInsert) throw errInsert;

            setEnviado(true);
        } catch (err) {
            console.error('Error al enviar el contacto:', err);
            setError(t['UI_LOTE_ERROR_ENVIO']);
        } finally {
            setEnviando(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)',
        color: 'white', outline: 'none', marginBottom: '15px',
        fontSize: '14px', boxSizing: 'border-box' as const
    };

    const labelStyle = { display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' };

    if (enviado) {
        return (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ color: 'var(--zibata-verde)', marginBottom: '10px' }}>{t['UI_LOTE_GRACIAS_TITULO']}</h3>
                <p style={{ color: '#ccc' }}>{t['UI_LOTE_GRACIAS_TEXTO']}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', textAlign: 'left' }}>

            <label style={labelStyle}>{t["UI_FORM_NOMBRE"]}</label>
            <input
                type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                placeholder={t["UI_FORM_NOMBRE"]} style={inputStyle}
            />

            <label style={labelStyle}>{t["UI_FORM_INTERES"]}</label>
            <select name="interes" value={formData.interes} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>{t["UI_FORM_SELECCIONE"]}</option>
                <option value="unilotes" style={{ color: 'black' }}>Unilotes</option>
                <option value="macrolotes" style={{ color: 'black' }}>Macrolotes</option>
                <option value="minimacrolotes" style={{ color: 'black' }}>Minimacrolotes</option>
            </select>

            <label style={labelStyle}>{t["UI_FORM_CORREO"]}</label>
            <input
                type="email" name="correo" value={formData.correo} onChange={handleChange}
                placeholder={t["UI_FORM_CORREO"]} style={inputStyle}
            />

            <label style={labelStyle}>{t["UI_FORM_TELEFONO"]}</label>
            <input
                type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                placeholder={t["UI_FORM_TELEFONO"]} style={inputStyle}
            />

            <label style={labelStyle}>{t["UI_FORM_COMO"]}</label>
            <select name="contacto" value={formData.contacto} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>{t["UI_FORM_SELECCIONE"]}</option>
                {/* value = valores exactos del CHECK en public.prospectos_web.forma_contacto.
                    "presencial" no se ofrece aquí: no tiene mucho sentido en un sitio web. */}
                <option value="telefono" style={{ color: 'black' }}>{t["UI_FORM_LLAMADA"]}</option>
                <option value="correo" style={{ color: 'black' }}>{t["UI_FORM_CORREO"]}</option>
                <option value="whatsapp" style={{ color: 'black' }}>WhatsApp</option>
            </select>

            {/* Campo trampa ("Empresa"): igual que en FormularioProspectoLote.tsx — input real
                dentro del form, oculto con CSS fuera de pantalla, no display:none ni
                type="hidden" porque algunos bots ignoran justo esos dos. */}
            <div className="campo-trampa" aria-hidden="true">
                <label htmlFor="empresa-contacto">Empresa</label>
                <input
                    id="empresa-contacto" type="text" name="empresa" tabIndex={-1} autoComplete="off"
                    value={campoTrampa} onChange={(e) => setCampoTrampa(e.target.value)}
                />
            </div>

            <label style={{ ...labelStyle, display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginTop: '5px' }}>
                <input
                    type="checkbox" checked={aceptoAviso}
                    onChange={(e) => setAceptoAviso(e.target.checked)}
                    style={{ marginTop: '3px', flexShrink: 0 }}
                />
                <span>
                    {t['UI_LOTE_AVISO_ACEPTO']}{' '}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setMostrarAviso(true); }}
                        style={{ color: 'var(--zibata-verde)' }}
                    >
                        {t['UI_LOTE_AVISO_LINK']}
                    </a>
                </span>
            </label>

            <AvisoPrivacidadTexto visible={mostrarAviso} onCerrar={() => setMostrarAviso(false)} />

            {error && (
                <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '10px', marginBottom: 0 }}>{error}</p>
            )}

            <button
                type="submit"
                disabled={!aceptoAviso || enviando}
                style={{
                    width: '100%',
                    background: (!aceptoAviso || enviando) ? '#555' : 'var(--zibata-verde, #00ff88)',
                    color: 'white', border: 'none', padding: '12px',
                    borderRadius: '6px', cursor: (!aceptoAviso || enviando) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold', transition: 'background 0.3s', marginTop: '18px',
                }}
            >
                {enviando ? t['UI_LOTE_ENVIANDO'] : t["UI_FORM_ENVIAR"]}
            </button>
        </form>
    );
}
