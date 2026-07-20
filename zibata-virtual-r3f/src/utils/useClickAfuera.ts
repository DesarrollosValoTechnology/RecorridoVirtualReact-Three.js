// src/utils/useClickAfuera.ts
import { useEffect } from 'react';
import type { RefObject } from 'react';

// Cierra un panel/barra colapsable cuando se toca fuera de él (usado por la barra
// de redes sociales y la barra de herramientas en móvil, ambas ahora colapsables).
export function useClickAfuera(ref: RefObject<HTMLElement | null>, activo: boolean, alTocarAfuera: () => void) {
    useEffect(() => {
        if (!activo) return;

        const manejar = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                alTocarAfuera();
            }
        };

        document.addEventListener('mousedown', manejar);
        document.addEventListener('touchstart', manejar);
        return () => {
            document.removeEventListener('mousedown', manejar);
            document.removeEventListener('touchstart', manejar);
        };
    }, [activo, ref, alTocarAfuera]);
}
