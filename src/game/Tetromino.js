import * as THREE from "three";
import constants from "../constants";
import { gridPosToWorldPos } from "./Utils";

export default class Tetromino {
    constructor({ level }) {
        // VARIABLES
        this.level = level;
        this.cubes = [];
        this.cubePositions = [];
        this.timestampOfLastFall = 0;
        this.isAutoFalling = false;
        this.isGameLost = false;

        // CREATE FIRST TETRO
        this.#decideNextTetromino();
        this.#createTetromino();
    }

    // #################################################
    //   CREATE
    // #################################################

    #decideNextTetromino() {
        const { tetrominos } = constants;
        this.nestTetromino = Math.floor(Math.random() * tetrominos.length);
    }

    #createTetromino(timestamp = 0) {
        const { tetrominos, gridX, gridY, gridZ, cellSize } = constants;

        const { color, positions } = tetrominos[this.nestTetromino];
        this.cubes = [];
        this.cubePositions = [];
        this.isAutoFalling = false;

        if (this.isGameLost) return;

        for (let i = 0; i < positions.length; i++) {
            const cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(cellSize * 0.95, cellSize * 0.95, cellSize * 0.95),
                new THREE.MeshLambertMaterial({ color })
            );

            const initialGridPos = { x: Math.floor(gridX / 2) - 1, y: gridY, z: Math.floor(gridZ / 2) - 1 };
            const blockInitialGridPos = {
                x: initialGridPos.x + positions[i][0],
                y: initialGridPos.y + positions[i][1],
                z: initialGridPos.z + positions[i][2],
            };
            const { worldX, worldY, worldZ } = gridPosToWorldPos(blockInitialGridPos);

            cube.position.x = worldX;
            cube.position.y = worldY;
            cube.position.z = worldZ;

            this.cubePositions.push(blockInitialGridPos);
            this.cubes.push(cube);
            this.level.add(cube);
        }

        this.timestampOfLastFall = timestamp;

        this.#decideNextTetromino();
    }
}
