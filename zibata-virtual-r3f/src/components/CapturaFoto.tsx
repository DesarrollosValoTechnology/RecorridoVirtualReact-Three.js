// src/components/CapturaFoto.tsx
import { useEffect, useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import { capturarFrameActual } from '../utils/capturaPantalla';
import { diccionario } from '../data/diccionario';

type ClaveRelacion = 'pantalla' | '1:1' | '4:3' | '3:2' | '16:9';

const RELACIONES: { clave: ClaveRelacion; etiqueta: string; valor: number | null }[] = [
    { clave: 'pantalla', etiqueta: 'Pantalla', valor: null }, // null = usa la del viewport actual
    { clave: '1:1', etiqueta: '1:1', valor: 1 },
    { clave: '4:3', etiqueta: '4:3', valor: 4 / 3 },
    { clave: '3:2', etiqueta: '3:2', valor: 3 / 2 },
    { clave: '16:9', etiqueta: '16:9', valor: 16 / 9 },
];

function cargarImagen(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Recorta la captura centrada a la relación de aspecto elegida y le pega la barra
// verde (con degradado) con el logo de Zibatá abajo a la derecha, igual que el
// "Shared by" de Panoee.
async function generarImagenFinal(imagenOriginalUrl: string, ratio: number): Promise<string> {
    const [img, logo] = await Promise.all([
        cargarImagen(imagenOriginalUrl),
        cargarImagen('/Assets/Logo Z_Lo imposible posible.png'),
    ]);

    const ratioOriginal = img.width / img.height;
    let cropW: number;
    let cropH: number;
    if (ratioOriginal > ratio) {
        cropH = img.height;
        cropW = cropH * ratio;
    } else {
        cropW = img.width;
        cropH = cropW / ratio;
    }
    const cropX = (img.width - cropW) / 2;
    const cropY = (img.height - cropH) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el contexto 2D');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Barra verde de marca, abajo a la derecha: se desvanece (alpha) de transparente
    // a sólida hacia la derecha, igual que el efecto de Panoee. El ancho de la barra
    // se calcula a partir del logo (no de la foto), para que solo cubra el logo y un
    // poco de desvanecido antes de él, sin invadir buena parte de la imagen.
    const bannerAlto = cropH * 0.1;
    const paddingDerecho = bannerAlto * 0.5;
    const paddingV = bannerAlto * 0.22;
    const logoRatio = logo.width / logo.height;
    const logoH = bannerAlto - paddingV * 2;
    const logoW = logoH * logoRatio;

    const fadeAncho = logoW * 1.2; // qué tanto se alcanza a ver el desvanecido antes del logo
    const bannerAncho = logoW + paddingDerecho * 2 + fadeAncho;
    const bannerX = cropW - bannerAncho;
    const bannerY = cropH - bannerAlto;

    const degradado = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerAncho, bannerY);
    degradado.addColorStop(0, 'rgba(92, 184, 42, 0)');
    degradado.addColorStop(0.6, 'rgba(92, 184, 42, 0.75)');
    degradado.addColorStop(1, 'rgba(74, 150, 34, 0.96)');
    ctx.fillStyle = degradado;
    ctx.fillRect(bannerX, bannerY, bannerAncho, bannerAlto);

    // El logo se ancla dentro de la zona sólida (derecha), no centrado en toda la barra
    const logoX = bannerX + bannerAncho - paddingDerecho - logoW;
    const logoY = bannerY + (bannerAlto - logoH) / 2;
    ctx.drawImage(logo, logoX, logoY, logoW, logoH);

    return canvas.toDataURL('image/png');
}

// Convierte un data URL (image/png) a Blob de forma síncrona (sin await), para no perder
// el "user gesture" que exige navigator.share si se usa el fallback web.
function dataURLaBlob(dataUrl: string): Blob {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

// Cuando el recorrido corre embebido dentro de la app anfitriona (Capacitor/Electron), le
// pedimos que sea ELLA quien guarde la foto con código nativo (hoja de compartir del sistema).
// Es la única vía fiable en el WebView de Android —que no soporta ni descargas ni Web Share—
// y también sirve en iPad y en el kiosco Electron.
// Devuelve true si el anfitrión confirmó que se hizo cargo; false si nadie respondió a tiempo
// (p. ej. una versión vieja de la app sin listener, o el recorrido embebido en otro sitio).
function pedirGuardadoAlAnfitrion(dataUrl: string, nombre: string): Promise<boolean> {
    return new Promise((resolve) => {
        let resuelto = false;
        const finalizar = (ok: boolean) => {
            if (resuelto) return;
            resuelto = true;
            clearTimeout(timer);
            window.removeEventListener('message', alRecibir);
            resolve(ok);
        };
        const alRecibir = (e: MessageEvent) => {
            if (e.data?.type === 'zibata:descargar-foto:ok') finalizar(true);
        };
        window.addEventListener('message', alRecibir);
        window.parent.postMessage({ type: 'zibata:descargar-foto', dataUrl, nombre }, '*');
        const timer = setTimeout(() => finalizar(false), 1500);
    });
}

// Guardado del lado web (fuera de la app): Web Share si existe (móvil), si no descarga directa.
async function guardarEnWeb(dataUrl: string, nombre: string) {
    const blob = dataURLaBlob(dataUrl);
    const archivo = new File([blob], nombre, { type: 'image/png' });
    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [archivo] })) {
        try {
            await navigator.share({ files: [archivo], title: 'Zibatá' });
            return;
        } catch (error) {
            if ((error as DOMException)?.name === 'AbortError') return; // el usuario cerró la hoja
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CapturaFoto() {
    const capturaAbierta = useTourStore((s) => s.capturaAbierta);
    const setCapturaAbierta = useTourStore((s) => s.setCapturaAbierta);
    const idiomaActual = useTourStore((s) => s.idiomaActual);
    const t = diccionario[idiomaActual];

    const [relacion, setRelacion] = useState<ClaveRelacion>('16:9');
    const [imagenFinal, setImagenFinal] = useState<string | null>(null);
    const [generando, setGenerando] = useState(false);
    const [tamanioMarco, setTamanioMarco] = useState({ width: 0, height: 0 });
    const [mostrarPista, setMostrarPista] = useState(false);

    // Al abrirse, arrancamos siempre en fase de encuadre (la cámara sigue libre)
    useEffect(() => {
        if (capturaAbierta) {
            setImagenFinal(null);
            setRelacion('16:9');
            setMostrarPista(true);
            const timer = setTimeout(() => setMostrarPista(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [capturaAbierta]);

    // Tamaño del marco de encuadre, según la relación elegida y el tamaño de ventana
    useEffect(() => {
        function recalcular() {
            // "Pantalla" ocupa prácticamente todo el viewport (igual que en Panoee),
            // en vez de encogerse a la misma caja que las demás relaciones fijas.
            if (relacion === 'pantalla') {
                setTamanioMarco({ width: window.innerWidth - 32, height: window.innerHeight - 32 });
                return;
            }
            const def = RELACIONES.find((r) => r.clave === relacion);
            const ratio = def?.valor ?? window.innerWidth / window.innerHeight;
            const maxW = window.innerWidth * 0.72;
            const maxH = window.innerHeight * 0.6;
            let w = maxW;
            let h = w / ratio;
            if (h > maxH) {
                h = maxH;
                w = h * ratio;
            }
            setTamanioMarco({ width: w, height: h });
        }
        recalcular();
        window.addEventListener('resize', recalcular);
        return () => window.removeEventListener('resize', recalcular);
    }, [relacion]);

    if (!capturaAbierta) return null;

    const cerrar = () => {
        setCapturaAbierta(false);
        setImagenFinal(null);
    };

    const volverATomar = () => setImagenFinal(null);

    const tomarFoto = async () => {
        const frame = capturarFrameActual();
        if (!frame) return;
        setGenerando(true);
        try {
            const def = RELACIONES.find((r) => r.clave === relacion);
            const ratio = def?.valor ?? window.innerWidth / window.innerHeight;
            const resultado = await generarImagenFinal(frame, ratio);
            setImagenFinal(resultado);
        } catch (error) {
            console.error('Error al generar la captura:', error);
            alert('❌ No se pudo generar la captura.');
        } finally {
            setGenerando(false);
        }
    };

    const descargar = async () => {
        if (!imagenFinal) return;
        const nombre = `zibata-tour-${Date.now()}.png`;
        // Dentro de la app anfitriona (iframe): que la app guarde la foto con código nativo.
        // Si no responde a tiempo (app vieja / embebido en otro lado), guardamos por web.
        if (window.self !== window.top) {
            const guardado = await pedirGuardadoAlAnfitrion(imagenFinal, nombre);
            if (guardado) return;
        }
        await guardarEnWeb(imagenFinal, nombre);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200000,
                backgroundColor: imagenFinal ? 'rgba(0,0,0,0.8)' : 'transparent',
                pointerEvents: imagenFinal ? 'auto' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <button
                id="btn-cerrar-captura"
                onClick={cerrar}
                title="Cerrar"
                style={{
                    position: 'absolute',
                    background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                    width: '44px', height: '44px', color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                    pointerEvents: 'auto',
                }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            {!imagenFinal ? (
                <>
                    {/* La cámara (OrbitControls/zoom) sigue activa detrás de este overlay:
                        el marco solo "recorta" visualmente con un box-shadow gigante,
                        pero no bloquea eventos de mouse/touch (pointerEvents: none). */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div
                            style={{
                                position: 'relative',
                                width: tamanioMarco.width, height: tamanioMarco.height,
                                border: '3px solid white', borderRadius: '4px',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                                pointerEvents: 'none',
                            }}
                        >
                            {mostrarPista && (
                                <div
                                    style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        maxWidth: '70%', textAlign: 'center',
                                        background: 'rgba(0,0,0,0.55)', color: 'white',
                                        padding: '16px 22px', borderRadius: '8px',
                                        fontSize: '14px', lineHeight: 1.5,
                                    }}
                                >
                                    {t['UI_CAPTURA_PISTA']}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Barra lateral de relaciones de aspecto: anclada al borde de la ventana,
                        no al marco (que en "Pantalla" ocupa casi toda la pantalla). */}
                    <div
                        style={{
                            position: 'fixed', right: '28px', top: '50%', transform: 'translateY(-50%)',
                            display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center',
                            pointerEvents: 'auto',
                        }}
                    >
                        {RELACIONES.map((r) => {
                            const activa = relacion === r.clave;
                            const altoIcono = r.clave === 'pantalla' ? 20 : 28 / (r.valor || 1);
                            return (
                                <button
                                    key={r.clave}
                                    onClick={() => setRelacion(r.clave)}
                                    title={r.etiqueta}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        background: 'none', border: 'none',
                                        color: activa ? '#5CB82A' : 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                                        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '28px', height: `${altoIcono}px`,
                                            border: `2px solid ${activa ? '#5CB82A' : 'rgba(255,255,255,0.6)'}`,
                                            borderRadius: '3px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                        }}
                                    />
                                    {r.etiqueta}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={tomarFoto}
                        disabled={generando}
                        title="Tomar foto"
                        style={{
                            position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
                            width: '64px', height: '64px', borderRadius: '50%',
                            backgroundColor: 'white', border: '4px solid rgba(255,255,255,0.35)',
                            cursor: generando ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: generando ? 0.6 : 1,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                            pointerEvents: 'auto',
                        }}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                    </button>
                </>
            ) : (
                <>
                    <img
                        src={imagenFinal}
                        alt="Captura final"
                        style={{ maxWidth: '82vw', maxHeight: '66vh', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                    />

                    <div style={{ display: 'flex', gap: '14px', marginTop: '26px' }}>
                        <button
                            onClick={volverATomar}
                            style={{
                                padding: '12px 22px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                            }}
                        >
                            Tomar otra
                        </button>
                        <button
                            onClick={descargar}
                            style={{
                                padding: '12px 26px', borderRadius: '30px', border: 'none',
                                background: '#5CB82A', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                boxShadow: '0 4px 15px rgba(92,184,42,0.4)',
                            }}
                        >
                            Descargar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
