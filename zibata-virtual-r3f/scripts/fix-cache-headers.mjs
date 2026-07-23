// Migración de un solo uso: las fotos que YA están subidas al bucket "fotos_tour" quedaron
// con Cache-Control: no-cache (comprobado con curl -I), así que aunque el código nuevo ya
// sube archivos con cacheControl largo, las fotos existentes del recorrido no se benefician
// hasta que se re-suben. La cuenta anon no tiene permiso de UPDATE sobre storage.objects
// (RLS lo rechaza: "new row violates row-level security policy"), así que no se puede pisar
// el mismo path in situ. En cambio, sí tiene permiso de INSERT y de DELETE (es el mismo
// patrón que ya usan reoptimizarFoto360ParaNodo/generarBlurParaNodo/borrarNodo en
// useTourStore.ts): subimos el mismo archivo bajo un nombre nuevo con el cache-control
// correcto, actualizamos la fila en "nodos" para que apunte al nuevo archivo, y borramos
// el archivo viejo.
//
// Uso:
//   node --env-file=.env scripts/fix-cache-headers.mjs           (aplica los cambios)
//   node --env-file=.env scripts/fix-cache-headers.mjs --dry-run (solo reporta qué haría)

import { createClient } from '@supabase/supabase-js';

const DRY_RUN = process.argv.includes('--dry-run');
const CACHE_CONTROL_OBJETIVO = '31536000';
const BUCKET = 'fotos_tour';

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim().replace(/^'|'$/g, '');
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/^'|'$/g, '');

if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Corre con: node --env-file=.env scripts/fix-cache-headers.mjs');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CAMPOS = [
    { columna: 'foto_url', sufijo: '360' },
    { columna: 'archivo_blur_url', sufijo: '360-blur' },
    { columna: 'miniatura_url', sufijo: 'thumb' },
];

function extraerPathDelBucket(url) {
    const marcador = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marcador);
    return idx === -1 ? null : url.slice(idx + marcador.length);
}

async function yaTieneCacheLargo(url) {
    const respuesta = await fetch(url, { method: 'HEAD' });
    const cacheControl = respuesta.headers.get('cache-control') || '';
    return cacheControl.includes(CACHE_CONTROL_OBJETIVO);
}

async function main() {
    const { data: nodos, error } = await supabase.from('nodos').select('id, foto_url, archivo_blur_url, miniatura_url');
    if (error) throw error;

    let totalBytesRefrescados = 0;
    let totalArchivosRefrescados = 0;
    let totalArchivosYaOk = 0;
    let totalArchivosFallidos = 0;

    for (const nodo of nodos) {
        for (const { columna, sufijo } of CAMPOS) {
            const urlActual = nodo[columna];
            if (!urlActual) continue;

            const pathViejo = extraerPathDelBucket(urlActual);
            if (!pathViejo) {
                console.warn(`  [omitido] ${nodo.id}.${columna}: no parece una URL de este bucket (${urlActual})`);
                continue;
            }

            try {
                if (await yaTieneCacheLargo(urlActual)) {
                    totalArchivosYaOk++;
                    continue;
                }

                const respuesta = await fetch(urlActual);
                if (!respuesta.ok) throw new Error(`descarga falló (${respuesta.status})`);
                const bytes = await respuesta.arrayBuffer();
                totalBytesRefrescados += bytes.byteLength;

                const nombreNuevo = `${nodo.id}-${sufijo}-${Math.random().toString(36).substring(7)}.webp`;
                console.log(`${DRY_RUN ? '[dry-run] ' : ''}${nodo.id}.${columna}: ${pathViejo} -> ${nombreNuevo} (${(bytes.byteLength / 1024).toFixed(0)} KB)`);

                if (!DRY_RUN) {
                    const { error: errUpload } = await supabase.storage.from(BUCKET).upload(nombreNuevo, new Uint8Array(bytes), {
                        cacheControl: CACHE_CONTROL_OBJETIVO,
                        contentType: 'image/webp',
                    });
                    if (errUpload) throw errUpload;

                    const { data: urlPublica } = supabase.storage.from(BUCKET).getPublicUrl(nombreNuevo);
                    const { error: errUpdate } = await supabase.from('nodos').update({ [columna]: urlPublica.publicUrl }).eq('id', nodo.id);
                    if (errUpdate) throw errUpdate;

                    const { error: errDelete } = await supabase.storage.from(BUCKET).remove([pathViejo]);
                    if (errDelete) console.warn(`  [aviso] no se pudo borrar el archivo viejo ${pathViejo}: ${errDelete.message}`);
                }

                totalArchivosRefrescados++;
            } catch (err) {
                totalArchivosFallidos++;
                console.error(`  [error] ${nodo.id}.${columna}: ${err.message}`);
            }
        }
    }

    console.log('\n--- Resumen ---');
    console.log(`Archivos ya con cache-control largo (sin tocar): ${totalArchivosYaOk}`);
    console.log(`Archivos ${DRY_RUN ? 'a refrescar' : 'refrescados'}: ${totalArchivosRefrescados}`);
    console.log(`Peso total ${DRY_RUN ? 'que se re-descargaría' : 'redescargado durante la migración'}: ${(totalBytesRefrescados / 1024 / 1024).toFixed(1)} MB`);
    if (totalArchivosFallidos) console.log(`Fallidos: ${totalArchivosFallidos} (revisa los [error] arriba)`);
}

main().catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
});
