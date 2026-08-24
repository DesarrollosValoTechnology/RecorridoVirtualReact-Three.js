// src/components/FormularioProspectoLote.tsx
//
// Formulario real de captación (FormularioContacto.tsx escribe en la misma tabla, con
// origen = 'contacto-web'). Escribe en public.prospectos_web — una rendija de solo
// escritura para `anon` (ver puertas-publicas-recorrido.sql): el INSERT nunca lleva
// `.select()` porque no hay política de lectura, y no la va a haber.
//
// Ver encargo-disponibilidad-publica-recorrido360.md.
import { useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import { supabase } from '../supabase/client';
import { diccionario } from '../data/diccionario';
import AvisoPrivacidadTexto from './AvisoPrivacidadTexto';
import { VERSION_AVISO_PRIVACIDAD } from '../data/avisoPrivacidad';

interface Props {
    clave: string;
    inmueble: string;
}

export default function FormularioProspectoLote({ clave, inmueble }: Props) {
    const idiomaActual = useTourStore((state) => state.idiomaActual);
    const t = diccionario[idiomaActual];

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [aceptoAviso, setAceptoAviso] = useState(false);
    // Campo trampa: un visitante real nunca lo llena porque está fuera de pantalla; un bot
    // que rellena todo lo que encuentra en el DOM, sí. Se manda igual al backend — el
    // trigger de la base es quien de verdad descarta la fila (ver PARTE 3 del SQL), esto
    // solo evita mandar la petición para nada cuando el navegador sí lo detecta.
    const [campoTrampa, setCampoTrampa] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');
    const [mostrarAviso, setMostrarAviso] = useState(false);

    const faltaContacto = correo.trim() === '' && telefono.trim() === '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim()) return;
        if (faltaContacto) {
            setError(t['UI_LOTE_ERROR_CONTACTO']);
            return;
        }
        if (!aceptoAviso) return; // el botón ya está deshabilitado; doble seguro

        setEnviando(true);
        try {
            // Sin .select(): la tabla es de solo escritura para `anon`, pedir la fila de
            // vuelta falla porque no hay política de SELECT.
            const { error: errInsert } = await supabase.from('prospectos_web').insert([{
                nombre: nombre.trim(),
                correo: correo.trim() || null,
                telefono: telefono.trim() || null,
                lote_clave: clave,
                inmueble,
                acepto_aviso: true,
                version_aviso: VERSION_AVISO_PRIVACIDAD,
                campo_trampa: campoTrampa,
            }]);

            if (errInsert) throw errInsert;

            // El trigger de la base descarta en silencio (sin error) las filas con campo
            // trampa lleno — así que llegar aquí con !error es "gracias" tanto para una
            // persona real como para un bot que sí llenó el señuelo. Es lo que pide el
            // encargo: nunca avisar que se detectó un bot.
            setEnviado(true);
        } catch (err) {
            console.error('Error al enviar el prospecto:', err);
            setError(t['UI_LOTE_ERROR_ENVIO']);
        } finally {
            setEnviando(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)',
        color: 'white', outline: 'none', marginBottom: '15px',
        fontSize: '14px', boxSizing: 'border-box' as const,
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
        <form onSubmit={handleSubmit} style={{ marginTop: '10px', textAlign: 'left' }}>
            <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '15px' }}>{t['UI_LOTE_SUBTITULO']}</p>

            <label style={labelStyle}>{t['UI_FORM_NOMBRE']}</label>
            <input
                type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                placeholder={t['UI_FORM_NOMBRE']} style={inputStyle}
            />

            <label style={labelStyle}>{t['UI_FORM_CORREO']}</label>
            <input
                type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                placeholder={t['UI_FORM_CORREO']} style={inputStyle}
            />

            <label style={labelStyle}>{t['UI_FORM_TELEFONO']}</label>
            <input
                type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                placeholder={t['UI_FORM_TELEFONO']} style={inputStyle}
            />

            {/* Campo trampa ("Empresa"): input real dentro del form, oculto con CSS fuera de
                pantalla — no display:none a secas ni type="hidden", porque algunos bots
                ignoran justo esos dos y solo llenan lo que ven en el DOM. */}
            <div className="campo-trampa" aria-hidden="true">
                <label htmlFor="empresa">Empresa</label>
                <input
                    id="empresa" type="text" name="empresa" tabIndex={-1} autoComplete="off"
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
                    background: (!aceptoAviso || enviando) ? '#555' : 'var(--zibata-verde)',
                    color: 'white', border: 'none', padding: '12px',
                    borderRadius: '6px', cursor: (!aceptoAviso || enviando) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold', transition: 'background 0.3s', marginTop: '18px',
                }}
            >
                {enviando ? t['UI_LOTE_ENVIANDO'] : t['UI_FORM_ENVIAR']}
            </button>
        </form>
    );
}
