import * as THREE from "three";
import constants from "../constants";
import { centroid, gridPosToWorldPos, worldToGridPos, worldToScreen, playSound, loadAudios } from "./Utils";

const ROTATIONS = {
    NONE: "none",
    BASE_RIGHT: "baseRight",
    BASE_LEFT: "baseLeft",
    LEFT_DOWN: "leftDown",
    LEFT_UP: "leftUp",
    RIGHT_DOWN: "rightDown",
    RIGHT_UP: "rightUp",
};

export default class TutorialTetromino {
    constructor(global) {
        this.global = global;

        this.cubes = [];
        this.cubePositions = [];
        this.cubeDisplacements = [];
        this.landed = false;

        this.isAutoFalling = false;
        this.animating = true;

        this.rotating = false;
        this.currentRotation = ROTATIONS.NONE;
        this.cubeRotations = [0, 0, 0, 0];

        this.shadows = [];

        loadAudios();
    }

    init() {
        // CREATE FIRST TETRO, SHADOWS AND LIMITS
        this.#spawnNextTetromino();
        this.#spawnShadows();
        this.#spawnLimits();

        // SUB TO EVENTS
        this.global.events.sub("tutorialStageDone", this.#tutorialStageDone.bind(this));
        this.global.events.sub("autoFall", this.#autoFall.bind(this));
        this.global.events.sub("moveTetromino", this.#moveTetromino.bind(this));
        this.global.events.sub("rotateBaseTetromino", this.#rotateBaseTetromino.bind(this));
        this.global.events.sub("rotateLeftTetromino", this.#rotateLeftTetromino.bind(this));
        this.global.events.sub("rotateRightTetromino", this.#rotateRightTetromino.bind(this));
    }

    update(timestamp, deltaTime) {
        if (this.landed) return;

        if (this.rotating) this.#animateCubesRotation(deltaTime);

        this.#animateCubes(timestamp, deltaTime);
        this.#updateShadowPositions();
        this.#setTetrominoCenter();
    }

    // #################################################
    //   TETROMINOS
    // #################################################

    #spawnNextTetromino() {
        const { tetrominos, gridX, gridY, gridZ, cellSize } = constants;

        const { colorPastel, positions } = tetrominos[6];
        this.cubes = [];
        this.cubePositions = [];
        this.cubeDisplacements = positions.map((position) => [...position]);
        this.isAutoFalling = false;

        for (let i = 0; i < positions.length; i++) {
            const cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(cellSize * 0.95, cellSize * 0.95, cellSize * 0.95),
                new THREE.MeshLambertMaterial({ color: colorPastel })
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
    }

    // #################################################
    //   TETROMINO LANDED
    // #################################################

    #onTetrominoLanded() {
        this.#saveCubesToGrid();
        this.landed = true;
    }

    #saveCubesToGrid() {
        for (let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i];
            const position = this.cubePositions[i];

            this.global.grid[position.x][position.y][position.z] = cube;
        }
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

        if (!this.#isPositionCorrect(newCubePositions)) return;

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
        if (this.isAutoFalling) return;

        if (this.#calculateRotationDisplacement(rotateRight ? ROTATIONS.BASE_RIGHT : ROTATIONS.BASE_LEFT)) {
            this.rotating = true;
            this.currentRotation = rotateRight ? ROTATIONS.BASE_RIGHT : ROTATIONS.BASE_LEFT;
            this.cubeRotations = [0, 0, 0, 0];

            playSound("rotateSound");
        } else playSound("failSound");
    }

    #rotateLeftTetromino(rotateDown) {
        if (this.isAutoFalling) return;

        if (this.#calculateRotationDisplacement(rotateDown ? ROTATIONS.LEFT_DOWN : ROTATIONS.LEFT_UP)) {
            this.rotating = true;
            this.currentRotation = rotateDown ? ROTATIONS.LEFT_DOWN : ROTATIONS.LEFT_UP;
            this.cubeRotations = [0, 0, 0, 0];

            playSound("rotateSound");
        } else playSound("failSound");
    }

    #rotateRightTetromino(rotateDown) {
        if (this.isAutoFalling) return;

        if (this.#calculateRotationDisplacement(rotateDown ? ROTATIONS.RIGHT_DOWN : ROTATIONS.RIGHT_UP)) {
            this.rotating = true;
            this.currentRotation = rotateDown ? ROTATIONS.RIGHT_DOWN : ROTATIONS.RIGHT_UP;
            this.cubeRotations = [0, 0, 0, 0];

            playSound("rotateSound");
        } else playSound("failSound");
    }

    #calculateRotationDisplacement(rotation) {
        const axis = this.#getRotationAxis(rotation);
        const isPositive = this.#isRotationPositive(rotation);

        this.#rotate(1, axis, isPositive, true);
        const gridPosAfterRotation = this.cubes.map((cube) =>
            worldToGridPos({ worldX: cube.position.x, worldY: cube.position.y, worldZ: cube.position.z })
        );
        this.#rotate(1, axis, !isPositive, true);

        const possibleDisplacements = [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: -1 },
            { x: 2, y: 0, z: 0 },
            { x: 0, y: 0, z: 2 },
            { x: -2, y: 0, z: 0 },
            { x: 0, y: 0, z: -2 },
        ];

        let i = 0;
        do {
            const displacement = possibleDisplacements[i];

            const displacedPosition = gridPosAfterRotation.map((pos) => ({
                x: pos.x + displacement.x,
                y: pos.y + displacement.y,
                z: pos.z + displacement.z,
            }));

            if (this.#isPositionCorrect(displacedPosition)) {
                this.cubePositions = displacedPosition;
                return true;
            }

            ++i;
        } while (i < possibleDisplacements.length);

        return false;
    }

