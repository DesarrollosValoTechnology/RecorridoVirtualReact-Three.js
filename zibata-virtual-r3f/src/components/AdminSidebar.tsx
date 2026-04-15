// src/components/AdminSidebar.tsx
import { useTourStore } from '../store/useTourStore';
import { useState } from 'react';

export default function AdminSidebar() {
    const { adminPanelActivo, setAdminPanelActivo } = useTourStore();
    const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

    // Sistema de estilos dinámicos (Colores Raycast Studio)
    const getBtnStyle = (isActive: boolean, isHovered: boolean, activeColor: string = '#5cb82a') => ({
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        border: isActive ? `1px solid ${activeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: isActive ? `${activeColor}26` : (isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(10, 10, 10, 0.6)'),
        color: isActive ? activeColor : (isHovered ? '#ffffff' : '#888888'),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? `0 0 15px ${activeColor}4D` : 'none',
    });

    const togglePanel = (panel: any) => {
        setAdminPanelActivo(adminPanelActivo === panel ? null : panel);
    };

    return (
        <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 100000,
            backgroundColor: 'rgba(15, 15, 15, 0.45)',
            backdropFilter: 'blur(12px)',
            padding: '12px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
        }}>
            {/* 1. AÑADIR NUEVO NODO (Verde) */}
            <button 
                title="Añadir Nuevo Nodo"
                style={getBtnStyle(adminPanelActivo === 'nuevoNodo', hoveredBtn === 'nuevo')}
                onMouseEnter={() => setHoveredBtn('nuevo')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('nuevoNodo')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            </button>

            {/* 2. EDITAR HOTSPOTS (Azul) */}
            <button 
                title="Editar Hotspots"
                style={getBtnStyle(adminPanelActivo === 'editorHotspots', hoveredBtn === 'hotspots', '#4a90e2')}
                onMouseEnter={() => setHoveredBtn('hotspots')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('editorHotspots')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/></svg>
            </button>

            {/* 3. CONFIGURACIÓN DEL NODO (Gris/Blanco) */}
            <button 
                title="Configuración del Nodo"
                style={getBtnStyle(adminPanelActivo === 'editarNodo', hoveredBtn === 'config', '#ffffff')}
                onMouseEnter={() => setHoveredBtn('config')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('editarNodo')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg>
            </button>

            {/* 🚨 4. BOTÓN NUEVO: EDITOR DE LABELS (Dorado/Naranja) */}
            <button 
                title="Editor de Etiquetas"
                style={getBtnStyle(adminPanelActivo === 'editorLabels', hoveredBtn === 'labels', '#e2a74a')}
                onMouseEnter={() => setHoveredBtn('labels')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('editorLabels')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
                </svg>
            </button>
        </div>
    );
}