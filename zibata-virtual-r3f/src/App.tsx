// src/App.tsx
import { useEffect, Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { XR } from '@react-three/xr'; 
import { xrStore } from './store/xrStore'; 
import { useTourStore } from './store/useTourStore';
import Escena360 from './components/Escena360';
import OverlayUI from './components/OverlayUI';
import PanelesOverlay from './components/PanelesOverlay';
import FadeOverlay from './components/Fadeoverlay';
import PantallaCarga from './components/PantallaCarga';
import IntroAnimacion from './components/IntroAnimacion';
import { actualizarMinimapaFrame, moverMapaANodo } from './utils/mapaRadar';
import AdminNuevoNodo from './components/AdminMode';
import AdminSidebar from './components/AdminSidebar';
import PanelEditorHotspots from './components/PanelEditorHotspots';
import PanelEditarNodo from './components/PanelEditarNodo';
import PanelEditorLabels from './components/PanelEditorLabels';
import IndicadorFOV from './components/IndicadorFOV';
import ControlZoomFOV from './components/ControlZoomFOV';
import TooltipPreview from './components/TooltipPreview';
import GaleriaRenders from './components/GaleriaRenders';
import { Capacitor } from '@capacitor/core';

// 🚨 NUEVO: Importamos el menú del Showroom (Kiosco)
import MenuPrevio from './components/MenuPrevio';

function SincronizadorRadar({ controlsRef }: { controlsRef: any }) {
    const { camera } = useThree();
    const nodoActual = useTourStore(state => state.nodoActual);
    const panelActivo = useTourStore(state => state.panelActivo);

    useFrame(() => {
        if (panelActivo === 'ubicacion' && controlsRef.current) {
            actualizarMinimapaFrame(camera, controlsRef.current, nodoActual); 
        }
    });
    return null; 
}

function ControladorRotacion({ controlsRef, introTerminada }: { controlsRef: any, introTerminada: boolean }) {
    const { userQuiereRotacion, isTransitioning, menuAbierto, panelActivo } = useTourStore();

    useFrame(() => {
        if (controlsRef.current) {
            const isHovering = document.body.classList.contains('sobre-hotspot');
            const isInteractuando = document.body.classList.contains('pausa-inactividad');

            const debeRotar = introTerminada && 
                              userQuiereRotacion && 
                              !isTransitioning && 
                              !menuAbierto && 
                              panelActivo === null && 
                              !isInteractuando && 
                              !isHovering;

            controlsRef.current.autoRotate = debeRotar;
            controlsRef.current.autoRotateSpeed = 0.15; 
        }
    });
    return null;
}

function App() {
    const { 
        setLogoVisible, 
        setFadeActivo, 
        setIsTransitioning, 
        setMostrarElementos3D,
        isTransitioning,
        menuAbierto,
        panelActivo,
        nodoActual,
        setNodoActual,
        cargarNodos,
        cargandoNodos,
        nodos
    } = useTourStore();

    const controlsRef = useRef<any>(null);
    const [introTerminada, setIntroTerminada] = useState(false);

    // 🚨 1. LEEMOS EL ENTORNO EXACTAMENTE AL MONTAR EL COMPONENTE
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    const { adminPanelActivo } = useTourStore();

    const esEntornoKiosco = typeof window !== 'undefined' && (
        Capacitor.isNativePlatform() || 
        navigator.userAgent.toLowerCase().includes('electron') ||
        /android|ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase())
    );

    // 🚨 2. LAZY STATE: Forzamos el menú si es Kiosco o Móvil
    const [pantallaActiva, setPantallaActiva] = useState(() => {
        if (isAdmin) return 'recorrido';
        if (esEntornoKiosco) return 'menu';
        return 'recorrido'; // Default para web normal
    });

    const [logoTerminado, setLogoTerminado] = useState(false);

    // ... (aquí siguen tus useEffects de Supabase y el Logo) ...

    // DISPARADOR DE SUPABASE
    useEffect(() => {
        cargarNodos();
    }, [cargarNodos]);

    // LECTURA DE URL COMPARTIDA
    useEffect(() => {
        if (!cargandoNodos && Object.keys(nodos).length > 0) {
            const params = new URLSearchParams(window.location.search);
            const nodoCompartido = params.get('nodo');
            if (nodoCompartido && nodos[nodoCompartido]) {
                setNodoActual(nodoCompartido);
            }
        }
    }, [cargandoNodos, nodos, setNodoActual]);

    // 🚨 FASE 1: SECUENCIA DEL LOGO (Común para Web y App)
    useEffect(() => {
        if (cargandoNodos) return;

        async function reproducirFaseLogo() {
            if (isAdmin) {
                setLogoVisible(false);
                setFadeActivo(false);
                setLogoTerminado(true);
                return;
            }

            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            await sleep(4500); // 2000 + 2500 originales
            setLogoVisible(false);
            await sleep(1500);
            setFadeActivo(false); 
            setLogoTerminado(true); // Avisamos que el logo ya se quitó
        }
        
        reproducirFaseLogo();
    }, [cargandoNodos, isAdmin, setLogoVisible, setFadeActivo]);

    // 🚨 FASE 2: SECUENCIA TINY PLANET (Solo se dispara en el recorrido)
        useEffect(() => {
            if (isAdmin) {
                setMostrarElementos3D(true);
                setIsTransitioning(false);
                setIntroTerminada(true);
                return;
            }

        if (!logoTerminado) return; // Esperamos a que el Logo termine
        
        // 🛑 EL FIX: Si no estamos explícitamente en 'recorrido', quédate congelado
        if (pantallaActiva !== 'recorrido') return; 

        async function reproducirFaseTinyPlanet() {
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            setIsTransitioning(true);
            await sleep(7000);
            setMostrarElementos3D(true);
            await sleep(2000);
            setIsTransitioning(false);
            setIntroTerminada(true);
        }

        reproducirFaseTinyPlanet();
    }, [logoTerminado, pantallaActiva, isAdmin, setIsTransitioning, setMostrarElementos3D]);
    // ACTUALIZAMOS EL MINIMAPA
    useEffect(() => {
        const info = nodos[nodoActual];
        if (info && info.lat && info.lng) { 
            moverMapaANodo(Number(info.lat), Number(info.lng));
        }
    }, [nodoActual, nodos]);

    // TEMPORIZADOR DE INACTIVIDAD
    useEffect(() => {
        let temporizadorInactividad: ReturnType<typeof setTimeout>;

        const reiniciarTemporizador = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.closest('button, .panel-contenido, .herramientas-pill, .ui-bottom-bar-pill, .menu-kiosco-btn')) {
                return;
            }

            document.body.classList.add('pausa-inactividad');
            clearTimeout(temporizadorInactividad);

            temporizadorInactividad = setTimeout(() => {
                document.body.classList.remove('pausa-inactividad');
            }, 5000);
        };

        window.addEventListener('mousedown', reiniciarTemporizador);
        window.addEventListener('touchstart', reiniciarTemporizador, { passive: true });
        window.addEventListener('wheel', reiniciarTemporizador, { passive: true });

        return () => {
            window.removeEventListener('mousedown', reiniciarTemporizador);
            window.removeEventListener('touchstart', reiniciarTemporizador);
            window.removeEventListener('wheel', reiniciarTemporizador);
            clearTimeout(temporizadorInactividad);
        };
    }, []);
    
    // PANTALLA DE CARGA PREVIA PARA EVITAR ERRORES 3D
    if (cargandoNodos) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: 'white', fontFamily: 'sans-serif' }}>Conectando servidor...</h2>
            </div>
        );
    }

    if (Object.keys(nodos).length === 0) {
        return <div style={{ color: 'white' }}>Error: No se encontraron escenas en la base de datos.</div>;
    }

   return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
        
        {/* --- MODO EDITOR UI --- */}
        {isAdmin && (
            <>
                <AdminSidebar />
                {adminPanelActivo === 'nuevoNodo' && <AdminNuevoNodo />}
                {adminPanelActivo === 'editorLabels' && <PanelEditorLabels />}
                {adminPanelActivo === 'editorHotspots' && <PanelEditorHotspots />}
                {adminPanelActivo === 'editarNodo' && <PanelEditarNodo />} 
            </>
        )}

        {/* --- 1. SIEMPRE VISIBLE AL INICIO --- */}
        <PantallaCarga />

