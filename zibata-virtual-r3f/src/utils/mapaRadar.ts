// src/utils/mapaRadar.ts
import { useTourStore } from '../store/useTourStore';
import { SVG_URLS } from '../components/Hotspot';

let mapaSat: any = null;
let mapProjectionOverlay: any = null;
// Coordenadas iniciales por defecto (Zibatá, Querétaro)
let coordActuales = { lat: 20.676716, lng: -100.335424 };

// Carga el SDK de Google Maps solo la primera vez que se necesita (al abrir "Ubicación"),
// en vez de descargarlo en cada visita a la página aunque nadie abra ese panel.
let promesaGoogleMaps: Promise<void> | null = null;

function cargarGoogleMaps(): Promise<void> {
    // Con loading=async, el evento "onload" del <script> dispara antes de que
    // google.maps.Map exista de verdad — hay que esperar el callback real de Google.
    if ((window as any).google?.maps?.Map) return Promise.resolve();
    if (promesaGoogleMaps) return promesaGoogleMaps;

    promesaGoogleMaps = new Promise((resolve, reject) => {
        (window as any).__onGoogleMapsListo = () => resolve();

        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBXz6wLrN4gp_yKdJ9dZu6R8x0670BYhcg&loading=async&callback=__onGoogleMapsListo';
        script.async = true;
        script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
        document.head.appendChild(script);
    });

    return promesaGoogleMaps;
}

