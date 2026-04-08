// src/store/xrStore.ts
import { createXRStore } from '@react-three/xr';

// Creamos el motor VR y apagamos el emulador de escritorio
export const xrStore = createXRStore({
    emulate: false 
});