// src/utils/mapaRadar.ts
/// <reference types="@types/google.maps" />
import { nodosTour } from '../data/nodos';
import { useTourStore } from '../store/useTourStore';

let mapaSat: google.maps.Map | null = null;
let mapProjectionOverlay: google.maps.Projection | any = null;
let coordActuales = { lat: 20.676716, lng: -100.335424 };

const ICONOS: Record<string, string> = {
    drone: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="11.5" fill="black" stroke="white" stroke-width="0.5"/><g transform="translate(4.8, 4.8) scale(0.6)"><path d="M10 10 7 7"/><path d="m10 14-3 3"/><path d="m14 10 3-3"/><path d="m14 14 3 3"/><path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/><path d="M19.637 14a4 4 0 1 1-5.432 5.868"/><path d="M4.367 10a4 4 0 1 1 5.438-5.862"/><path d="M9.795 19.862a4 4 0 1 1-5.429-5.873"/><rect x="10" y="8" width="4" height="8" rx="1"/></g></svg>`,
    casa: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="11.5" fill="black" stroke="white" stroke-width="0.5"/><g transform="translate(5, 5) scale(0.6)"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></g></svg>`,
    pasos: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="11.5" fill="black" stroke="white" stroke-width="0.5"/><g transform="translate(4.8, 4.8) scale(0.6)"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></g></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="11.5" fill="black" stroke="white" stroke-width="0.5"/><g transform="translate(4.8, 4.8) scale(0.6)"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></g></svg>`
};

export function abrirMapaInteractivo() {
    setTimeout(() => {
        if (!mapaSat) {
            const mapElement = document.getElementById('mapa-satelital');
            if (!mapElement) return; // Salir si el DOM no está listo

            const estiloOscuro = [
                { elementType: "geometry", stylers: [{ color: "#212121" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] }
            ];

            mapaSat = new google.maps.Map(mapElement, {
                center: { lat: coordActuales.lat, lng: coordActuales.lng },
                zoom: 17,
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                mapTypeId: 'satellite'
            });

            mapaSat.mapTypes.set('normal_dark', new google.maps.StyledMapType(estiloOscuro, { name: 'Normal' }));

            class CustomOverlay extends google.maps.OverlayView {
                onAdd() {}
                draw() { mapProjectionOverlay = this.getProjection(); }
                onRemove() {}
            }
            const overlay = new CustomOverlay();
            overlay.setMap(mapaSat);

            // Manejar botones de estilo si existen
            document.querySelectorAll('.btn-map-style').forEach(boton => {
                boton.addEventListener('click', (e) => {
                    document.querySelectorAll('.btn-map-style').forEach(b => b.classList.remove('active'));
                    const target = e.target as HTMLElement;
                    target.classList.add('active');
                    const estilo = target.getAttribute('data-style');
                    if (estilo === 'satelite' && mapaSat) mapaSat.setMapTypeId('satellite');
                    if (estilo === 'hibrido' && mapaSat) mapaSat.setMapTypeId('hybrid');
                    if (estilo === 'normal' && mapaSat) mapaSat.setMapTypeId('normal_dark');
                });
            });
        } else {
            google.maps.event.trigger(mapaSat, 'resize');
            mapaSat.setCenter({ lat: coordActuales.lat, lng: coordActuales.lng });
        }
    }, 100);
}

export function moverMapaANodo(lat?: number, lng?: number) {
    if (lat && lng) {
        coordActuales = { lat, lng };
        if (mapaSat) {
            mapaSat.panTo({ lat: coordActuales.lat, lng: coordActuales.lng });
            mapaSat.setZoom(17);
        }
    }
}

export function actualizarMinimapaFrame(camera: any, controls: any, nodoActual: string) {
    const path = document.getElementById('cono-radar-path');
    const svgParent = document.getElementById('cono-radar-svg');
    const puntoBlanco = document.getElementById('punto-central-radar');
    const contenedorIconos = document.getElementById('contenedor-iconos-mapa');
    const tooltip = document.getElementById('tooltip-preview');

    if (!mapaSat || !contenedorIconos || !camera || !path || !svgParent) return;

    // 1. DIBUJAR PINES EN EL DOM (Solo la primera vez)
    if (contenedorIconos.children.length === 0) {
        for (const [id, info] of Object.entries(nodosTour)) {
            if (info.lat && info.lng) {
                const divIcono = document.createElement('div');
                divIcono.id = `map-icon-${id}`;
                const tipo = (info.hotspots && info.hotspots.length > 0 && info.hotspots[0].tipo) ? info.hotspots[0].tipo : 'pasos';
                divIcono.className = `icon-mapa ${tipo}`;
                divIcono.innerHTML = ICONOS[tipo] || ICONOS['pasos'];

                divIcono.addEventListener('mouseenter', () => {
                    if (info.ui && tooltip) {
                        (document.getElementById('img-preview') as HTMLImageElement).src = info.ui.miniatura;
                        (document.getElementById('titulo-preview') as HTMLElement).textContent = info.ui.titulo;
                        tooltip.style.display = 'flex';
                        tooltip.style.width = '140px';
                    }
                });

                divIcono.addEventListener('mousemove', (e) => {
                    if (tooltip) {
                        tooltip.style.left = `${e.clientX + 15}px`;
                        tooltip.style.top = `${e.clientY - 25}px`;
                    }
                });

                divIcono.addEventListener('mouseleave', () => { if (tooltip) tooltip.style.display = 'none'; });

                divIcono.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (tooltip) tooltip.style.display = 'none';

                    const store = useTourStore.getState();
                    if (!store.isTransitioning) {
                        store.cargarNodo(id);
                        store.setPanelActivo(null); // Cerrar panel
                    }
                });
                contenedorIconos.appendChild(divIcono);
            }
        }
    }

    // 2. SINCRONIZAR POSICIONES GEOGRÁFICAS
    for (const [id, info] of Object.entries(nodosTour)) {
        const el = document.getElementById(`map-icon-${id}`);
        if (el && info.lat && info.lng && mapProjectionOverlay) {
            const latLng = new google.maps.LatLng(info.lat, info.lng);
            const pos = mapProjectionOverlay.fromLatLngToContainerPixel(latLng);

            if (!pos) continue;
            el.style.left = `${pos.x}px`;
            el.style.top = `${pos.y}px`;

            if (id === nodoActual) {
                el.classList.add('active');
                svgParent.style.left = `${pos.x}px`; svgParent.style.top = `${pos.y}px`;
                if(puntoBlanco){
                     puntoBlanco.style.left = `${pos.x}px`; puntoBlanco.style.top = `${pos.y}px`;
                }
            } else {
                el.classList.remove('active');
            }
        }
    }

    // 3. ACTUALIZAR APERTURA Y ROTACIÓN DEL RADAR SVG
    if (!controls) return;
    
    const angleThreejs = controls.getAzimuthalAngle();
    const ajusteNorte = (nodosTour as any)[nodoActual]?.norteOffset || 0;
    const anguloRadarGrados = - (angleThreejs * (180 / Math.PI)) + ajusteNorte;
    const zoomActual = mapaSat.getZoom() ?? 17; // Si es undefined, usa 17
    const escalaFisica = Math.pow(2, zoomActual - 17);

    svgParent.style.transform = `translate(-50%, -50%) rotate(${anguloRadarGrados}deg) scale(${escalaFisica})`;

    const aspect = window.innerWidth / window.innerHeight;
    const effectiveFov = camera.fov / camera.zoom;
    let hFov = 2 * Math.atan(Math.tan((effectiveFov * Math.PI) / 360) * aspect) * (180 / Math.PI);
    hFov = Math.max(15, Math.min(hFov, 140));

    const cx = 3000, cy = 3000, radioSvg = 2685;
    const angLadoRad = (hFov / 2) * (Math.PI / 180);
    const x1 = cx + radioSvg * Math.sin(angLadoRad);
    const y1 = cy - radioSvg * Math.cos(angLadoRad);
    const x2 = cx - radioSvg * Math.sin(angLadoRad);
    const y2 = cy - radioSvg * Math.cos(angLadoRad);

    path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${radioSvg} ${radioSvg} 0 0 0 ${x2} ${y2} Z`);
    path.setAttribute('fill', 'rgba(92, 184, 42, 0.4)');
}