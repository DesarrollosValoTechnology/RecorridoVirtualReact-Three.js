// src/utils/geometriaReticula.ts
//
// Triangula un lote (polígono plano, todos sus vértices en el mismo plano horizontal
// y = -alturaM) para poder pintar su relleno tenue. A diferencia de
// src/utils/geometriaZona.ts, aquí no hace falta proyectar a un plano tangente: como
// el polígono ya es plano de por sí, basta con usar (x, z) como las 2 coordenadas para
// triangular (ear-clipping vía THREE.ShapeUtils) y regresar las posiciones 3D originales.
import * as THREE from 'three';

export function construirGeometriaLotePlano(vectores: THREE.Vector3[]): THREE.BufferGeometry {
    const puntos2D = vectores.map((v) => new THREE.Vector2(v.x, v.z));
    const triangulos = THREE.ShapeUtils.triangulateShape(puntos2D, []);

    const posiciones: number[] = [];
    triangulos.forEach(([a, b, c]) => {
        posiciones.push(vectores[a].x, vectores[a].y, vectores[a].z);
        posiciones.push(vectores[b].x, vectores[b].y, vectores[b].z);
        posiciones.push(vectores[c].x, vectores[c].y, vectores[c].z);
    });

    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
    geometria.computeVertexNormals();
    return geometria;
}
