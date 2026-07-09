// src/utils/imagenAWebp.ts

interface OpcionesConversion {
    calidad?: number;   // 0 a 1. Default 0.82
    maxAncho?: number;  // px. Si se define, redimensiona hacia abajo (nunca hacia arriba)
    maxAlto?: number;   // px.
}

// Convierte cualquier imagen (jpg, png, heic soportado por el navegador, etc.) a WebP en el propio navegador.
export async function convertirAWebP(archivo: File, opciones: OpcionesConversion = {}): Promise<File> {
    const { calidad = 0.82, maxAncho, maxAlto } = opciones;

    // Si ya viene en WebP y no pedimos redimensionar, no perdemos tiempo re-codificando
    if (archivo.type === 'image/webp' && !maxAncho && !maxAlto) return archivo;

    // createImageBitmap corrige automáticamente la rotación EXIF de fotos tomadas con celular
    const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' });

    let { width, height } = bitmap;
    if (maxAncho && width > maxAncho) {
        height = Math.round((height * maxAncho) / width);
        width = maxAncho;
    }
    if (maxAlto && height > maxAlto) {
        width = Math.round((width * maxAlto) / height);
        height = maxAlto;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el contexto 2D del canvas');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Falló la codificación a WebP'))),
            'image/webp',
            calidad
        );
    });

    const nuevoNombre = archivo.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], nuevoNombre, { type: 'image/webp' });
}

// Genera la versión "blur" (placeholder ligero) de una foto 360: la reduce a una miniatura muy
// pequeña en WebP. Al estirarse sobre la esfera con filtrado bilineal se ve como un desenfoque suave,
// y pesa apenas unos KB, por lo que aparece casi al instante mientras carga la versión en alta resolución.
export async function generarVersionBlur(archivo: File): Promise<File> {
    return convertirAWebP(archivo, { calidad: 0.6, maxAncho: 64 });
}
