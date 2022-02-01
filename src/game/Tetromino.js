import * as THREE from "three";
import constants from "../constants";
import { centroid, gridPosToWorldPos, worldToScreen } from "./Utils";

export default class Tetromino {
    constructor(global) {
        this.global = global;

        this.cubes = [];
        this.cubePositions = [];

        this.speedLimits = { min: 200, max: 2000, step: 100 };
        this.speed = this.speedLimits.max;

        this.timestampOfLastFall = 0;
        this.isAutoFalling = false;
        this.animating = true;

        this.isGameLost = false;

        // CREATE FIRST TETRO
        this.#decideNextTetromino();
        this.#spawnNextTetromino();

        // SUB TO EVENTS
        this.global.events.sub("rowCleared", this.#updateDifficulty.bind(this)); // ROJAS
        this.global.events.sub("autoFall", this.#autoFall.bind(this));
        this.global.events.sub("moveTetromino", this.#moveTetromino.bind(this));
        this.global.events.sub("rotateBaseTetromino", this.#rotateBaseTetromino.bind(this));
        this.global.events.sub("rotateLeftTetromino", this.#rotateLeftTetromino.bind(this));
        this.global.events.sub("rotateRightTetromino", this.#rotateRightTetromino.bind(this));
    }

    update(timestamp, deltaTime) {
        this.#keepFalling(timestamp);
        this.#animateCubes(timestamp, deltaTime);
    }

    // #################################################
    //   CREATE
    // #################################################

    #decideNextTetromino() {
        const { tetrominos } = constants;
        this.nestTetromino = Math.floor(Math.random() * tetrominos.length);
    }

    #spawnNextTetromino(timestamp = 0) {
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
            this.global.level.add(cube);
        }

        this.timestampOfLastFall = timestamp;

        this.#decideNextTetromino();
    }

    #saveCubesToGrid() {
        const { gridY } = constants;

        // Save cubes to grid
        for (let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i];
            const position = this.cubePositions[i];

            // Lose Game
            if (position.y >= gridY) {
                this.isGameLost = true;
                break;
            }

            this.global.grid[position.x][position.y][position.z] = cube;
        }
    }

    // #################################################
    //   UPDATE DIFFICULTY
    // #################################################

    #updateDifficulty(numberOfRowsCleared) {
        const { min, max, step } = this.speedLimits;
        this.speed = this.speed > min ? max - (numberOfRowsCleared / 4) * step : min;
    }

    // #################################################
    //   MOVE
    // #################################################

    #moveCubes({ x, z }) {
        const newCubePositions = [];

        for (let i = 0; i < this.cubePositions.length; i++) {
            newCubePositions.push({
                ...this.cubePositions[i],
                x: this.cubePositions[i].x + x,
                z: this.cubePositions[i].z + z,
            });
        }

        if (!this.#isPositionCorrect(newCubePositions)) {
            // ROJAS PLAY HIT WALL SOUND
            return;
        }

