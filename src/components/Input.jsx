import { useRef, useContext } from "react";
import { useDrag } from "@use-gesture/react";
import useDoubleClick from "../hooks/useDoubleClick";
import useGlobalState from "../hooks/useGlobalState";
import { xyToIso } from "../game/Utils";

import { Events } from "../contexts/Events";

export default function Input() {
    const { emit } = useContext(Events);
    const [gameDimensions] = useGlobalState("gameDimensions");

    // #################################################
    //   GESTURES
    // #################################################

    const moveInitial = useRef({ x: 0, y: 0 });
    const moveThreshold = gameDimensions.width * 0.1;

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

                if (Math.abs(movX) > moveThreshold) {
                    moveInitial.current = { ...moveInitial.current, x };
                    emit("moveTetromino", movX > 0 ? "bottomRight" : "topLeft");
                }

                if (Math.abs(movZ) > moveThreshold) {
                    moveInitial.current = { ...moveInitial.current, z };
                    emit("moveTetromino", movZ > 0 ? "bottomLeft" : "topRight");
                }
            }

            // Two fingers gestures
            if (touches > 1) {
                // Autofall -> Vertical 2 fingers gesture
                if (my > moveThreshold * 4 || (dy > 0 && vy > 1)) {
                    console.log("Fall fast");
                    cancel();
                }

                // Rotate level -> Horizontal 2 fingers gesture
                if (mx > moveThreshold * 4 || vx > 1) {
                    console.log(`Rotate. Right: ${dx > 0}`);
                    cancel();
                }
            }
        },
        { filterTaps: true }
    );

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Input">
            <div className="moveTetro" {...moveGestureBind()}></div>
        </div>
    );
}
