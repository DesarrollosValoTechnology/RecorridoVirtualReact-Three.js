// src/components/Escena360.tsx
import { useEffect, useRef, lazy } from 'react';
import { useTourStore } from '../store/useTourStore';
import Hotspot from './Hotspot';
import Label from './Label';
import EsferaProgresiva from './EsferaProgresiva';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 🚨 Lazy: solo se usan en modo admin (arrastrar hotspots/labels con TransformControls).
// Un visitante normal nunca los descarga.
const HotspotEditable = lazy(() => import('./HotspotEditable'));
const LabelEditable = lazy(() => import('./LabelEditable'));

function SincronizadorMinimapa({ offsetGrados = 0 }: { offsetGrados: number }) {
    const { camera } = useThree();
    const rotacionAnterior = useRef(0);
    const rotacionAcumulada = useRef(0);
    const vectorDireccion = useRef(new THREE.Vector3());

    useFrame(() => {
        camera.getWorldDirection(vectorDireccion.current);
        const rotacionActual = Math.atan2(vectorDireccion.current.x, vectorDireccion.current.z);
        let delta = rotacionActual - rotacionAnterior.current;

        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        rotacionAcumulada.current += delta;
        rotacionAnterior.current = rotacionActual;

        const offsetRadianes = offsetGrados * (Math.PI / 180);
        const rotacionFinal = rotacionAcumulada.current + offsetRadianes;

        document.documentElement.style.setProperty('--rotacion-gta', `${rotacionFinal}rad`);
    });
    return null;
}

export default function Escena360() {
    const {
        nodoActual,
        nodos,
        setFadeActivo,
        setIsTransitioning,
        mostrarElementos3D,
        adminPanelActivo,
        capturaAbierta
    } = useTourStore();

    const infoNodo = nodos[nodoActual];
    // Ocultamos hotspots/labels mientras se encuadra/toma una captura, para que
    // la foto (y su previsualización en vivo) salga limpia, sin íconos.
    const mostrarElementosInteractivos = mostrarElementos3D && !capturaAbierta;

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeActivo(false);
            setIsTransitioning(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [nodoActual, setFadeActivo, setIsTransitioning]);

    if (!infoNodo) return null;

    return (
        <group>
            <SincronizadorMinimapa offsetGrados={infoNodo.norteOffset || 0} />
            <EsferaProgresiva rutaBajaRes={infoNodo.archivoBlur || infoNodo.archivo} rutaAltaRes={infoNodo.archivo} />

            {/* EL SWAP MÁGICO DE HOTSPOTS */}
            {mostrarElementosInteractivos && infoNodo.hotspots?.map((hotspot: any, index: number) => (
                adminPanelActivo === 'editorHotspots'
                    ? <HotspotEditable key={`edit-hs-${hotspot.id || index}`} datos={hotspot} />
                    : <Hotspot key={`hotspot-${hotspot.id || index}`} datos={hotspot} />
            ))}

            {/* 🚨 EL NUEVO SWAP MÁGICO DE LABELS */}
            {mostrarElementosInteractivos && infoNodo.labels?.map((label: any, index: number) => (
                adminPanelActivo === 'editorLabels'
                    ? <LabelEditable key={`edit-lbl-${label.id || index}`} datos={label} />
                    : <Label key={`label-${label.id || index}`} datos={label} />
            ))}
        </group>
    );
}