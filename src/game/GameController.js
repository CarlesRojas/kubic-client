import * as THREE from "three";
import ls from "local-storage";
import constants from "../constants";
import Tetromino from "./Tetromino";

export default class GameController {
    constructor() {
        // VARIABLES
        this.global = {
            level: null,
            state: null,
            events: null,
            grid: [[[]]],
            levelAngle: 0,
            paused: true,
            camera: null,
            score: 0,
        };

        this.scene = null;
        this.renderer = null;

        this.container = null;
        this.lastTimestamp = 0;
        this.tetromino = null;
    }

    init({ globalState, events, width, height, container, APP_NAME }) {
        // VARIABLES
        this.global.state = globalState;
        this.global.events = events;
        this.container = container;
        this.APP_NAME = APP_NAME;

        // CREATE SCENE
        this.#createScene();
        this.#createLights();
        this.#createCamera();
        this.#createRenderer({ width, height });

        // CREATE LEVEL
        this.#initGrid();
        this.#createFloor();
        this.#debug({ showGrid: false, showAxis: false });

        // CREATE TETROMINO
        this.#createTetromino();

        // SET GAME LOOP
        this.renderer.setAnimationLoop(this.#gameLoop.bind(this));
        this.#render();

        // UPDATE SCORE
        this.global.events.emit("updateScore", this.global.score);

        // Load saved game
        this.load();

        // SUB TO EVENTS
        this.global.events.sub("pause", this.pauseGame.bind(this));
        this.global.events.sub("rotateLevel", this.#setLevelRotation.bind(this));
    }

    resumeGame() {
        this.global.paused = false;
    }

    pauseGame() {
        this.global.paused = true;
    }

    handleResize({ width, height }) {
        if (!this.global.state || !this.renderer) return;

        var gameWidth = width;
        var gameHeight = (width / 9) * 19;

        if (gameHeight > height) {
            gameHeight = height;
            gameWidth = (height / 19) * 9;
        }

        this.global.state.set("gameDimensions", { width: gameWidth, height: gameHeight });
        this.renderer.setSize(gameWidth, gameHeight);
    }

    // #################################################
    //   SAVE LOAD
    // #################################################

    save() {
        const saveData = {};

        if (this.tetromino.isGameLost) {
            ls.remove(`${this.APP_NAME}_saveData`);
            return;
        }

        // Save grid state
        const gridSaveState = [];
        for (let i = 0; i < this.global.grid.length; i++) {
            const yArray = [];

            for (let j = 0; j < this.global.grid[i].length; j++) {
                const zArray = [];

                for (let k = 0; k < this.global.grid[i][j].length; k++) {
                    const cube = this.global.grid[i][j][k];
                    if (cube)
                        zArray.push({
                            position: { x: cube.position.x, y: cube.position.y, z: cube.position.z },
                            color: cube.material.color.getHexString(),
                        });
                    else zArray.push(null);
                }

                yArray.push(zArray);
            }
            gridSaveState.push(yArray);
        }
        saveData.grid = gridSaveState;

        // Save level angle
        saveData.levelAngle = this.global.levelAngle;

        // Save tetromino
        const tetromino = {
            positions: this.tetromino.cubePositions.map((position) => ({
                x: position.x,
                y: position.y,
                z: position.z,
            })),
            color: this.tetromino.cubes[0].material.color.getHexString(),
            rowsCleared: this.tetromino.rowsCleared,
            nextTetromino: this.tetromino.nextTetromino,
        };
        saveData.tetromino = tetromino;

        // Save the score
        saveData.score = this.global.score;

        // Save all
        ls.set(`${this.APP_NAME}_saveData`, saveData);
    }

    load() {
        const saveData = ls.get(`${this.APP_NAME}_saveData`);

        if (!saveData) return;
        const { cellSize } = constants;

        // Load grid
        for (let i = 0; i < saveData.grid.length; i++) {
            for (let j = 0; j < saveData.grid[i].length; j++) {
                for (let k = 0; k < saveData.grid[i][j].length; k++) {
                    const cubeInfo = saveData.grid[i][j][k];
                    if (!cubeInfo) continue;

                    const { position, color } = cubeInfo;

                    const cube = new THREE.Mesh(
                        new THREE.BoxBufferGeometry(cellSize * 0.95, cellSize * 0.95, cellSize * 0.95),
                        new THREE.MeshLambertMaterial({ color: `#${color}` })
                    );
                    cube.position.x = position.x;
                    cube.position.y = position.y;
                    cube.position.z = position.z;

                    this.global.level.add(cube);
                    this.global.grid[i][j][k] = cube;
                }
            }
        }

        // Load level angle
        this.global.levelAngle = saveData.levelAngle;
        this.global.level.rotation.y = THREE.Math.degToRad(this.global.levelAngle);

        // Load tetromino
        this.tetromino.load(saveData.tetromino);

        // Load the score
        this.global.score = saveData.score;

        this.global.events.emit("updateScore", saveData.score);

        this.#render();
    }

    // #################################################
    //   GAME LOOP
    // #################################################

    #gameLoop(timestamp) {
        if (this.global.paused) return;

        const deltaTime = this.#getDeltaTime(timestamp);

        if (this.tetromino) this.tetromino.update(timestamp, deltaTime);
        this.#animateLevelRotation(deltaTime);

        this.#render();
    }

    #render() {
        if (!this.renderer || !this.scene || !this.global.camera) return;

        this.renderer.render(this.scene, this.global.camera);
    }

