// src/utils/capturaPantalla.ts
// Guarda una referencia al <canvas> real del motor 3D (fuera del árbol de React de la
// escena) para poder capturarlo desde la UI normal (OverlayUI vive fuera del <Canvas>).
let canvasRef: HTMLCanvasElement | null = null;

export function registrarCanvasCaptura(canvas: HTMLCanvasElement) {
    canvasRef = canvas;
}

export function capturarFrameActual(): string | null {
    if (!canvasRef) return null;
    try {
        return canvasRef.toDataURL('image/png');
    } catch (error) {
        console.error('No se pudo capturar el frame actual:', error);
        return null;
    }
}