    #animateCubesRotation(deltaTime) {
        if (!this.#areRotationsComlete()) {
            const axis = this.#getRotationAxis(this.currentRotation);
            const isPositive = this.#isRotationPositive(this.currentRotation);

            this.#rotate(deltaTime, axis, isPositive, false);
        }

        if (this.currentRotation !== ROTATIONS.NONE && this.#areRotationsComlete()) this.#onRotationComlete();
    }

    #getRotationAxis(rotationType) {
        const xAxis = new THREE.Vector3(1, 0, 0);
        const yAxis = new THREE.Vector3(0, 1, 0);
        const zAxis = new THREE.Vector3(0, 0, 1);

        if (rotationType === ROTATIONS.BASE_RIGHT) return yAxis;
        else if (rotationType === ROTATIONS.BASE_LEFT) return yAxis;

        var currAngle = this.global.levelAngle % 360;
        currAngle = currAngle < 0 ? 360 + currAngle : currAngle;
        currAngle = Math.round(currAngle);

        if (currAngle === 0) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.LEFT_UP) return xAxis;
            else if (rotationType === ROTATIONS.RIGHT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return zAxis;
        } else if (currAngle === 90) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.LEFT_UP) return zAxis;
            else if (rotationType === ROTATIONS.RIGHT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return xAxis;
        } else if (currAngle === 180) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.LEFT_UP) return xAxis;
            else if (rotationType === ROTATIONS.RIGHT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return zAxis;
        } else if (currAngle === 270) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.LEFT_UP) return zAxis;
            else if (rotationType === ROTATIONS.RIGHT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return xAxis;
        }
    }

    #isRotationPositive(rotationType) {
        var currAngle = this.global.levelAngle % 360;
        currAngle = currAngle < 0 ? 360 + currAngle : currAngle;
        currAngle = Math.round(currAngle);

        if (rotationType === ROTATIONS.BASE_RIGHT) return true;
        else if (rotationType === ROTATIONS.BASE_LEFT) return false;

        if (currAngle === 0) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return true;
            else if (rotationType === ROTATIONS.LEFT_UP || rotationType === ROTATIONS.RIGHT_DOWN) return false;
        } else if (currAngle === 90) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.RIGHT_DOWN) return true;
            else if (rotationType === ROTATIONS.LEFT_UP || rotationType === ROTATIONS.RIGHT_UP) return false;
        } else if (currAngle === 180) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.RIGHT_UP) return false;
            else if (rotationType === ROTATIONS.LEFT_UP || rotationType === ROTATIONS.RIGHT_DOWN) return true;
        } else if (currAngle === 270) {
            if (rotationType === ROTATIONS.LEFT_DOWN || rotationType === ROTATIONS.RIGHT_DOWN) return false;
            else if (rotationType === ROTATIONS.LEFT_UP || rotationType === ROTATIONS.RIGHT_UP) return true;
        }
    }

    #rotate(deltaTime, axis, positive, immediate) {
        const { cellSize } = constants;

        const animationDurationMs = 50;
        const step = immediate ? 90 : (90 / animationDurationMs) * deltaTime;

        for (let i = 0; i < this.cubes.length; i++) {
            const cube = this.cubes[i];
            const displacement = this.cubeDisplacements[i];

            const anchorPoint = new THREE.Vector3(
                cube.position.x - displacement[0] * cellSize,
                cube.position.y - displacement[1] * cellSize,
                cube.position.z - displacement[2] * cellSize
            );

            let moveDir = new THREE.Vector3(
                anchorPoint.x - cube.position.x,
                anchorPoint.y - cube.position.y,
                anchorPoint.z - cube.position.z
            );
            moveDir.normalize();
            let moveDist = cube.position.distanceTo(anchorPoint);
            cube.translateOnAxis(moveDir, moveDist);

            const nextRotationAngle = this.cubeRotations[i] + step;
            const angleToRotate = step + (nextRotationAngle > 90 ? 90 - nextRotationAngle : 0);
            this.cubeRotations[i] = immediate ? 0 : Math.min(90, nextRotationAngle);

            cube.rotateOnWorldAxis(axis, THREE.Math.degToRad(angleToRotate * (positive ? 1 : -1)));

            moveDir.multiplyScalar(-1);
            cube.translateOnAxis(moveDir, moveDist);
        }
    }

    #areRotationsComlete() {
        for (let i = 0; i < this.cubeRotations.length; i++) if (this.cubeRotations[i] < 90) return false;
        return true;
    }

    #onRotationComlete() {
        this.rotating = false;
        this.currentRotation = ROTATIONS.NONE;
        this.cubeRotations = [0, 0, 0, 0];
    }

    // #################################################
    //   FALL
    // #################################################

    #autoFall() {
        if (this.isAutoFalling) return;

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
        } while (this.#isPositionCorrect(newCubePositions) && yDisp < gridY + 4);

        if (this.#arePositionsTheSame(this.cubePositions, lastCorrectCubePositions)) this.animating = true;

        this.cubePositions = lastCorrectCubePositions;
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

        if (this.animating !== animating) {
            this.animating = animating;
            this.#animationChangeState(timestamp);
        }
    }

    #animationChangeState(timestamp) {
        if (!this.animating && this.isAutoFalling) this.#onTetrominoLanded(timestamp);
    }

    #setTetrominoCenter() {
        const centers = this.cubes.map((cube) => {
            const { x, y } = worldToScreen(cube, this.global.camera);
            return [x, y];
        });
        const center = centroid(centers);

        if (!center || center.length <= 1 || this.landed)
            this.global.events.emit("updateTetroPosition", { x: -100000000, y: 0 });
        else this.global.events.emit("updateTetroPosition", { x: center[0], y: center[1] });
    }

    // #################################################
    //   SHADOW
    // #################################################

    #spawnShadows() {
        const { cellSize } = constants;

        for (let i = 0; i < this.cubes.length; i++) {
            const shadow = new THREE.Mesh(
                new THREE.PlaneGeometry(cellSize * 0.95, cellSize * 0.95),
                new THREE.MeshLambertMaterial({ color: "black", transparent: true, opacity: 0.5 })
            );

            shadow.rotation.x = THREE.Math.degToRad(-90);

            this.shadows.push(shadow);
            this.global.level.add(shadow);

            this.#updateShadowPositions();
        }
    }

    #updateShadowPositions() {
        if (this.isAutoFalling) return;

        const { cellSize } = constants;
        const positions = [];

        for (let i = 0; i < this.shadows.length; i++) {
            const shadow = this.shadows[i];
            const cubePos = this.cubePositions[i];

            const found = positions.find(({ x, z }) => x === cubePos.x && z === cubePos.z);

            if (found) {
                shadow.position.x = -100000000;
                continue;
            }

            positions.push({ x: cubePos.x, z: cubePos.z });

            const y = this.#findHigestOccupiedCellInGrid({ x: cubePos.x, z: cubePos.z });
            const { worldX, worldY, worldZ } = gridPosToWorldPos({ x: cubePos.x, y, z: cubePos.z });

            shadow.position.x = worldX;
            shadow.position.y = worldY + cellSize * 0.501;
            shadow.position.z = worldZ;
        }
    }

    #findHigestOccupiedCellInGrid({ x, z }) {
        const { gridY } = constants;

        for (let y = gridY; y >= 0; y--) {
            const cell = this.global.grid[x][y][z];
            if (cell) return y;
        }

        return -1;
    }

    // #################################################
    //   LIMITS
    // #################################################

    #spawnLimits() {
        const { cellSize, gridX, gridY, gridZ } = constants;

        const limits = [];
        for (let x = 0; x < gridX; x++) {
            const row = [];

            for (let z = 0; z < gridZ; z++) {
                const limit = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(cellSize * 0.951, cellSize * 0.1, cellSize * 0.951),
                    new THREE.MeshLambertMaterial({ color: "#ff3721", transparent: true, opacity: 0 })
                );
                // const limit = new THREE.Mesh(
                //     new THREE.PlaneGeometry(cellSize * 0.95, cellSize * 0.95),
                //     new THREE.MeshLambertMaterial({ color: "#ff3721", transparent: true, opacity: 0 })
                // );

                const { worldX, worldY, worldZ } = gridPosToWorldPos({ x, y: gridY, z });

                // limit.rotation.x = THREE.Math.degToRad(-90);
                limit.position.x = worldX;
                limit.position.y = worldY - cellSize * 0.45;
                limit.position.z = worldZ;

                row.push(limit);
                this.global.level.add(limit);
            }

            limits.push(row);
        }

        this.limits = limits;
        this.#updateLimitOpacities();
    }

    #updateLimitOpacities() {
        const { gridX, gridY, gridZ } = constants;

        for (let x = 0; x < gridX; x++) {
            for (let z = 0; z < gridZ; z++) {
                const y = this.#findHigestOccupiedCellInGrid({ x, z });

                if (y >= gridY - 1) this.limits[x][z].material.opacity = 0.6;
                else if (y === gridY - 2) this.limits[x][z].material.opacity = 0.4;
                else if (y === gridY - 3) this.limits[x][z].material.opacity = 0.2;
                else this.limits[x][z].material.opacity = 0;
            }
        }
    }

    // #################################################
    //   CHECKS
    // #################################################

    #isPositionCorrect(positions) {
        return this.#areAllCubesInsideGrid(positions) && !this.#someCubeCollided(positions);
    }

    #areAllCubesInsideGrid(positions, checkAvobeGrid = false) {
        const { gridX, gridY, gridZ } = constants;

        for (let i = 0; i < positions.length; i++) {
            const { x, y, z } = positions[i];

            if (x < 0 || x >= gridX) return false;
            if (y < 0 || (checkAvobeGrid && y >= gridY)) return false;
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

    #arePositionsTheSame(positions1, positions2) {
        for (let i = 0; i < positions1.length; i++) {
            if (i >= positions2.length) return false;

            const position1 = positions1[i];
            const position2 = positions2[i];

            if (position1.x !== position2.x) return false;
            if (position1.y !== position2.y) return false;
            if (position1.z !== position2.z) return false;
        }

        return true;
    }

    // #################################################
    //   TUTORIAL
    // #################################################

    #tutorialStageDone() {
        playSound("tetrisSound");
    }
}
