import { useRef, useEffect, useCallback } from "react";
import { Floor, Grid, Cube } from "./models";
import constants from "../constants";
import * as THREE from "three";

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
    const nextTetro = useRef(0);
    const currentTetro = useRef([]);

    // #################################################
    //   METHODS
    // #################################################

    const SetNextTetro = () => {
        const { tetrominos } = constants;
        nextTetro.current = Math.floor(Math.random() * tetrominos.length);
    };

    const SpawnNextTetro = useCallback(() => {
        const { tetrominos, gridX, gridY, gridZ } = constants;

        const randomTetro = tetrominos[nextTetro.current];
        currentTetro.current = [];

        for (let i = 0; i < randomTetro.positions.length; i++) {
            const cube = Cube(randomTetro.color);

            console.log(cube);
            const initialGridPos = { x: Math.floor(gridX / 2) - 1, y: gridY + 1, z: Math.floor(gridZ / 2) - 1 };
            const { worldX, worldY, worldZ } = gridPosToWorldPos({
                x: initialGridPos.x + randomTetro.positions[i][0],
                y: initialGridPos.y + randomTetro.positions[i][1],
                z: initialGridPos.z + randomTetro.positions[i][2],
            });

            cube.position.x = worldX;
            cube.position.y = worldY;
            cube.position.z = worldZ;

            currentTetro.current.push(cube);
            level.current.add(cube);
        }

        SetNextTetro();
    }, []);

    const gridPosToWorldPos = ({ x, y, z }) => {
        const { cubeSize, gridX, gridZ } = constants;

        const worldX = x * cubeSize - (gridX / 2) * cubeSize + cubeSize / 2;
        const worldY = y * cubeSize;
        const worldZ = z * cubeSize - (gridZ / 2) * cubeSize + cubeSize / 2;

        return { worldX, worldY, worldZ };
    };

    // #################################################
    //   GAME LOOP
    // #################################################

    const lastTimestamp = useRef(0);

    const getDeltaTime = (timestamp) => {
        const deltaTime = timestamp - lastTimestamp.current;
        lastTimestamp.current = timestamp;

        return deltaTime;
    };

    const gameLoop = useCallback((timestamp) => {
        const deltaTime = getDeltaTime(timestamp);

        renderer.current.render(scene.current, camera.current);
    }, []);

    const start = useCallback(() => {
        SetNextTetro();
        SpawnNextTetro();

        renderer.current.setAnimationLoop(gameLoop);
    }, [gameLoop, SpawnNextTetro]);

    const stop = () => {
        renderer.setAnimationLoop(null);
    };

    // #################################################
    //   INIT
    // #################################################

    useEffect(() => {
        const debug = true;

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
        console.log(grid.current);

        // Create Scene
        scene.current = new THREE.Scene();

        level.current = new THREE.Group();
        scene.current.add(level.current);

        const floor = Floor();
        level.current.add(floor);
        // level.current.rotateY((180 * Math.PI) / 180);

        if (debug) {
            // const gridHelper = Grid();
            // level.current.add(gridHelper);
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
        renderer.current.setSize(finalWidth, finalHeight);

        gameRef.current.appendChild(renderer.current.domElement);

        start();

        return () => {
            stop();
        };
    }, [start]);

    // #################################################
    //   RENDER
    // #################################################
    return <div className="Game" ref={gameRef}></div>;
}
