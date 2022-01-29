import * as THREE from "three";
import constants from "../constants";

export const Floor = () => {
    const floor = new THREE.Group();

    const { gridX, gridZ } = constants;

    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridZ; j++) {
            var cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(9.5, 4.75, 9.5),
                new THREE.MeshLambertMaterial({ color: "#7d7d7d" })
            );
            cube.position.x = i * 10 - (gridX / 2) * 10 + 5;
            cube.position.z = j * 10 - (gridZ / 2) * 10 + 5;
            cube.position.y = -2.5;
            floor.add(cube);
        }
    }

    return floor;
};

export const Cube = (color) => {
    var cube = new THREE.Mesh(new THREE.BoxBufferGeometry(9.5, 9.5, 9.5), new THREE.MeshLambertMaterial({ color }));
    return cube;
};
