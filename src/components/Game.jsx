import { useRef, useEffect, useCallback, useState } from "react";
import { Floor, Grid, Cube } from "./models";
import constants from "../constants";
import * as THREE from "three";
import useResize from "../hooks/useResize";
import Gestures from "./Gestures";
import UI from "./UI";

export default function Game() {
    // #################################################
    //   SCENE
    // #################################################

    const gameRef = useRef();
    const scene = useRef();
    const camera = useRef();
    const renderer = useRef();

    // #################################################
    //   OBJECTS
    // #################################################

    const level = useRef();
    const grid = useRef([[[]]]);
    const lost = useRef(false);

    // #################################################
    //   DIFFICULTY
    // #################################################

    const difficulty = useRef(0);
    const speedLimits = useRef({ min: 200, max: 2000, step: 100 });
    const speed = useRef(speedLimits.current.max);

    const updateDifficulty = () => {
        difficulty.current = numberOfRows.current / 4;
    };

    const updateSpeed = () => {
        const { min, max, step } = speedLimits.current;
        speed.current = speed.current > min ? max - difficulty.current * step : min;
    };

    // #################################################
    //   NEXT TETRO
    // #################################################

    const nextTetro = useRef(0);
    const currentTetro = useRef([]);
    const currentTetroTargetPos = useRef([]);
    const lastFallTimestamp = useRef(0);
    const directFalling = useRef(false);
    const [animating, setAnimating] = useState(false);

    const SetNextTetro = () => {
        const { tetrominos } = constants;
        nextTetro.current = Math.floor(Math.random() * tetrominos.length);
    };

    const SpawnNextTetro = useCallback((timestamp = 0) => {
        const { tetrominos, gridX, gridY, gridZ } = constants;

        const randomTetro = tetrominos[nextTetro.current];
        currentTetro.current = [];
        currentTetroTargetPos.current = [];
        directFalling.current = false;

        if (lost.current) return;

        for (let i = 0; i < randomTetro.positions.length; i++) {
            const cube = Cube(randomTetro.color);

            const initialGridPos = { x: Math.floor(gridX / 2) - 1, y: gridY + 1, z: Math.floor(gridZ / 2) - 1 };
            const blockInitialGridPos = {
                x: initialGridPos.x + randomTetro.positions[i][0],
                y: initialGridPos.y + randomTetro.positions[i][1],
                z: initialGridPos.z + randomTetro.positions[i][2],
            };
            const { worldX, worldY, worldZ } = gridPosToWorldPos(blockInitialGridPos);

            cube.position.x = worldX;
            cube.position.y = worldY;
            cube.position.z = worldZ;

            currentTetroTargetPos.current.push(blockInitialGridPos);
            currentTetro.current.push(cube);
            level.current.add(cube);
        }

        lastFallTimestamp.current = timestamp;

        SetNextTetro();
    }, []);

    const isPosCorrect = (position) => {
        const { gridX, gridY, gridZ } = constants;

        for (let i = 0; i < position.length; i++) {
            const { x, y, z } = position[i];

            if (x < 0 || x >= gridX) return false;
            if (y < 0) return false;
            if (z < 0 || z >= gridZ) return false;
            if (y >= 0 && y < gridY && grid.current[x][y][z]) return false;
        }

        return true;
    };

    const keepFalling = useCallback(
        (timestamp) => {
            if (directFalling.current) return;

            const { gridY } = constants;
            if (timestamp - lastFallTimestamp.current >= speed.current) {
                lastFallTimestamp.current = timestamp;

                const newTargetPos = [];

                for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
                    newTargetPos.push({
                        ...currentTetroTargetPos.current[i],
                        y: currentTetroTargetPos.current[i].y - 1,
                    });
                }

                if (!isPosCorrect(newTargetPos)) {
                    // Save tetro to grid
                    for (let i = 0; i < currentTetro.current.length; i++) {
                        const tetro = currentTetro.current[i];
                        const targetPos = currentTetroTargetPos.current[i];

                        if (targetPos.y >= gridY) {
                            lost.current = true;
                            break;
                        }

                        grid.current[targetPos.x][targetPos.y][targetPos.z] = tetro;
                    }

                    // Spawn next tetro
                    SpawnNextTetro();
                    return;
                }

                currentTetroTargetPos.current = newTargetPos;
            }
        },
        [SpawnNextTetro]
    );

    const fallDirectly = useCallback(() => {
        const { gridY } = constants;

        var newTargetPos = [];
        var lastCorrectPos = [];

        for (let i = 0; i < currentTetroTargetPos.current.length; i++)
            newTargetPos.push({ ...currentTetroTargetPos.current[i] });

        var yDisp = 1;
        do {
            lastCorrectPos = [];
            for (let i = 0; i < newTargetPos.length; i++) lastCorrectPos.push({ ...newTargetPos[i] });
            newTargetPos = [];

            for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
                newTargetPos.push({
                    ...currentTetroTargetPos.current[i],
                    y: currentTetroTargetPos.current[i].y - yDisp,
                });
            }

            yDisp++;
        } while (isPosCorrect(newTargetPos) && yDisp < gridY + 5);

        // Save tetro to grid
        for (let i = 0; i < currentTetro.current.length; i++) {
            const tetro = currentTetro.current[i];
            const targetPos = lastCorrectPos[i];

            if (targetPos.y >= gridY) {
                lost.current = true;
                break;
            }

            grid.current[targetPos.x][targetPos.y][targetPos.z] = tetro;
        }

        currentTetroTargetPos.current = lastCorrectPos;
    }, []);

    useEffect(() => {
        if (!animating && directFalling.current) {
            directFalling.current = false;

            // Spawn next tetro
            SpawnNextTetro();
        }
    }, [animating, SpawnNextTetro]);

    const moveTetro = useCallback(({ x, z }) => {
        const newTargetPos = [];

        for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
            newTargetPos.push({
                ...currentTetroTargetPos.current[i],
                x: currentTetroTargetPos.current[i].x + x,
                z: currentTetroTargetPos.current[i].z + z,
            });
        }

        if (!isPosCorrect(newTargetPos)) {
            // ROJAS PLAY HIT WALL SOUND
            return;
        }

        currentTetroTargetPos.current = newTargetPos;
    }, []);

    // #################################################
    //   MOVE TETRO
    // #################################################

    const animateBlocks = useCallback((deltaTime) => {
        const { cubeSize } = constants;

        var anim = false;

        for (let i = 0; i < currentTetro.current.length; i++) {
            const tetro = currentTetro.current[i];
            const targetPos = currentTetroTargetPos.current[i];

            const step = (cubeSize / 50) * deltaTime;

            const { worldX, worldY, worldZ } = gridPosToWorldPos(targetPos);

            if (tetro.position.x > worldX) {
                anim = true;
                tetro.position.x = Math.max(worldX, tetro.position.x - step);
            } else if (tetro.position.x < worldX) {
                anim = true;
                tetro.position.x = Math.min(worldX, tetro.position.x + step);
            }

            if (tetro.position.y > worldY) {
                anim = true;
                tetro.position.y = Math.max(worldY, tetro.position.y - step);
            } else if (tetro.position.y < worldY) {
                anim = true;
                tetro.position.y = Math.min(worldY, tetro.position.y + step);
            }

            if (tetro.position.z > worldZ) {
                anim = true;
                tetro.position.z = Math.max(worldZ, tetro.position.z - step);
            } else if (tetro.position.z < worldZ) {
                anim = true;
                tetro.position.z = Math.min(worldZ, tetro.position.z + step);
            }
        }

        setAnimating(anim);
    }, []);

    const gridPosToWorldPos = ({ x, y, z }) => {
        const { cubeSize, gridX, gridZ } = constants;

        const worldX = x * cubeSize - (gridX / 2) * cubeSize + cubeSize / 2;
        const worldY = y * cubeSize + cubeSize / 2;
        const worldZ = z * cubeSize - (gridZ / 2) * cubeSize + cubeSize / 2;

        return { worldX, worldY, worldZ };
    };

    // #################################################
    //   MOVE LEVEL
    // #################################################

    const levelTargetAngle = useRef(THREE.Math.degToRad(0));

    const animateLevel = useCallback((deltaTime) => {
        for (let i = 0; i < currentTetro.current.length; i++) {
            const step = (THREE.Math.degToRad(90) / 500) * deltaTime;

            if (level.current.rotation.y > levelTargetAngle.current)
                level.current.rotation.y = Math.max(levelTargetAngle.current, level.current.rotation.y - step);
            else if (level.current.rotation.y < levelTargetAngle.current)
                level.current.rotation.y = Math.min(levelTargetAngle.current, level.current.rotation.y + step);
        }
    }, []);

    // #################################################
    //   SCORE
    // #################################################

    const numberOfRows = useRef(0);

    // #################################################
    //   GAME LOOP
    // #################################################

    const lastTimestamp = useRef(0);

    const getDeltaTime = (timestamp) => {
        const deltaTime = timestamp - lastTimestamp.current;
        lastTimestamp.current = timestamp;

        return deltaTime;
    };

    const gameLoop = useCallback(
        (timestamp) => {
            const deltaTime = getDeltaTime(timestamp);

            updateDifficulty();
            updateSpeed();
            keepFalling(timestamp);
            animateBlocks(deltaTime);
            animateLevel(deltaTime);

            renderer.current.render(scene.current, camera.current);
        },
        [keepFalling, animateBlocks, animateLevel]
    );

    const start = useCallback(() => {
        SetNextTetro();
        SpawnNextTetro();

        renderer.current.setAnimationLoop(gameLoop);
    }, [gameLoop, SpawnNextTetro]);

    const stop = () => {
        renderer.setAnimationLoop(null);
    };

    // #################################################
    //   RESIZE
    // #################################################

    const [gameDimensions, setGameDimensions] = useState({ width: 0, height: 0 });

    const handleResize = () => {
        // Update renderer size
        const width = gameRef.current.clientWidth;
        const height = gameRef.current.clientHeight;
        var finalWidth = width;
        var finalHeight = (width / 9) * 19;
        if (finalHeight > height) {
            finalHeight = height;
            finalWidth = (height / 19) * 9;
        }

        setGameDimensions({ width: finalWidth, height: finalHeight });
        renderer.current.setSize(finalWidth, finalHeight);
    };

    useResize(handleResize, false);

    // #################################################
    //   INIT
    // #################################################

    useEffect(() => {
        const { gridX, gridY, gridZ } = constants;

        // Init grid
        const xArray = [];
        for (let i = 0; i < gridX; i++) {
            const yArray = [];
            for (let j = 0; j < gridY; j++) {
                const zArray = [];
                for (let k = 0; k < gridZ; k++) zArray.push(null);
                yArray.push(zArray);
            }
            xArray.push(yArray);
        }
        grid.current = xArray;

        // Create Scene
        scene.current = new THREE.Scene();

        level.current = new THREE.Group();
        scene.current.add(level.current);

        const floor = Floor();
        level.current.add(floor);

        const showGrid = false;
        if (showGrid) {
            const gridHelper = Grid();
            level.current.add(gridHelper);
        }

        const showAxis = false;
        if (showAxis) {
            var axesHelper = new THREE.AxesHelper(5);
            scene.current.add(axesHelper);
        }

        // Create lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.current.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(200, 300, 100);
        scene.current.add(dirLight);

        // Create camera
        const aspectRatio = 9 / 19;
        const cameraWidth = 80;
        const cameraHeight = cameraWidth / aspectRatio;

        camera.current = new THREE.OrthographicCamera(
            cameraWidth / -2,
            cameraWidth / 2,
            cameraHeight / 2,
            cameraHeight / -2,
            10,
            1000
        );
        camera.current.position.set(100, 140, 100);
        camera.current.lookAt(0, 65, 0);

        // Create renderer
        const width = gameRef.current.clientWidth;
        const height = gameRef.current.clientHeight;
        var finalWidth = width;
        var finalHeight = (width / 9) * 19;
        if (finalHeight > height) {
            finalHeight = height;
            finalWidth = (height / 19) * 9;
        }

        renderer.current = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
        });

        setGameDimensions({ width: finalWidth, height: finalHeight });
        renderer.current.setSize(finalWidth, finalHeight);

        gameRef.current.appendChild(renderer.current.domElement);

        start();

        return () => {
            stop();
        };
    }, [start]);

    // #################################################
    //   USER ACTIONS
    // #################################################

    const handleRotateBase = (rotateRight) => {
        if (rotateRight) levelTargetAngle.current = levelTargetAngle.current + THREE.Math.degToRad(90);
        else levelTargetAngle.current = levelTargetAngle.current - THREE.Math.degToRad(90);
    };

    const handleMove = (direction) => {
        if (directFalling.current) return;

        var currAngle = THREE.Math.radToDeg(levelTargetAngle.current) % 360;
        currAngle = currAngle < 0 ? 360 + currAngle : currAngle;
        currAngle = Math.round(currAngle);

        if (currAngle === 0) {
            moveTetro({
                x: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
                z: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
            });
        } else if (currAngle === 90) {
            moveTetro({
                x: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
                z: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
            });
        } else if (currAngle === 180) {
            moveTetro({
                x: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
                z: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
            });
        } else if (currAngle === 270) {
            moveTetro({
                x: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
                z: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
            });
        }
    };

    const handleClick = () => {
        if (directFalling.current) return;

        fallDirectly();
        directFalling.current = true;
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Game" ref={gameRef}>
            <Gestures
                gameDimensions={gameDimensions}
                handleRotateBase={handleRotateBase}
                handleMove={handleMove}
                handleClick={handleClick}
            />
            <UI />
        </div>
    );
}
