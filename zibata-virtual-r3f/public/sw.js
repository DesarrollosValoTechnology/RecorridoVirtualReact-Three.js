// Service Worker: cache-first para las fotos del recorrido (bucket "fotos_tour" en Supabase Storage).
// Cada nombre de archivo incluye un sufijo aleatorio asignado en el momento de la subida
// (ver useTourStore.ts / AdminMode.tsx / PanelEditarNodo.tsx), así que una URL nunca cambia
// de contenido: una vez cacheada, jamás hace falta revalidarla contra el servidor.
// Esto cubre el caso de la tablet (Capacitor) repitiendo el mismo recorrido muchas veces,
// incluso si algún día el origen deja de mandar Cache-Control por la razón que sea.

const CACHE_NAME = 'zibata-tour-images-v1';
const RUTA_BUCKET = '/storage/v1/object/public/fotos_tour/';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((nombres) => Promise.all(
                nombres
                    .filter((nombre) => nombre.startsWith('zibata-tour-images-') && nombre !== CACHE_NAME)
                    .map((nombre) => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || !request.url.includes(RUTA_BUCKET)) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cacheada = await cache.match(request);
            if (cacheada) return cacheada;

            const respuesta = await fetch(request);
            if (respuesta.ok) cache.put(request, respuesta.clone());
            return respuesta;
        })
    );
});
