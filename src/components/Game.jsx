import { useRef, useEffect, useCallback, useState, useContext } from "react";
import constants from "../constants";
import * as THREE from "three";
import useResize from "../hooks/useResize";
import Input from "./Input";
import UI from "./UI";
import GameController from "../game/GameController";

import { GlobalState } from "../contexts/GlobalState";
import { Events } from "../contexts/Events";

export default function Game() {
    const globalState = useContext(GlobalState);
    const events = useContext(Events);

    const container = useRef();
    const gameController = useRef();

    // #################################################
    //   OBJECTS
    // #################################################

    // const lost = useRef(false);

    // #################################################
    //   DIFFICULTY
    // #################################################

    // const difficulty = useRef(0);
    // const speedLimits = useRef({ min: 200, max: 2000, step: 100 });
    // const speed = useRef(speedLimits.current.max);

    // const updateDifficulty = () => {
    //     difficulty.current = numberOfRows.current / 4;
    // };

    // const updateSpeed = () => {
    //     const { min, max, step } = speedLimits.current;
    //     speed.current = speed.current > min ? max - difficulty.current * step : min;
    // };

    // #################################################
    //   NEXT TETRO
    // #################################################

    // const [animating, setAnimating] = useState(false);

    // const isPosCorrect = (position) => {
    //     const { gridX, gridY, gridZ } = constants;

    //     for (let i = 0; i < position.length; i++) {
    //         const { x, y, z } = position[i];

    //         if (x < 0 || x >= gridX) return false;
    //         if (y < 0) return false;
    //         if (z < 0 || z >= gridZ) return false;
    //         if (y >= 0 && y < gridY && grid.current[x][y][z]) return false;
    //     }

    //     return true;
    // };

    // const keepFalling = useCallback(
    //     (timestamp) => {
    //         if (directFalling.current) return;

    //         const { gridY } = constants;
    //         if (timestamp - lastFallTimestamp.current >= speed.current) {
    //             lastFallTimestamp.current = timestamp;

    //             const newTargetPos = [];

    //             for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
    //                 newTargetPos.push({
    //                     ...currentTetroTargetPos.current[i],
    //                     y: currentTetroTargetPos.current[i].y - 1,
    //                 });
    //             }

    //             if (!isPosCorrect(newTargetPos)) {
    //                 // Save tetro to grid
    //                 for (let i = 0; i < currentTetro.current.length; i++) {
    //                     const tetro = currentTetro.current[i];
    //                     const targetPos = currentTetroTargetPos.current[i];

    //                     if (targetPos.y >= gridY) {
    //                         lost.current = true;
    //                         break;
    //                     }

    //                     grid.current[targetPos.x][targetPos.y][targetPos.z] = tetro;
    //                 }

    //                 // Spawn next tetro
    //                 SpawnNextTetro();
    //                 return;
    //             }

    //             currentTetroTargetPos.current = newTargetPos;
    //         }
    //     },
    //     [SpawnNextTetro]
    // );

    // const fallDirectly = useCallback(() => {
    //     const { gridY } = constants;

    //     var newTargetPos = [];
    //     var lastCorrectPos = [];

    //     for (let i = 0; i < currentTetroTargetPos.current.length; i++)
    //         newTargetPos.push({ ...currentTetroTargetPos.current[i] });

    //     var yDisp = 1;
    //     do {
    //         lastCorrectPos = [];
    //         for (let i = 0; i < newTargetPos.length; i++) lastCorrectPos.push({ ...newTargetPos[i] });
    //         newTargetPos = [];

    //         for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
    //             newTargetPos.push({
    //                 ...currentTetroTargetPos.current[i],
    //                 y: currentTetroTargetPos.current[i].y - yDisp,
    //             });
    //         }

    //         yDisp++;
    //     } while (isPosCorrect(newTargetPos) && yDisp < gridY + 5);

    //     // Save tetro to grid
    //     for (let i = 0; i < currentTetro.current.length; i++) {
    //         const tetro = currentTetro.current[i];
    //         const targetPos = lastCorrectPos[i];

    //         if (targetPos.y >= gridY) {
    //             lost.current = true;
    //             break;
    //         }

    //         grid.current[targetPos.x][targetPos.y][targetPos.z] = tetro;
    //     }

    //     currentTetroTargetPos.current = lastCorrectPos;
    // }, []);

    // useEffect(() => {
    //     if (!animating && directFalling.current) {
    //         directFalling.current = false;

    //         // Spawn next tetro
    //         SpawnNextTetro();
    //     }
    // }, [animating, SpawnNextTetro]);

    // const moveTetro = useCallback(({ x, z }) => {
    //     const newTargetPos = [];

    //     for (let i = 0; i < currentTetroTargetPos.current.length; i++) {
    //         newTargetPos.push({
    //             ...currentTetroTargetPos.current[i],
    //             x: currentTetroTargetPos.current[i].x + x,
    //             z: currentTetroTargetPos.current[i].z + z,
    //         });
    //     }

    //     if (!isPosCorrect(newTargetPos)) {
    //         // ROJAS PLAY HIT WALL SOUND
    //         return;
    //     }

    //     currentTetroTargetPos.current = newTargetPos;
    // }, []);

    // // #################################################
    // //   MOVE TETRO
    // // #################################################

    // const animateBlocks = useCallback((deltaTime) => {
    //     const { cellSize } = constants;

    //     var anim = false;

    //     for (let i = 0; i < currentTetro.current.length; i++) {
    //         const tetro = currentTetro.current[i];
    //         const targetPos = currentTetroTargetPos.current[i];

    //         const step = (cellSize / 50) * deltaTime;

    //         const { worldX, worldY, worldZ } = gridPosToWorldPos(targetPos);

    //         if (tetro.position.x > worldX) {
    //             anim = true;
    //             tetro.position.x = Math.max(worldX, tetro.position.x - step);
    //         } else if (tetro.position.x < worldX) {
    //             anim = true;
    //             tetro.position.x = Math.min(worldX, tetro.position.x + step);
    //         }

    //         if (tetro.position.y > worldY) {
    //             anim = true;
    //             tetro.position.y = Math.max(worldY, tetro.position.y - step);
    //         } else if (tetro.position.y < worldY) {
    //             anim = true;
    //             tetro.position.y = Math.min(worldY, tetro.position.y + step);
    //         }

    //         if (tetro.position.z > worldZ) {
    //             anim = true;
    //             tetro.position.z = Math.max(worldZ, tetro.position.z - step);
    //         } else if (tetro.position.z < worldZ) {
    //             anim = true;
    //             tetro.position.z = Math.min(worldZ, tetro.position.z + step);
    //         }
    //     }

    //     setAnimating(anim);
    // }, []);

    // const gridPosToWorldPos = ({ x, y, z }) => {
    //     const { cellSize, gridX, gridZ } = constants;

    //     const worldX = x * cellSize - (gridX / 2) * cellSize + cellSize / 2;
    //     const worldY = y * cellSize + cellSize / 2;
    //     const worldZ = z * cellSize - (gridZ / 2) * cellSize + cellSize / 2;

    //     return { worldX, worldY, worldZ };
    // };

    // #################################################
    //   SCORE
    // #################################################

    // const numberOfRows = useRef(0);

    // #################################################
    //   RESIZE
    // #################################################

    const handleResize = () => {
        const width = container.current.clientWidth;
        const height = container.current.clientHeight;

        gameController.current.handleResize({ width, height });
    };

    useResize(handleResize, false);

    // #################################################
    //   INIT
    // #################################################

    useEffect(() => {
        console.log("ONLY ONCE");
        const width = container.current.clientWidth;
        const height = container.current.clientHeight;

        gameController.current = new GameController();
        gameController.current.init({ globalState, events, width, height, container });

        gameController.current.startGame();

        return () => {
            gameController.current.stopGame();
        };
    }, [globalState, events]);

    // #################################################
    //   USER ACTIONS
    // #################################################

    // const handleMove = (direction) => {
    //     if (directFalling.current) return;

    //     var currAngle = THREE.Math.radToDeg(levelTargetAngle.current) % 360;
    //     currAngle = currAngle < 0 ? 360 + currAngle : currAngle;
    //     currAngle = Math.round(currAngle);

    //     if (currAngle === 0) {
    //         moveTetro({
    //             x: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
    //             z: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
    //         });
    //     } else if (currAngle === 90) {
    //         moveTetro({
    //             x: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
    //             z: direction === "topLeft" ? -1 : direction === "bottomRight" ? 1 : 0,
    //         });
    //     } else if (currAngle === 180) {
    //         moveTetro({
    //             x: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
    //             z: direction === "bottomLeft" ? -1 : direction === "topRight" ? 1 : 0,
    //         });
    //     } else if (currAngle === 270) {
    //         moveTetro({
    //             x: direction === "topRight" ? -1 : direction === "bottomLeft" ? 1 : 0,
    //             z: direction === "bottomRight" ? -1 : direction === "topLeft" ? 1 : 0,
    //         });
    //     }
    // };

    // const handleDoubleClick = useCallback(() => {
    //     if (directFalling.current) return;

    //     fallDirectly();
    //     directFalling.current = true;
    // }, [fallDirectly]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Game" ref={container}>
            <Input />
            <UI />
        </div>
    );
}
