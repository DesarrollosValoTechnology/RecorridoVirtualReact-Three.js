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

// 🚨 1. ADIÓS AL ARCHIVO ESTÁTICO:
// import { nodosTour } from './data/nodos'; 
import ControlZoomFOV from './components/ControlZoomFOV';
import TooltipPreview from './components/TooltipPreview';

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
        // 🚨 2. TRAEMOS LAS VARIABLES DE SUPABASE
        cargarNodos,
        cargandoNodos,
        nodos
    } = useTourStore();

    const controlsRef = useRef<any>(null);
    const [introTerminada, setIntroTerminada] = useState(false);

    // 🚨 LA RUTA SECRETA
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    const { adminPanelActivo } = useTourStore(); // Traemos el estado actual

    // 🚨 3. EL DISPARADOR DE SUPABASE
    // Se ejecuta una sola vez al abrir la página
    useEffect(() => {
        cargarNodos();
    }, [cargarNodos]);

    // 🚨 4. ACTUALIZAMOS LA LECTURA DE URL COMPARTIDA
    useEffect(() => {
        // Solo ejecutamos esto si YA terminamos de cargar los nodos de la BD
        if (!cargandoNodos && Object.keys(nodos).length > 0) {
            const params = new URLSearchParams(window.location.search);
            const nodoCompartido = params.get('nodo');
            if (nodoCompartido && nodos[nodoCompartido]) {
                setNodoActual(nodoCompartido);
            }
        }
    }, [cargandoNodos, nodos, setNodoActual]);

    // EFECTO: Caída Cinematográfica (Intro)
useEffect(() => {
    if (cargandoNodos) return;

    async function iniciarSecuencia() {
        // 🚀 EL "FAST-PASS" PARA ADMIN
        if (isAdmin) {
            setLogoVisible(false);
            setFadeActivo(false);
            setMostrarElementos3D(true);
            setIsTransitioning(false);
            setIntroTerminada(true); // Esto detiene la rotación de la intro
            return; // Nos salimos de la función aquí mismo
        }

        // --- SECUENCIA NORMAL PARA MORTALES ---
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(2000);
        await sleep(2500);
        setLogoVisible(false);
        await sleep(1500);
        setFadeActivo(false); 
        setIsTransitioning(true);
        await sleep(7000);
        setMostrarElementos3D(true);
        await sleep(2000);
        setIsTransitioning(false);
        setIntroTerminada(true);
    }
    
    iniciarSecuencia();
}, [cargandoNodos, isAdmin, setLogoVisible, setFadeActivo, setIsTransitioning, setMostrarElementos3D]);

    // 🚨 5. ACTUALIZAMOS EL MINIMAPA PARA QUE LEA DE LA BD
    //Pasar Latitud y Longitud reales al mapa de Google
    useEffect(() => {
        const info = nodos[nodoActual];
        // Antes tenías: moverMapaANodo(info.mapaX, info.mapaY); <- ERROR
        if (info && info.lat && info.lng) { 
            moverMapaANodo(Number(info.lat), Number(info.lng));
        }
    }, [nodoActual, nodos]);

    // EFECTO: TEMPORIZADOR DE INACTIVIDAD
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
    

    // 🚨 6. PANTALLA DE CARGA PREVIA PARA EVITAR ERRORES 3D
    if (cargandoNodos) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Puedes poner tu logo de Supraterra o Raycast aquí mientras carga la BD */}
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
        {/* Encapsulamos TODO lo que sea de admin aquí adentro */}
        {isAdmin && (
    <>
        <AdminSidebar />
        {adminPanelActivo === 'nuevoNodo' && <AdminNuevoNodo />}
        {adminPanelActivo === 'editorHotspots' && (
            <>
                <PanelEditorHotspots />
                </>
            )}
        {adminPanelActivo === 'editarNodo' && <PanelEditarNodo />} 
        </>
    )}

            <PantallaCarga />
            <OverlayUI />
            <PanelesOverlay />
            <FadeOverlay />
            <TooltipPreview />

            <Canvas
                camera={{ position: [-0.001, 250, 0.001], fov: 140 }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <XR store={xrStore}>
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