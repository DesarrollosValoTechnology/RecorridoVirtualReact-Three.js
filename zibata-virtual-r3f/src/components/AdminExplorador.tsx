import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTourStore } from '../store/useTourStore';
import { TIPOS_HOTSPOT, SVG_URLS } from './Hotspot';

// ==========================================
// 🎨 SISTEMA DE DISEÑO "RAYCAST PREMIUM"
// ==========================================
const panelStyle: CSSProperties = {
    position: 'absolute', top: '20px', left: '90px', width: '440px',
    maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column',
    backgroundColor: 'rgba(15, 15, 15, 0.65)', backdropFilter: 'blur(16px)',
    borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', color: 'white', zIndex: 100000,
    fontFamily: 'system-ui, -apple-system, sans-serif'
};

const inputStyle: CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
};

const miniBtnStyle: CSSProperties = {
    width: '26px', height: '26px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#ccc', cursor: 'pointer', fontSize: '12px'
};

const btnAgregarStyle: CSSProperties = {
    width: '100%', padding: '8px', marginTop: '4px', marginBottom: '10px',
    borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.15)', backgroundColor: 'transparent',
    color: '#aaa', cursor: 'pointer', fontSize: '11px', fontWeight: 600
};

const selectMiniStyle: CSSProperties = {
    flex: 1, minWidth: 0, padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '11px', outline: 'none'
};

const filaStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' };

function tarjetaStyle(esActivo: boolean): CSSProperties {
    return {
        padding: '10px', borderRadius: '14px', marginBottom: '8px',
        backgroundColor: esActivo ? 'rgba(92, 184, 42, 0.08)' : 'rgba(255,255,255,0.02)',
        border: esActivo ? '1px solid rgba(92, 184, 42, 0.3)' : '1px solid rgba(255,255,255,0.05)',
    };
}

function FilaLabel({ label, onGuardar, onBorrar }: { label: any; onGuardar: (texto: string) => void; onBorrar: () => void }) {
    const [texto, setTexto] = useState(label.texto_es || '');

    useEffect(() => { setTexto(label.texto_es || ''); }, [label.texto_es]);

    return (
        <div style={filaStyle}>
            <span>🏷️</span>
            <input
                value={texto}
                placeholder="Texto de la etiqueta..."
                onChange={(e) => setTexto(e.target.value)}
                onBlur={() => texto !== (label.texto_es || '') && onGuardar(texto)}
                style={{ ...selectMiniStyle, flex: 1 }}
            />
            <button title="Borrar etiqueta" onClick={onBorrar} style={{ ...miniBtnStyle, color: '#ff4d4d' }}>🗑</button>
        </div>
    );
}

