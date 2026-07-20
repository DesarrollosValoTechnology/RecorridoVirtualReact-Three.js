// src/utils/geometriaZona.ts
import * as THREE from 'three';

// Radio al que "flota" el relleno de la zona: sobre la foto (500) y por encima de
// los íconos de hotspots (495), para que se vea pintado encima de la foto.
export const RADIO_ZONA = 497;

type Punto = { x: number; y: number; z: number };

// Triangula el polígono de verdad (ear-clipping vía THREE.ShapeUtils), en vez del
// abanico desde el centroide de antes. El abanico fallaba en formas alargadas/con
// curvas (como un campo de golf que serpentea): el centro geométrico podía caer
// fuera del "cuerpo" real de la zona y los triángulos hacia ahí se salían del
// contorno. Para triangular necesitamos 2D: proyectamos los puntos (viven cerca de
// la esfera) sobre el plano tangente a la zona, triangulamos ahí, y regresamos las
// posiciones 3D originales — el contorno real nunca se aproxima, solo se usa para
// calcular QUÉ triángulos dibujar.
export function construirGeometriaZona(puntos: Punto[]): THREE.BufferGeometry {
    const vectores = puntos.map((p) =>
        new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(RADIO_ZONA)
    );

    const normal = new THREE.Vector3();
    vectores.forEach((v) => normal.add(v));
    normal.normalize();

    const ejeU = new THREE.Vector3();
    if (Math.abs(normal.y) < 0.99) ejeU.crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize();
    else ejeU.crossVectors(new THREE.Vector3(1, 0, 0), normal).normalize();
    const ejeV = new THREE.Vector3().crossVectors(normal, ejeU).normalize();

    const puntos2D = vectores.map((v) => new THREE.Vector2(v.dot(ejeU), v.dot(ejeV)));
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

// Contorno cerrado (para dibujar la línea perimetral con <Line>)
export function puntosALineaCerrada(puntos: Punto[]): THREE.Vector3[] {
    const vectores = puntos.map((p) =>
        new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(RADIO_ZONA)
    );
    if (vectores.length > 0) vectores.push(vectores[0].clone());
    return vectores;
}