{/* --- 2. EL MENÚ DEL SHOWROOM --- */}
        {/* 🚨 FIX: Quitamos la condición "logoTerminado &&" y agregamos backgroundColor: '#000' 
            para que el menú cargue escondido detrás del logo y bloquee el 3D al 100% */}
            {pantallaActiva === 'menu' && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, backgroundColor: '#000' }}>
                    <MenuPrevio 
                        onIrAlRecorrido={() => setPantallaActiva('recorrido')} 
                        onIrAGaleria={() => setPantallaActiva('galeria')}
                        onIrAShowroomUnity={() => setPantallaActiva('showroomUnity')}
                    />
                </div>
            )}

        {/* 🚨 FIX: También le quitamos el "logoTerminado &&" a la Galería y le ponemos fondo oscuro por si acaso */}
            {pantallaActiva === 'galeria' && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, backgroundColor: '#000' }}>
                    <GaleriaRenders onVolverAlMenu={() => setPantallaActiva('menu')} />
                </div>
            )}

            {/* 🚨 PANTALLA NUEVA: SHOWROOM DE UNITY 🚨 */}
            {pantallaActiva === 'showroomUnity' && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, backgroundColor: '#000' }}>
                    
                    {/* BOTÓN REACT PARA CERRAR UNITY */}
                    <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 110 }}>
                        <button 
                            onClick={() => setPantallaActiva('menu')} 
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                backgroundColor: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(12px)',
                                color: 'white', padding: '12px 24px', borderRadius: '9999px',
                                border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '13px', fontWeight: 600,
                                letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.9)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.7)'}
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            VOLVER AL MENÚ
                        </button>
                    </div>

                    {/* EL CONTENEDOR DE UNITY */}
                    <iframe 
                        src="/unity-build/index.html" 
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        title="Showroom Interactivo"
                    />
                </div>
            )}

            {/* --- 3. UI DEL TOUR --- */}
                {pantallaActiva === 'recorrido' && (
                    <>
                        <OverlayUI 
                            esAppEscritorio={esEntornoKiosco} // 👈 ¡Cambia esto también!
                            onVolverAlMenu={() => setPantallaActiva('menu')} 
                        />
                <PanelesOverlay />
                <FadeOverlay />
                <TooltipPreview />
                <IndicadorFOV />
            </>
        )}

        {/* --- 4. MOTOR 3D (Se monta siempre en el fondo para precargar gráficos) --- */}
        <Canvas
            camera={{ position: [-0.001, 250, 0.001], fov: 140 }}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        >
            <XR store={xrStore}>
                {/* La animación solo se dispara cuando el Effect de Fase 2 lo ordena */}
                <IntroAnimacion />
                <SincronizadorRadar controlsRef={controlsRef} />
                <ControladorRotacion controlsRef={controlsRef} introTerminada={introTerminada} />
                <ControlZoomFOV />
                <Suspense fallback={null}>
                    <Escena360 />
                </Suspense>
                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    enableZoom={false} 
                    enablePan={false}
                    rotateSpeed={-0.6}
                    enabled={!isTransitioning && !menuAbierto && panelActivo === null}
                />
            </XR>
        </Canvas>
    </div>
    );
}

export default App;