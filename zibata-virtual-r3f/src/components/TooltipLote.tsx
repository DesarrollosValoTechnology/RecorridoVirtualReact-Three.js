// src/components/TooltipLote.tsx
//
// Etiqueta chica al pasar el mouse sobre un marcador de lote: clave + DISPONIBLE/NO
// DISPONIBLE, nada más (ni superficie ni precio). Mismo patrón que TooltipPreview.tsx (fixed
// en clientX/clientY, pointerEvents:none) pero aislado del tooltip de hotspots — ese lleva
// título+miniatura de un nodo, forma distinta, y no se toca. Solo aparece con mouse real: en
// táctil no hay hover, así que en el celular esto simplemente nunca se dispara (ver
// MarcadoresLotes.tsx) y el primer toque abre el panel directo.
import { useTourStore } from '../store/useTourStore';

export default function TooltipLote() {
    const tooltipLote = useTourStore((state) => state.tooltipLote);
    if (!tooltipLote) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: `${tooltipLote.x + 16}px`,
                top: `${tooltipLote.y - 14}px`,
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 9999,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
            }}
        >
            {tooltipLote.clave}{' · '}
            <span style={{ color: tooltipLote.disponible ? 'var(--zibata-verde)' : '#999' }}>
                {tooltipLote.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
            </span>
        </div>
    );
}
