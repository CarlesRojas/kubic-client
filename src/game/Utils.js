import constants from "../constants";
import * as THREE from "three";

export const gridPosToWorldPos = ({ x, y, z }) => {
    const { cellSize, gridX, gridZ } = constants;

    const worldX = x * cellSize - (gridX / 2) * cellSize + cellSize / 2;
    const worldY = y * cellSize + cellSize / 2;
    const worldZ = z * cellSize - (gridZ / 2) * cellSize + cellSize / 2;

    return { worldX, worldY, worldZ };
};

export const worldToGridPos = ({ worldX, worldY, worldZ }) => {
    const { cellSize, gridX, gridZ } = constants;

    const x = Math.round((worldX + (gridX / 2) * cellSize + cellSize / 2) / cellSize - 1);
    const y = Math.round((worldY - cellSize / 2) / cellSize);
    const z = Math.round((worldZ + (gridZ / 2) * cellSize + cellSize / 2) / cellSize - 1);

    return { x, y, z };
};

export const centroid = (points) => {
    if (!points || !points.length) return;

    let dimensions = points[0].length;

    let accumulation = points.reduce((acc, point) => {
        point.forEach((dimension, i) => {
            acc[i] += dimension;
        });

        return acc;
    }, Array(dimensions).fill(0));

    return accumulation.map((dimension) => dimension / points.length);
};

export const worldToScreen = (obj, camera) => {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * window.innerWidth;
    var heightHalf = 0.5 * window.innerHeight;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    return {
        x: vector.x,
        y: vector.y,
    };
};

function multiplyMatrices(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

export const xyToIso = ({ x, y }) => {
    var transformMatrix = [
        [-(1 / Math.sqrt(3)), 1 / Math.sqrt(3)],
        [-1, -1],
    ];

    const result = multiplyMatrices([[x, y]], transformMatrix);
    return { x: -result[0][0], z: -result[0][1] };
};

export const isoToXy = ({ x, z }) => {
    var transformMatrix = [
        [-Math.sqrt(3) / 2, -1 / 2],
        [Math.sqrt(3) / 2, -1 / 2],
    ];

    const result = multiplyMatrices([[-x, -z]], transformMatrix);
    return { x: result[0][0], y: result[0][1] };
};
