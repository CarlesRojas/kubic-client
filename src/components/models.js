import * as THREE from "three";
import constants from "../constants";

export const Floor = () => {
    const { gridX, gridZ, cubeSize } = constants;

    const floor = new THREE.Group();

    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridZ; j++) {
            var cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(cubeSize * 0.95, (cubeSize / 2) * 0.95, cubeSize * 0.95),
                new THREE.MeshLambertMaterial({ color: "#7d7d7d" })
            );
            cube.position.x = i * cubeSize - (gridX / 2) * cubeSize + cubeSize / 2;
            cube.position.z = j * cubeSize - (gridZ / 2) * cubeSize + cubeSize / 2;
            cube.position.y = -cubeSize / 4;
            floor.add(cube);
        }
    }

    return floor;
};

export const Grid = () => {
    const { gridY, gridX, cubeSize } = constants;

    const grid = new THREE.Group();

    for (let i = 0; i < gridY; i++) {
        const layer = new THREE.GridHelper(gridX * cubeSize, gridX, "#ffd500", "#ffd500");
        layer.position.y = cubeSize * i;
        grid.add(layer);
    }

    return grid;
};

export const Cube = (color) => {
    const { cubeSize } = constants;

    var cube = new THREE.Mesh(
        new THREE.BoxBufferGeometry(cubeSize * 0.95, cubeSize * 0.95, cubeSize * 0.95),
        new THREE.MeshLambertMaterial({ color })
    );

    return cube;
};
