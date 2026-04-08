// src/App.tsx
import { useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'; // 🚨 Agregados useFrame y useThree
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

// Componente espía que actualiza el radar del mapa en cada cuadro de animación
function SincronizadorRadar() {
    const { camera } = useThree();
    const nodoActual = useTourStore(state => state.nodoActual);
    const panelActivo = useTourStore(state => state.panelActivo);

    useFrame((state) => {
        // Solo gasta recursos actualizando el mapa si el panel está abierto
        if (panelActivo === 'ubicacion') {
            actualizarMinimapaFrame(camera, state.controls, nodoActual); 
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
        nodoActual // 🚨 Agregado para que el mapa sepa dónde estamos
    } = useTourStore();

    // 1. Efecto de Caída Cinematográfica (Tu Intro)
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
        }
        iniciarSecuencia();
    }, [setLogoVisible, setFadeActivo, setIsTransitioning, setMostrarElementos3D]);

    // 🚨 2. Efecto para mover el Mapa de Google cuando cambias de Nodo
    useEffect(() => {
        const info = (nodosTour as any)[nodoActual];
        if (info && info.lat && info.lng) {
            moverMapaANodo(info.lat, info.lng);
        }
    }, [nodoActual]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
            
            <PantallaCarga />
            <OverlayUI />
            <PanelesOverlay />
            <FadeOverlay />

            <Canvas
                camera={{ position: [-1, 250, 0], fov: 140 }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <XR store={xrStore}>
                    <IntroAnimacion />
                    <SincronizadorRadar />

                    {/* 🚨 PONEMOS NUESTRO LENTE MÁGICO AQUÍ */}
                    <ControlZoomFOV />

                    <Suspense fallback={null}>
                        <Escena360 />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        
                        /* 🚨 APAGAMOS EL ZOOM DE CARRITO FALSO */
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