        this.cubePositions = newCubePositions;
    }

    #moveTetromino(direction) {
        if (this.isAutoFalling) return;

        var currAngle = this.global.levelAngle % 360;
        currAngle = currAngle < 0 ? 360 + currAngle : currAngle;
        currAngle = Math.round(currAngle);

        if (currAngle === 0) {
            this.#moveCubes({
                x: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
                z: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
            });
        } else if (currAngle === 90) {
            this.#moveCubes({
                x: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
                z: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
            });
        } else if (currAngle === 180) {
            this.#moveCubes({
                x: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
                z: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
            });
        } else if (currAngle === 270) {
            this.#moveCubes({
                x: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
                z: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
            });
        }
    }

    // #################################################
    //   ROTATE
    // #################################################

    #rotateBaseTetromino(rotateRight) {
        console.log(`Rotate base ${rotateRight ? "right" : "left"}`);
    }

    #rotateLeftTetromino(rotateDown) {
        console.log(`Rotate left ${rotateDown ? "down" : "up"}`);
    }

    #rotateRightTetromino(rotateDown) {
        console.log(`Rotate right ${rotateDown ? "down" : "up"}`);
    }

    // #################################################
    //   FALL
    // #################################################

    #keepFalling(timestamp) {
        if (this.isAutoFalling) return;

        if (timestamp - this.timestampOfLastFall >= this.speed) {
            this.timestampOfLastFall = timestamp;

            // Next cube positions
            const newCubePositions = [];
            for (let i = 0; i < this.cubePositions.length; i++)
                newCubePositions.push({ ...this.cubePositions[i], y: this.cubePositions[i].y - 1 });

            if (!this.#isPositionCorrect(newCubePositions)) {
                this.#saveCubesToGrid();
                this.#spawnNextTetromino(timestamp);
                return;
            }

            this.cubePositions = newCubePositions;
        }
    }

    #autoFall() {
        const { gridY } = constants;

        this.isAutoFalling = true;

        var newCubePositions = [];
        var lastCorrectCubePositions = [];

        for (let i = 0; i < this.cubePositions.length; i++) newCubePositions.push({ ...this.cubePositions[i] });

        var yDisp = 1;
        do {
            lastCorrectCubePositions = [];
            for (let i = 0; i < newCubePositions.length; i++) lastCorrectCubePositions.push({ ...newCubePositions[i] });
            newCubePositions = [];

            for (let i = 0; i < this.cubePositions.length; i++) {
                newCubePositions.push({
                    ...this.cubePositions[i],
                    y: this.cubePositions[i].y - yDisp,
                });
            }

            yDisp++;
        } while (this.#isPositionCorrect(newCubePositions) && yDisp < gridY + 5);

        this.cubePositions = lastCorrectCubePositions;
        this.#saveCubesToGrid();
    }

    // #################################################
    //   ANIMATE
    // #################################################

    #animateCubes(timestamp, deltaTime) {
        const { cellSize } = constants;
        var animating = false;

        for (let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i];
            const position = this.cubePositions[i];

            const animationDurationMs = 50;
            const step = (cellSize / animationDurationMs) * deltaTime;

            const { worldX, worldY, worldZ } = gridPosToWorldPos(position);

            // ANIMATE
            if (cube.position.x > worldX) cube.position.x = Math.max(worldX, cube.position.x - step);
            else if (cube.position.x < worldX) cube.position.x = Math.min(worldX, cube.position.x + step);

            if (cube.position.y > worldY) cube.position.y = Math.max(worldY, cube.position.y - step);
            else if (cube.position.y < worldY) cube.position.y = Math.min(worldY, cube.position.y + step);

            if (cube.position.z > worldZ) cube.position.z = Math.max(worldZ, cube.position.z - step);
            else if (cube.position.z < worldZ) cube.position.z = Math.min(worldZ, cube.position.z + step);

            // CHECK IF WE ARE ANIMATING
            if (
                cube.position.x > worldX ||
                cube.position.x < worldX ||
                cube.position.y > worldY ||
                cube.position.y < worldY ||
                cube.position.z > worldZ ||
                cube.position.z < worldZ
            )
                animating = true;
        }

        this.#setTetrominoCenter();

        if (this.animating !== animating) {
            this.animating = animating;
            this.#animationChangeState(timestamp);
        }
    }

    #animationChangeState(timestamp) {
        if (!this.animating && this.isAutoFalling) this.#spawnNextTetromino(timestamp);
    }

    #setTetrominoCenter() {
        const centers = this.cubes.map((cube) => {
            const { x, y } = worldToScreen(cube, this.global.camera);
            return [x, y];
        });
        const center = centroid(centers);

        if (center && center.length > 1) this.global.events.emit("updateTetroPosition", { x: center[0], y: center[1] });
        else this.global.events.emit("updateTetroPosition", { x: -1000000, y: 0 });
    }

    // #################################################
    //   CHECKS
    // #################################################

    #isPositionCorrect(positions) {
        return this.#areAllCubesInsideGrid(positions) && !this.#someCubeCollided(positions);
    }

    #areAllCubesInsideGrid(positions) {
        const { gridX, gridZ } = constants;

        for (let i = 0; i < positions.length; i++) {
            const { x, y, z } = positions[i];

            if (x < 0 || x >= gridX) return false;
            if (y < 0) return false;
            if (z < 0 || z >= gridZ) return false;
        }

        return true;
    }

    #someCubeCollided(positions) {
        const { gridY } = constants;

        for (let i = 0; i < positions.length; i++) {
            const { x, y, z } = positions[i];

            if (y >= 0 && y < gridY && this.global.grid[x][y][z]) return true;
        }

        return false;
    }
}
