import { useRef, useContext, useEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";
import useGlobalState from "../../hooks/useGlobalState";
import { xyToIso } from "../../game/Utils";

import { Events } from "../../contexts/Events";

export default function TutorialInput({ stage, handleStageDone }) {
    const { emit, sub, unsub } = useContext(Events);

    // #################################################
    //   GAME DIMENSIONS
    // #################################################

    const [gameDimensions] = useGlobalState("gameDimensions");
    const gestureThreshold = gameDimensions.width * 0.1;

    // #################################################
    //   HANDLE ACTIONS
    // #################################################

    const handleAction = (id, args) => {
        if (id === "rotateBaseTetromino") {
            if (stage.current >= 0) {
                emit(id, args);
                if (stage.current === 0 && !stage.done) handleStageDone();
            }
        } else if (id === "rotateLeftTetromino") {
            if (stage.current >= 1) {
                emit(id, args);
                if (stage.current === 1 && !stage.done) handleStageDone();
            }
        } else if (id === "rotateRightTetromino") {
            if (stage.current >= 2) {
                emit(id, args);
                if (stage.current === 2 && !stage.done) handleStageDone();
            }
        } else if (id === "moveTetromino") {
            if (stage.current >= 3) {
                emit(id, args);
                if (stage.current === 3 && !stage.done) handleStageDone();
            }
        } else if (id === "autoFall") {
            if (stage.current >= 4) {
                emit(id, args);
                if (stage.current === 4 && !stage.done) handleStageDone();
            }
        } else if (id === "rotateLevel") {
            if (stage.current >= 5) {
                emit(id, args);
                if (stage.current === 5 && !stage.done) handleStageDone();
            }
        }
    };

    // #################################################
    //   MOVE GESTURE
    // #################################################

    const moveInitial = useRef({ x: 0, y: 0 });

    const moveGestureBind = useDrag(
        ({
            event,
            first,
            down,
            touches,
            movement: [mx, my],
            velocity: [vx, vy],
            direction: [dx, dy],
            cancel,
            canceled,
        }) => {
            event.stopPropagation();

            if (canceled) return;

            if (first) moveInitial.current = { x: 0, z: 0 };

            if (down && touches <= 1) {
                const { x, z } = xyToIso({ x: mx, y: my });

                const movX = x - moveInitial.current.x;
                const movZ = z - moveInitial.current.z;

                if (Math.abs(movX) > gestureThreshold) {
                    moveInitial.current = { ...moveInitial.current, x };
                    handleAction("moveTetromino", movX > 0 ? "bottomRight" : "topLeft");
                }

                if (Math.abs(movZ) > gestureThreshold) {
                    moveInitial.current = { ...moveInitial.current, z };
                    handleAction("moveTetromino", movZ > 0 ? "bottomLeft" : "topRight");
                }
            }

            // Two fingers gestures
            if (touches > 1) {
                // Autofall -> Vertical 2 fingers gesture
                if (my > gestureThreshold * 4 || (dy > 0 && vy > 1)) {
                    handleAction("autoFall");
                    cancel();
                }

                // Rotate level -> Horizontal 2 fingers gesture
                if (mx > gestureThreshold * 4 || vx > 1) {
                    handleAction("rotateLevel", dx > 0);
                    cancel();
                }
            }
        },
        { filterTaps: true }
    );

    // #################################################
    //   ROTATE GESTURES
    // #################################################

    const rotateTetroRef = useRef();

    const rotateGestureBind = useDrag(
        ({ event, touches, xy, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], cancel, canceled }) => {
            event.stopPropagation();

            if (canceled || touches > 1) return;

            // Rotate horizontal
            if (mx > gestureThreshold * 4 || vx > 1) {
                handleAction("rotateBaseTetromino", dx > 0);
                cancel();
            }

            // Rotate vertical
            if (my > gestureThreshold * 4 || vy > 1) {
                const box = rotateTetroRef.current.getBoundingClientRect();
                const pointX = xy[0] - box.x;

                // Left side
                if (pointX <= box.width / 2) handleAction("rotateLeftTetromino", dy > 0);
                // Right side
                else handleAction("rotateRightTetromino", dy > 0);

                cancel();
            }
        },
        { filterTaps: true }
    );

    // #################################################
    //   UPDATE TETROMINO POSITION
    // #################################################

    const [tetrominoCenter, setTetrominoCenter] = useState({ x: -10000000, y: 0 });

    const handleUpdateTetroPosition = (center) => {
        setTetrominoCenter(center);
    };

    useEffect(() => {
        sub("updateTetroPosition", handleUpdateTetroPosition);
        return () => {
            unsub("updateTetroPosition", handleUpdateTetroPosition);
        };
    }, [sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="TutorialInput">
            <div className="moveTetro" {...moveGestureBind()}></div>

            <div
                className="gamaBoundingBox"
                style={{ height: `${gameDimensions.height}px`, width: `${gameDimensions.width}px` }}
            >
                <div
                    className="rotateTetro"
                    style={{
                        height: `${gameDimensions.width * 0.6}px`,
                        width: `${gameDimensions.width * 0.6}px`,
                        left: `${tetrominoCenter.x}px`,
                        top: `${tetrominoCenter.y}px`,
                    }}
                    {...rotateGestureBind()}
                    ref={rotateTetroRef}
                ></div>
            </div>
        </div>
    );
}
