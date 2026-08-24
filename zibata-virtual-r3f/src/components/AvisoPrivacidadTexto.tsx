// src/components/AvisoPrivacidadTexto.tsx
//
// Muestra el aviso de privacidad como texto dentro de la app (no un enlace a PDF externo —
// ver por qué en src/data/avisoPrivacidad.ts). Lo usan tanto FormularioProspectoLote.tsx como
// FormularioContacto.tsx para que la casilla de aceptación tenga algo real que enseñar.
import { TEXTO_AVISO_PRIVACIDAD, URL_AVISO_INTEGRAL } from '../data/avisoPrivacidad';

interface Props {
    visible: boolean;
    onCerrar: () => void;
}

export default function AvisoPrivacidadTexto({ visible, onCerrar }: Props) {
    if (!visible) return null;

    return (
        <div
            onClick={onCerrar}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', boxSizing: 'border-box',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#111', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px', maxWidth: '560px', width: '100%',
                    maxHeight: '85vh', overflowY: 'auto', padding: '24px 24px 20px',
                    color: '#ddd', fontSize: '14px', lineHeight: 1.6, position: 'relative',
                    boxSizing: 'border-box',
                }}
            >
                <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar"
                    style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'none', border: 'none', color: '#ccc',
                        fontSize: '18px', cursor: 'pointer', lineHeight: 1,
                    }}
                >✖</button>

                <h3 style={{ color: 'var(--zibata-verde)', marginTop: 0, marginBottom: '14px', paddingRight: '24px' }}>
                    Aviso de Privacidad
                </h3>

                <div style={{ whiteSpace: 'pre-line' }}>{TEXTO_AVISO_PRIVACIDAD}</div>

                <p style={{ marginTop: '16px', marginBottom: 0 }}>
                    Aviso de privacidad integral:{' '}
                    <a
                        href={URL_AVISO_INTEGRAL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--zibata-verde)' }}
                    >
                        {URL_AVISO_INTEGRAL}
                    </a>
                </p>
            </div>
        </div>
    );
}