    #getDeltaTime(timestamp) {
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        return deltaTime;
    }

    // #################################################
    //   CREATE TETROMINO
    // #################################################

    #createTetromino() {
        this.tetromino = new Tetromino(this.global);
        this.tetromino.init();
    }

    // #################################################
    //   CREATE LEVEL
    // #################################################

    #initGrid() {
        const { gridX, gridY, gridZ } = constants;

        const xArray = [];
        for (let i = 0; i < gridX; i++) {
            const yArray = [];

            for (let j = 0; j < gridY + 4; j++) {
                const zArray = [];

                for (let k = 0; k < gridZ; k++) zArray.push(null);

                yArray.push(zArray);
            }
            xArray.push(yArray);
        }

        this.global.grid = xArray;
    }

    #createFloor() {
        if (!this.global.level) return;

        const {
            gridX,
            gridZ,
            cellSize,
            floor: { id, color },
        } = constants;

        const floor = new THREE.Group();
        floor.name = id;

        for (let i = 0; i < gridX; i++) {
            for (let j = 0; j < gridZ; j++) {
                var cube = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(cellSize * 0.95, (cellSize / 2) * 0.95, cellSize * 0.95),
                    new THREE.MeshLambertMaterial({ color })
                );

                cube.position.x = i * cellSize - (gridX / 2) * cellSize + cellSize / 2;
                cube.position.z = j * cellSize - (gridZ / 2) * cellSize + cellSize / 2;
                cube.position.y = -cellSize / 4;

                floor.add(cube);
            }
        }

        this.global.level.add(floor);
    }

    #debug({ showGrid, showAxis }) {
        if (!this.global.level || !this.scene) return;

        const { gridY, gridX, cellSize } = constants;

        if (showGrid) {
            const grid = new THREE.Group();
            grid.name = "grid";

            for (let i = 0; i <= gridY + 4; i++) {
                const color = i >= gridY ? "#ff0000" : "0000ff";
                const layer = new THREE.GridHelper(gridX * cellSize, gridX, color, color);
                layer.position.y = cellSize * i;
                grid.add(layer);
            }

            this.global.level.add(grid);
        }

        if (showAxis) {
            var axesHelper = new THREE.AxesHelper(5);
            this.scene.add(axesHelper);
        }
    }

    #setLevelRotation(rotateRight) {
        if (rotateRight) this.global.levelAngle += 90;
        else this.global.levelAngle -= 90;
    }

    #animateLevelRotation(deltaTime) {
        if (!this.global.level) return;

        const animationDurationMs = 250;
        const levelTargetAngleRad = THREE.Math.degToRad(this.global.levelAngle);
        const step = (THREE.Math.degToRad(90) / animationDurationMs) * deltaTime;

        if (this.global.level.rotation.y > levelTargetAngleRad)
            this.global.level.rotation.y = Math.max(levelTargetAngleRad, this.global.level.rotation.y - step);
        else if (this.global.level.rotation.y < levelTargetAngleRad)
            this.global.level.rotation.y = Math.min(levelTargetAngleRad, this.global.level.rotation.y + step);
    }

    // #################################################
    //   CREATE SCENE
    // #################################################

    #createScene() {
        this.scene = new THREE.Scene();

        this.global.level = new THREE.Group();
        this.scene.add(this.global.level);
    }

    #createLights() {
        if (!this.scene) return;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(200, 300, 100);
        this.scene.add(dirLight);
    }

    #createCamera() {
        const aspectRatio = 9 / 19;
        const width = 75;
        const height = width / aspectRatio;

        this.global.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 10, 1000);

        const verticalDisplacement = 60;
        this.global.camera.position.set(100, 75 + verticalDisplacement, 100);
        this.global.camera.lookAt(0, verticalDisplacement, 0);
    }

    #createRenderer({ width, height }) {
        var gameWidth = width;
        var gameHeight = (width / 9) * 19;

        if (gameHeight > height) {
            gameHeight = height;
            gameWidth = (height / 19) * 9;
        }

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
        });

        this.global.state.set("gameDimensions", { width: gameWidth, height: gameHeight });
        this.renderer.setSize(gameWidth, gameHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const prevCanvas = this.container.current.getElementsByTagName("canvas");
        if (prevCanvas.length) prevCanvas[0].parentNode.removeChild(prevCanvas[0]);

        this.renderer.domElement.id = "gameCanvas";
        this.container.current.appendChild(this.renderer.domElement);
    }
}
