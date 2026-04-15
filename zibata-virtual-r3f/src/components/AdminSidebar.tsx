// src/components/AdminSidebar.tsx
import { useTourStore } from '../store/useTourStore';
import { useState } from 'react';

export default function AdminSidebar() {
    const { adminPanelActivo, setAdminPanelActivo } = useTourStore();
    const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

    // Los botones se quedan EXACTAMENTE igual
    const getBtnStyle = (isActive: boolean, isHovered: boolean) => ({
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        border: isActive ? '1px solid rgba(92, 184, 42, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: isActive ? 'rgba(92, 184, 42, 0.15)' : (isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(10, 10, 10, 0.6)'),
        color: isActive ? '#5cb82a' : (isHovered ? '#ffffff' : '#888888'),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? '0 0 15px rgba(92, 184, 42, 0.3)' : 'none',
    });

    const togglePanel = (panel: 'nuevoNodo' | 'editorHotspots' | 'editarNodo') => {
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
            gap: '15px', // Separación automática entre botones
            zIndex: 100000,
            
            // 🚨 LO NUEVO: El estilo de la cápsula (Dock)
            backgroundColor: 'rgba(15, 15, 15, 0.45)', // Fondo oscuro semi-transparente
            backdropFilter: 'blur(12px)',              // Efecto cristal (desenfoca lo de atrás)
            padding: '12px',                           // Espacio interno para que no queden apretados
            borderRadius: '20px',                      // Bordes bien redondeados
            border: '1px solid rgba(255, 255, 255, 0.08)', // Borde sutil tipo Apple
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'    // Sombra profunda para que flote
        }}>
            {/* 1. BOTÓN: AÑADIR NUEVO NODO */}
            <button 
                title="Añadir Nuevo Nodo"
                style={getBtnStyle(adminPanelActivo === 'nuevoNodo', hoveredBtn === 'nuevo')}
                onMouseEnter={() => setHoveredBtn('nuevo')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('nuevoNodo')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
                </svg>
            </button>

            {/* 2. BOTÓN: EDITAR HOTSPOTS */}
            <button 
                title="Editar Hotspots"
                style={getBtnStyle(adminPanelActivo === 'editorHotspots', hoveredBtn === 'hotspots')}
                onMouseEnter={() => setHoveredBtn('hotspots')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('editorHotspots')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/>
                </svg>
            </button>

            {/* 3. BOTÓN: CONFIGURACIÓN DEL NODO */}
            <button 
                title="Configuración del Nodo"
                style={getBtnStyle(adminPanelActivo === 'editarNodo', hoveredBtn === 'config')}
                onMouseEnter={() => setHoveredBtn('config')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => togglePanel('editarNodo')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/>
                </svg>
            </button>
        </div>
    );
}