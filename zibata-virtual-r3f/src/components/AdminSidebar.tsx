import { useTourStore } from '../store/useTourStore';

export default function AdminSidebar() {
    const { adminPanelActivo, setAdminPanelActivo } = useTourStore();

    const togglePanel = (panel: 'nuevoNodo' | 'editorHotspots') => {
        // Si ya está abierto, lo cierra. Si no, lo abre.
        if (adminPanelActivo === panel) {
            setAdminPanelActivo(null);
        } else {
            setAdminPanelActivo(panel);
        }
    };

    const btnStyle = (activo: boolean) => ({
        width: '50px', height: '50px', marginBottom: '15px', 
        backgroundColor: activo ? '#4a90e2' : 'transparent',
        border: 'none', borderRadius: '12px', color: 'white', 
        fontSize: '24px', cursor: 'pointer', transition: '0.2s',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, height: '100vh', width: '70px',
            backgroundColor: 'rgba(15, 15, 15, 0.95)', borderRight: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px',
            zIndex: 999999 // Por encima de todo
        }}>
            <button 
                title="Añadir Nuevo Nodo"
                style={btnStyle(adminPanelActivo === 'nuevoNodo')}
                onClick={() => togglePanel('nuevoNodo')}
            >
                🏗️
            </button>
            
            <button 
                title="Editar Hotspots y Labels"
                style={btnStyle(adminPanelActivo === 'editorHotspots')}
                onClick={() => togglePanel('editorHotspots')}
            >
                🎯
            </button>
        </div>
    );
}