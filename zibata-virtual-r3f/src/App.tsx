// src/App.tsx
import { useEffect, Suspense, useRef, useState, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useTourStore } from './store/useTourStore';
import { registrarCanvasCaptura } from './utils/capturaPantalla';
import Escena360 from './components/Escena360';
import OverlayUI from './components/OverlayUI';
import PanelesOverlay from './components/PanelesOverlay';
import FadeOverlay from './components/Fadeoverlay';
import PantallaCarga from './components/PantallaCarga';
import IntroAnimacion from './components/IntroAnimacion';
import { actualizarMinimapaFrame, moverMapaANodo } from './utils/mapaRadar';
import IndicadorFOV from './components/IndicadorFOV';
import ControlZoomFOV from './components/ControlZoomFOV';
import LogoCielo from './components/LogoCielo';
import TooltipPreview from './components/TooltipPreview';
import CapturaFoto from './components/CapturaFoto';

// 🚨 Lazy: el modo admin (?admin=true) es un caso raro para el visitante normal.
// Con import() en vez de import estático, Vite separa cada uno en su propio chunk
// y el navegador de un visitante normal NUNCA los descarga.
const AdminNuevoNodo = lazy(() => import('./components/AdminMode'));
const AdminSidebar = lazy(() => import('./components/AdminSidebar'));
const AdminExplorador = lazy(() => import('./components/AdminExplorador'));
const PanelEditorHotspots = lazy(() => import('./components/PanelEditorHotspots'));
const PanelEditarNodo = lazy(() => import('./components/PanelEditarNodo'));
const PanelEditorLabels = lazy(() => import('./components/PanelEditorLabels'));
const PanelEditorZonas = lazy(() => import('./components/PanelEditorZonas'));

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
    const { userQuiereRotacion, isTransitioning, menuAbierto, panelActivo, capturaAbierta } = useTourStore();

    useFrame(() => {
        if (controlsRef.current) {
            const isHovering = document.body.classList.contains('sobre-hotspot');
            const isInteractuando = document.body.classList.contains('pausa-inactividad');

            const debeRotar = introTerminada &&
                              userQuiereRotacion &&
                              !isTransitioning &&
                              !menuAbierto &&
                              panelActivo === null &&
                              !capturaAbierta &&
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

    const [logoTerminado, setLogoTerminado] = useState(false);

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

    // 🚨 FASE 1: SECUENCIA DEL LOGO
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
            await sleep(4500); 
            setLogoVisible(false);
            await sleep(1500);
            setFadeActivo(false); 
            setLogoTerminado(true); 
        }
        
        reproducirFaseLogo();
    }, [cargandoNodos, isAdmin, setLogoVisible, setFadeActivo]);

    // 🚨 FASE 2: SECUENCIA TINY PLANET
    useEffect(() => {
        if (isAdmin) {
            setMostrarElementos3D(true);
            setIsTransitioning(false);
            setIntroTerminada(true);
            return;
        }

        if (!logoTerminado) return; 

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
    }, [logoTerminado, isAdmin, setIsTransitioning, setMostrarElementos3D]);

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
            if (target && target.closest('button, .panel-contenido, .herramientas-pill, .ui-bottom-bar-pill')) {
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
            <Suspense fallback={null}>
                <AdminSidebar />
                {adminPanelActivo === 'explorador' && <AdminExplorador />}
                {adminPanelActivo === 'nuevoNodo' && <AdminNuevoNodo />}
                {adminPanelActivo === 'editorLabels' && <PanelEditorLabels />}
                {adminPanelActivo === 'editorZonas' && <PanelEditorZonas />}
                {adminPanelActivo === 'editorHotspots' && <PanelEditorHotspots />}
                {adminPanelActivo === 'editarNodo' && <PanelEditarNodo />}
            </Suspense>
        )}

        {/* --- 1. SIEMPRE VISIBLE AL INICIO --- */}
        <PantallaCarga />

        {/* --- 2. UI DEL TOUR (Siempre Activa ahora) --- */}
        <OverlayUI
            esAppEscritorio={false} // Siempre será falso porque esta es la versión web
            isAdmin={isAdmin}
            onVolverAlMenu={() => window.location.reload()} // Como no hay menú local, un recargo limpio por si acaso
        />
        <PanelesOverlay />
        <TooltipPreview />
        <IndicadorFOV />
        <CapturaFoto />

        {/* --- 3. MOTOR 3D --- */}
        <Canvas
            camera={{ position: [-0.001, 250, 0.001], fov: 140 }}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            // 🚨 flat: por defecto r3f aplica tone mapping cinematográfico (ACESFilmic),
            // pensado para escenas 3D con iluminación. Eso "aplana"/desatura los colores
            // reales de las fotos 360 (texturas planas sin luces). Con flat, se muestran
            // los colores del archivo tal cual, sin ese filtro.
            flat
            // preserveDrawingBuffer: necesario para poder leer el <canvas> con toDataURL()
            // (el botón de captura de foto) — sin esto, el buffer se limpia después de
            // pintar cada frame y la imagen capturada saldría en negro.
            gl={{ preserveDrawingBuffer: true }}
            onCreated={({ gl }) => registrarCanvasCaptura(gl.domElement)}
        >
            <IntroAnimacion />
            <SincronizadorRadar controlsRef={controlsRef} />
            <ControladorRotacion controlsRef={controlsRef} introTerminada={introTerminada} />
            <ControlZoomFOV />
            <Suspense fallback={null}>
                <Escena360 />
                <LogoCielo />
            </Suspense>
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableZoom={false}
                enablePan={false}
                rotateSpeed={-0.6}
                enabled={!isTransitioning && !menuAbierto && panelActivo === null}
            />
        </Canvas>
        <FadeOverlay />
    </div>
    );
}

export default App;