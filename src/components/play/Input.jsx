import { useRef, useContext, useEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";
import useGlobalState from "../../hooks/useGlobalState";
import { xyToIso } from "../../game/Utils";

import { Events } from "../../contexts/Events";

export default function Input() {
    const { emit, sub, unsub } = useContext(Events);

    // #################################################
    //   GAME DIMENSIONS
    // #################################################

    const [gameDimensions] = useGlobalState("gameDimensions");
    const gestureThreshold = gameDimensions.width * 0.1;

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
                    emit("moveTetromino", movX > 0 ? "bottomRight" : "topLeft");
                }

                if (Math.abs(movZ) > gestureThreshold) {
                    moveInitial.current = { ...moveInitial.current, z };
                    emit("moveTetromino", movZ > 0 ? "bottomLeft" : "topRight");
                }
            }

            // Two fingers gestures
            if (touches > 1) {
                // Autofall -> Vertical 2 fingers gesture
                if (my > gestureThreshold * 4 || (dy > 0 && vy > 1)) {
                    emit("autoFall");
                    cancel();
                }

                // Rotate level -> Horizontal 2 fingers gesture
                if (mx > gestureThreshold * 4 || vx > 1) {
                    emit("rotateLevel", dx > 0);
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
                emit("rotateBaseTetromino", dx > 0);
                cancel();
            }

            // Rotate vertical
            if (my > gestureThreshold * 4 || vy > 1) {
                const box = rotateTetroRef.current.getBoundingClientRect();
                const pointX = xy[0] - box.x;

                // Left side
                if (pointX <= box.width / 2) emit("rotateLeftTetromino", dy > 0);
                // Right side
                else emit("rotateRightTetromino", dy > 0);

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
        // console.log(center);
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
        <div className="Input">
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