export function abrirMapaInteractivo() {
    // Sincronizamos coordenadas con el nodo actual antes de abrir
    const store = useTourStore.getState();
    const info = store.nodos[store.nodoActual];
    if (info && info.lat && info.lng) {
        coordActuales = { lat: Number(info.lat), lng: Number(info.lng) };
    }

    setTimeout(async () => {
        await cargarGoogleMaps();

        if (!mapaSat) {
            const estiloOscuro = [
                { elementType: "geometry", stylers: [{ color: "#212121" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] }
            ];

            mapaSat = new (window as any).google.maps.Map(document.getElementById('mapa-satelital'), {
                center: { lat: coordActuales.lat, lng: coordActuales.lng },
                zoom: 18,
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                mapTypeId: 'satellite'
            });

            mapaSat.mapTypes.set('normal_dark', new (window as any).google.maps.StyledMapType(estiloOscuro, { name: 'Normal' }));

            class CustomOverlay extends (window as any).google.maps.OverlayView {
                div: HTMLDivElement;
                constructor() {
                    super();
                    this.div = document.createElement('div');
                }
                onAdd() {
                    const panes = this.getPanes();
                    if (panes) panes.overlayLayer.appendChild(this.div);
                }
                draw() {
                    mapProjectionOverlay = this.getProjection();
                }
                onRemove() {
                    if (this.div.parentNode) this.div.parentNode.removeChild(this.div);
                }
            }
            const overlay = new CustomOverlay();
            overlay.setMap(mapaSat);

            document.querySelectorAll('.btn-map-style').forEach(boton => {
                boton.addEventListener('click', (e: any) => {
                    document.querySelectorAll('.btn-map-style').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const estilo = e.target.getAttribute('data-style');
                    if (estilo === 'satelite') mapaSat.setMapTypeId('satellite');
                    if (estilo === 'hibrido') mapaSat.setMapTypeId('hybrid');
                    if (estilo === 'normal') mapaSat.setMapTypeId('normal_dark');
                });
            });
        } else {
            (window as any).google.maps.event.trigger(mapaSat, 'resize');
            mapaSat.setCenter({ lat: coordActuales.lat, lng: coordActuales.lng });
        }
    }, 100);
}

export function moverMapaANodo(lat: number, lng: number) {
    if (lat && lng) {
        coordActuales = { lat: Number(lat), lng: Number(lng) };
        if (mapaSat) {
            mapaSat.panTo({ lat: coordActuales.lat, lng: coordActuales.lng });
            mapaSat.setZoom(18);
        }
    }
}

export function actualizarMinimapaFrame(camera: any, controls: any, nodoActual: string) {
    const path = document.getElementById('cono-radar-path');
    const svgParent = document.getElementById('cono-radar-svg');
    const puntoBlanco = document.getElementById('punto-central-radar');
    const contenedorIconos = document.getElementById('contenedor-iconos-mapa');

    const store = useTourStore.getState();
    const nodosDB = store.nodos; // 🚨 LEEMOS DE LA BD (Zustand)

    if (!mapaSat || !contenedorIconos || !camera || !path || !svgParent || !puntoBlanco) return;
    if (!controls || typeof controls.getAzimuthalAngle !== 'function') return;

    // 1. DIBUJAR ICONOS DINÁMICOS
    // Si la cantidad de iconos no coincide con los nodos que sí tienen lat/lng (los únicos
    // que realmente se dibujan más abajo), refrescamos el contenedor.
    // 🚨 Comparar contra Object.keys(nodosDB).length (TODOS los nodos, tengan o no
    // coordenadas) hacía que esta condición fuera siempre verdadera cuando hay nodos sin
    // lat/lng — eso recreaba los íconos en CADA frame (60/seg), reseteando la animación
    // de pulso a cada rato y arrancando los <div> de abajo del cursor antes de que el
    // evento "click" llegara a dispararse.
    const nodosConCoordenadas = Object.values(nodosDB).filter((info: any) => info.lat && info.lng).length;
    if (contenedorIconos.children.length !== nodosConCoordenadas) {
        contenedorIconos.innerHTML = '';
        
        // Inyectamos CSS si no existe
        if (!document.getElementById('radar-css-fix')) {
            const style = document.createElement('style');
            style.id = 'radar-css-fix';
            style.innerHTML = `
                .icon-mapa {
                    position: absolute; transform: translate(-50%, -50%); cursor: pointer;
                    z-index: 10; transition: transform 0.2s; width: 32px; height: 32px; border-radius: 50%;
                    pointer-events: auto;
                }
                .icon-mapa:hover { transform: translate(-50%, -50%) scale(1.15); z-index: 20; }
                .icon-mapa.active {
                    z-index: 30;
                    transform: translate(-50%, -50%) scale(1.25);
                    outline: 3px solid #5cb82a;
                    box-shadow: 0 0 14px 3px rgba(92, 184, 42, 0.85), 0 2px 6px rgba(0,0,0,0.5);
                }
                .icon-mapa::before, .icon-mapa::after {
                    content: ''; position: absolute; top: 50%; left: 50%;
                    transform: translate(-50%, -50%); border-radius: 50%;
                    border: solid rgba(0, 255, 136, 0.8);
                    animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    pointer-events: none; z-index: 1; box-sizing: content-box;
                }
                .icon-mapa::after { animation-delay: 1s; }
                @keyframes radar-ping {
                    0% { width: 100%; height: 100%; opacity: 1; border-width: 4px; }
                    100% { width: 350%; height: 350%; opacity: 0; border-width: 1px; }
                }
            `;
            document.head.appendChild(style);
        }

        for (const [id, info] of Object.entries(nodosDB) as [string, any][]) {
            if (info.lat && info.lng) {
                const divIcono = document.createElement('div');
                divIcono.id = `map-icon-${id}`;
                const tipo = info.tipoIcono || 'dron';
                divIcono.className = `icon-mapa ${tipo}`;
                divIcono.dataset.tipo = tipo;
                divIcono.innerHTML = `<img src="${SVG_URLS[tipo] || SVG_URLS.dron}" alt="${tipo}" style="width:100%;height:100%;border-radius:50%;" />`;

                // ✅ PON ESTE BLOQUE NUEVO:
                divIcono.addEventListener('pointerenter', (e) => {
                    store.setTooltipHover({
                        titulo: info.ui.titulo,
                        miniatura: info.ui.miniatura,
                        x: e.clientX,
                        y: e.clientY - 20 // Lo subimos tantito para que no estorbe al cursor
                    });
                });

                divIcono.addEventListener('pointerleave', () => { 
                    store.setTooltipHover(null); 
                });

                divIcono.addEventListener('mouseleave', () => { store.setTooltipHover(null); });

                divIcono.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // 🚨 1. MATAMOS EL TOOLTIP INMEDIATAMENTE AL HACER CLICK
                    store.setTooltipHover(null);
                    if (!store.isTransitioning) {
                        store.setPanelActivo(null);
                        store.cargarNodo(id);
                    }
                });
                contenedorIconos.appendChild(divIcono);
            }
        }
    }

    // 2. SINCRONIZAR POSICIONES GEOGRÁFICAS (y el ícono, si cambió el tipo del nodo desde el admin)
    for (const [id, info] of Object.entries(nodosDB) as [string, any][]) {
        const el = document.getElementById(`map-icon-${id}`) as HTMLDivElement | null;
        if (el && info.lat && info.lng && mapProjectionOverlay) {
            const latLng = new (window as any).google.maps.LatLng(Number(info.lat), Number(info.lng));
            const pos = mapProjectionOverlay.fromLatLngToContainerPixel(latLng);

            if (!pos) continue;
            el.style.left = `${pos.x}px`;
            el.style.top = `${pos.y}px`;

            const tipoActual = info.tipoIcono || 'dron';
            if (el.dataset.tipo !== tipoActual) {
                el.dataset.tipo = tipoActual;
                const img = el.querySelector('img');
                if (img) {
                    img.src = SVG_URLS[tipoActual] || SVG_URLS.dron;
                    img.alt = tipoActual;
                }
            }

            if (id === nodoActual) {
                el.classList.add('active');
                svgParent.style.left = `${pos.x}px`; 
                svgParent.style.top = `${pos.y}px`;
                puntoBlanco.style.left = `${pos.x}px`; 
                puntoBlanco.style.top = `${pos.y}px`;
            } else {
                el.classList.remove('active');
            }
        }
    }

    // 3. ACTUALIZAR APERTURA Y ROTACIÓN DEL CONO SVG
    const currentZoom = mapaSat.getZoom() || 18;
    const angleThreejs = controls.getAzimuthalAngle() || 0;
    const ajusteNorte = nodosDB[nodoActual]?.norteOffset || 0; // 🚨 LEEMOS DE LA BD
    const anguloRadarGrados = - (angleThreejs * (180 / Math.PI)) + ajusteNorte;
    const escalaFisica = Math.pow(2, currentZoom - 18);

    svgParent.style.transform = `translate(-50%, -50%) rotate(${anguloRadarGrados}deg) scale(${escalaFisica})`;

    const aspect = window.innerWidth / window.innerHeight;
    const camFov = camera.fov || 140;
    const effectiveFov = camFov / (camera.zoom || 1); 
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