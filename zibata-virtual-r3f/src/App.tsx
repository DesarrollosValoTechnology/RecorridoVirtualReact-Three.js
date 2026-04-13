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
import { nodosTour } from './data/nodos';
import ControlZoomFOV from './components/ControlZoomFOV';
import TooltipPreview from './components/TooltipPreview';

// 🚨 Ahora le exigimos que reciba controlsRef como parámetro
function SincronizadorRadar({ controlsRef }: { controlsRef: any }) {
    const { camera } = useThree();
    const nodoActual = useTourStore(state => state.nodoActual);
    const panelActivo = useTourStore(state => state.panelActivo);

    useFrame(() => {
        // 🚨 Solo actualizamos si el panel está abierto Y los controles ya existen
        if (panelActivo === 'ubicacion' && controlsRef.current) {
            actualizarMinimapaFrame(camera, controlsRef.current, nodoActual); 
        }
    });

    return null; 
}

// ESPÍA DE ROTACIÓN
function ControladorRotacion({ controlsRef, introTerminada }: { controlsRef: any, introTerminada: boolean }) {
    const { userQuiereRotacion, isTransitioning, menuAbierto, panelActivo } = useTourStore();

    useFrame(() => {
        if (controlsRef.current) {
            const isHovering = document.body.classList.contains('sobre-hotspot');
            const isInteractuando = document.body.classList.contains('pausa-inactividad');

            // 1. Agregamos "introTerminada" a las reglas para que el Tiny Planet se quede quieto
            const debeRotar = introTerminada && 
                              userQuiereRotacion && 
                              !isTransitioning && 
                              !menuAbierto && 
                              panelActivo === null && 
                              !isInteractuando && 
                              !isHovering;

            controlsRef.current.autoRotate = debeRotar;
            
            // 2. ¡Bajamos la velocidad de 0.5 a 0.15 para que sea un paneo elegante!
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
        setNodoActual
    } = useTourStore();


    const controlsRef = useRef<any>(null);
    // 3. Estado para controlar cuándo arranca la rotación inicial
    const [introTerminada, setIntroTerminada] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const nodoCompartido = params.get('nodo');
        if (nodoCompartido && (nodosTour as any)[nodoCompartido]) {
            setNodoActual(nodoCompartido);
        }
    }, [setNodoActual]);

    // EFECTO: Caída Cinematográfica (Intro)
    useEffect(() => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        async function iniciarSecuencia() {
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
            
            // 4. Al terminar la caída (segundo 15), le damos permiso a la cámara de rotar
            setIntroTerminada(true);
        }
        iniciarSecuencia();
    }, [setLogoVisible, setFadeActivo, setIsTransitioning, setMostrarElementos3D]);

    useEffect(() => {
        const info = (nodosTour as any)[nodoActual];
        if (info && info.lat && info.lng) {
            moverMapaANodo(info.lat, info.lng);
        }
    }, [nodoActual]);

    // EFECTO: TEMPORIZADOR DE INACTIVIDAD (5 SEGUNDOS)
    useEffect(() => {
        let temporizadorInactividad: ReturnType<typeof setTimeout>;

        const reiniciarTemporizador = (e: Event) => {
            // 5. IGNORAR LA UI: Si haces clic en un botón (como el de autorotate), ignora el temporizador
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

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
            
            <PantallaCarga />
            <OverlayUI />
            <PanelesOverlay />
            <FadeOverlay />
            <TooltipPreview />

            <Canvas
                camera={{ position: [-1, 250, 0], fov: 140 }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <XR store={xrStore}>
                    <IntroAnimacion />
                    
                    {/* 🚨 AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL: Le pasamos el controlsRef */}
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