export default function AdminExplorador() {
    const {
        nodos, nodoActual, setAdminPanelActivo, cargarNodo, cargarNodos,
        actualizarPropiedadesHotspot, borrarHotspot, crearNuevoHotspot,
        actualizarPropiedadesLabel, borrarLabel, crearNuevoLabel,
        borrarNodo, generarBlurParaNodo, generarMiniaturaParaNodo, reoptimizarFoto360ParaNodo,
        marcarNodoPrincipal, actualizarTipoIconoNodo,
    } = useTourStore();
    const [marcandoPrincipalId, setMarcandoPrincipalId] = useState<string | null>(null);

    const handleMarcarPrincipal = async (id: string) => {
        setMarcandoPrincipalId(id);
        try {
            await marcarNodoPrincipal(id);
        } finally {
            setMarcandoPrincipalId(null);
        }
    };

    const [busqueda, setBusqueda] = useState('');
    const [expandido, setExpandido] = useState<Record<string, boolean>>({});
    const [generandoBlur, setGenerandoBlur] = useState(false);
    const [progresoBlur, setProgresoBlur] = useState('');
    const [generandoBlurId, setGenerandoBlurId] = useState<string | null>(null);
    const [generandoMini, setGenerandoMini] = useState(false);
    const [progresoMini, setProgresoMini] = useState('');
    const [generandoMiniId, setGenerandoMiniId] = useState<string | null>(null);
    const [reoptimizandoId, setReoptimizandoId] = useState<string | null>(null);

    // Mostramos el ID, no el título: puede haber varios nodos con el mismo título
    // público —ej. "Zibatá Vista Aérea"— y el ID es lo único que los distingue aquí.
    const opcionesDestino = useMemo(
        () => Object.entries(nodos).map(([id]: any) => ({ id, titulo: id })),
        [nodos]
    );

    const nodosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        return Object.entries(nodos)
            .filter(([id, info]: any) =>
                !termino || id.toLowerCase().includes(termino) || (info.ui?.titulo || '').toLowerCase().includes(termino)
            )
            .sort(([, a]: any, [, b]: any) => (a.ui?.titulo || '').localeCompare(b.ui?.titulo || ''));
    }, [nodos, busqueda]);

    const nodosSinBlur = useMemo(
        () => Object.entries(nodos).filter(([, info]: any) => info.archivo && info.archivoBlur === info.archivo),
        [nodos]
    );

    // Nodos cuya "miniatura" en realidad cae de vuelta a la foto 360 completa (miniatura_url vacío/null)
    const nodosSinMiniatura = useMemo(
        () => Object.entries(nodos).filter(([, info]: any) => info.archivo && info.ui?.miniatura === info.archivo),
        [nodos]
    );

    const toggleExpandido = (id: string) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleGenerarBlur = async (id: string) => {
        setGenerandoBlurId(id);
        try {
            const resultado = await generarBlurParaNodo(id);
            if (!resultado.ok) alert(`❌ Error al generar el blur: ${resultado.error}`);
            else await cargarNodos();
        } finally {
            setGenerandoBlurId(null);
        }
    };

    const handleGenerarBlurFaltantes = async () => {
        if (nodosSinBlur.length === 0) return;
        const ok = window.confirm(`Se generará automáticamente la versión blur para ${nodosSinBlur.length} escena(s) que no la tienen. ¿Continuar?`);
        if (!ok) return;

        setGenerandoBlur(true);
        try {
            for (let i = 0; i < nodosSinBlur.length; i++) {
                const [id] = nodosSinBlur[i];
                setProgresoBlur(`${i + 1}/${nodosSinBlur.length}`);
                const resultado = await generarBlurParaNodo(id);
                if (!resultado.ok) console.error(`No se pudo generar blur para ${id}:`, resultado.error);
            }
            await cargarNodos();
        } finally {
            setGenerandoBlur(false);
            setProgresoBlur('');
        }
    };

    const handleGenerarMiniatura = async (id: string) => {
        setGenerandoMiniId(id);
        try {
            const resultado = await generarMiniaturaParaNodo(id);
            if (!resultado.ok) alert(`❌ Error al generar la miniatura: ${resultado.error}`);
            else await cargarNodos();
        } finally {
            setGenerandoMiniId(null);
        }
    };

    const handleReoptimizarFoto360 = async (id: string) => {
        setReoptimizandoId(id);
        try {
            const resultado = await reoptimizarFoto360ParaNodo(id);
            if (!resultado.ok) alert(`❌ Error al reoptimizar la foto 360: ${resultado.error}`);
            else if (resultado.sinCambios) alert('✅ Esta foto ya está dentro del tamaño seguro (8192x4096) — no se cambió nada.');
            else await cargarNodos();
        } finally {
            setReoptimizandoId(null);
        }
    };

    const handleGenerarMiniaturasFaltantes = async () => {
        if (nodosSinMiniatura.length === 0) return;
        const ok = window.confirm(`Se generará una miniatura real para ${nodosSinMiniatura.length} escena(s) que hoy usan la foto completa como miniatura. ¿Continuar?`);
        if (!ok) return;

        setGenerandoMini(true);
        try {
            for (let i = 0; i < nodosSinMiniatura.length; i++) {
                const [id] = nodosSinMiniatura[i];
                setProgresoMini(`${i + 1}/${nodosSinMiniatura.length}`);
                const resultado = await generarMiniaturaParaNodo(id);
                if (!resultado.ok) console.error(`No se pudo generar miniatura para ${id}:`, resultado.error);
            }
            await cargarNodos();
        } finally {
            setGenerandoMini(false);
            setProgresoMini('');
        }
    };

    const handleBorrarNodo = async (id: string, titulo: string) => {
        const ok = window.confirm(
            `¿Eliminar el nodo "${titulo}" (${id})?\n\nSe borrarán también sus hotspots, etiquetas y fotos asociadas. Esta acción no se puede deshacer.`
        );
        if (!ok) return;
        const resultado = await borrarNodo(id);
        if (!resultado.ok) alert(`❌ Error al borrar el nodo: ${resultado.error}`);
    };

    return (
        <div style={panelStyle}>
            <div style={{ padding: '24px 24px 15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Explorador</h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>{Object.keys(nodos).length} escenas en el recorrido</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setAdminPanelActivo(null)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <input
                    placeholder="Buscar por título o id..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ ...inputStyle, marginTop: '15px' }}
                />

                {nodosSinBlur.length > 0 && (
                    <button
                        onClick={handleGenerarBlurFaltantes}
                        disabled={generandoBlur}
                        style={{
                            width: '100%', marginTop: '10px', padding: '9px', borderRadius: '10px',
                            border: '1px solid rgba(74, 144, 226, 0.3)', backgroundColor: 'rgba(74, 144, 226, 0.12)',
                            color: '#4a90e2', cursor: generandoBlur ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600
                        }}
                    >
                        {generandoBlur
                            ? `Generando blur (${progresoBlur})...`
                            : `🌫️ Generar blur faltante (${nodosSinBlur.length} escena${nodosSinBlur.length === 1 ? '' : 's'})`}
                    </button>
                )}

                {nodosSinMiniatura.length > 0 && (
                    <button
                        onClick={handleGenerarMiniaturasFaltantes}
                        disabled={generandoMini}
                        style={{
                            width: '100%', marginTop: '10px', padding: '9px', borderRadius: '10px',
                            border: '1px solid rgba(226, 167, 74, 0.3)', backgroundColor: 'rgba(226, 167, 74, 0.12)',
                            color: '#e2a74a', cursor: generandoMini ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600
                        }}
                    >
                        {generandoMini
                            ? `Generando miniaturas (${progresoMini})...`
                            : `🖼️ Generar miniatura faltante (${nodosSinMiniatura.length} escena${nodosSinMiniatura.length === 1 ? '' : 's'})`}
                    </button>
                )}
            </div>

            <div style={{ overflowY: 'auto', padding: '15px 24px 24px' }}>
                {nodosFiltrados.length === 0 && (
                    <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px 0' }}>Sin resultados.</p>
                )}

                {nodosFiltrados.map(([id, info]: any) => {
                    const esActivo = id === nodoActual;
                    const abierto = !!expandido[id];
                    const hotspots = info.hotspots || [];
                    const labels = info.labels || [];
                    const sinBlur = !!info.archivo && info.archivoBlur === info.archivo;
                    const sinMiniatura = !!info.archivo && info.ui?.miniatura === info.archivo;

                    return (
                        <div key={id} style={tarjetaStyle(esActivo)}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <img
                                    src={info.ui?.miniatura}
                                    alt=""
                                    width={56}
                                    height={42}
                                    style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, backgroundColor: '#111' }}
                                />
                                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => toggleExpandido(id)}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.35 }}>
                                        {info.ui?.titulo || id} {esActivo && <span style={{ color: '#5cb82a', fontSize: '10px' }}>● AQUÍ</span>} {info.esPrincipal && <span style={{ color: '#ffd54a', fontSize: '10px' }}>★ PRINCIPAL</span>}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#7bd88f', fontFamily: 'monospace', marginTop: '2px' }}>{id}</div>
                                    <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{hotspots.length} hotspots · {labels.length} etiquetas</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                                <button
                                    title={info.esPrincipal ? 'Este es el nodo principal: el recorrido inicia aquí' : 'Marcar como nodo principal (con el que inicia el recorrido)'}
                                    onClick={() => handleMarcarPrincipal(id)}
                                    disabled={!!info.esPrincipal || marcandoPrincipalId === id}
                                    style={{ ...miniBtnStyle, color: info.esPrincipal ? '#ffd54a' : '#888' }}
                                >
                                    {marcandoPrincipalId === id ? '⏳' : (info.esPrincipal ? '⭐' : '☆')}
                                </button>
                                <button
                                    title="Reoptimizar foto 360 (si excede 8192x4096, el navegador la reescala solo con mala calidad)"
                                    onClick={() => handleReoptimizarFoto360(id)}
                                    disabled={reoptimizandoId === id}
                                    style={{ ...miniBtnStyle, color: '#7e968a' }}
                                >
                                    {reoptimizandoId === id ? '⏳' : '📐'}
                                </button>
                                {sinBlur && (
                                    <button
                                        title="Sin versión blur: generarla a partir de la foto 360 actual"
                                        onClick={() => handleGenerarBlur(id)}
                                        disabled={generandoBlurId === id}
                                        style={{ ...miniBtnStyle, color: '#4a90e2' }}
                                    >
                                        {generandoBlurId === id ? '⏳' : '🌫️'}
                                    </button>
                                )}
                                {sinMiniatura && (
                                    <button
                                        title="Sin miniatura: hoy usa la foto completa. Generar miniatura real"
                                        onClick={() => handleGenerarMiniatura(id)}
                                        disabled={generandoMiniId === id}
                                        style={{ ...miniBtnStyle, color: '#e2a74a' }}
                                    >
                                        {generandoMiniId === id ? '⏳' : '🖼️'}
                                    </button>
                                )}
                                <button title="Ir a esta escena" onClick={() => cargarNodo(id)} style={miniBtnStyle}>➜</button>
                                <button title={abierto ? 'Contraer' : 'Ver hotspots y etiquetas'} onClick={() => toggleExpandido(id)} style={miniBtnStyle}>{abierto ? '▲' : '▼'}</button>
                                <button title="Eliminar nodo" onClick={() => handleBorrarNodo(id, info.ui?.titulo || id)} style={{ ...miniBtnStyle, color: '#ff4d4d' }}>🗑</button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                <img
                                    src={SVG_URLS[info.tipoIcono] || SVG_URLS.dron}
                                    alt=""
                                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                                />
                                <select
                                    title="Tipo de ícono de este nodo (se usa en el mapa satelital y en los hotspots que apunten aquí)"
                                    value={info.tipoIcono}
                                    onChange={(e) => actualizarTipoIconoNodo(id, e.target.value)}
                                    style={{ ...selectMiniStyle, flex: 1 }}
                                >
                                    {TIPOS_HOTSPOT.map((t) => (
                                        <option key={t.key} value={t.key} style={{ color: 'black' }}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {abierto && (
                                <div style={{ marginTop: '12px', paddingLeft: '10px', borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '10px', color: '#4a90e2', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        HOTSPOTS ({hotspots.length})
                                    </div>
                                    {hotspots.map((h: any) => (
                                        <div key={h.id} style={filaStyle}>
                                            <img
                                                src={SVG_URLS[nodos[h.destino]?.tipoIcono] || SVG_URLS.dron}
                                                alt=""
                                                title="Ícono heredado del tipo del nodo destino"
                                                style={{ width: '16px', height: '16px', flexShrink: 0 }}
                                            />
                                            <select
                                                value={h.destino}
                                                onChange={(e) => actualizarPropiedadesHotspot(h.id, e.target.value)}
                                                style={selectMiniStyle}
                                            >
                                                {opcionesDestino.map((opc) => (
                                                    <option key={opc.id} value={opc.id} style={{ color: 'black' }}>{opc.titulo}</option>
                                                ))}
                                            </select>
                                            <button title="Borrar hotspot" onClick={() => borrarHotspot(h.id)} style={{ ...miniBtnStyle, color: '#ff4d4d' }}>🗑</button>
                                        </div>
                                    ))}
                                    <button onClick={() => crearNuevoHotspot(id)} style={btnAgregarStyle}>+ Agregar hotspot</button>

                                    <div style={{ fontSize: '10px', color: '#e2a74a', fontWeight: 700, margin: '10px 0 6px', letterSpacing: '0.5px' }}>
                                        ETIQUETAS ({labels.length})
                                    </div>
                                    {labels.map((l: any) => (
                                        <FilaLabel
                                            key={l.id}
                                            label={l}
                                            onGuardar={(texto) => actualizarPropiedadesLabel(l.id, 'texto_es', texto)}
                                            onBorrar={() => borrarLabel(l.id)}
                                        />
                                    ))}
                                    <button onClick={() => crearNuevoLabel(id)} style={btnAgregarStyle}>+ Agregar etiqueta</button>

                                    <p style={{ fontSize: '10px', color: '#666', margin: '2px 0 0' }}>
                                        * Para mover la posición 3D de un hotspot o etiqueta, entra a la escena y arrástralo directamente.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
