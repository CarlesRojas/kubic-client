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
    //   HANDLERS
    // #################################################

    const handleDoubleClick = () => {
        emit("autoFall");
    };

    // #################################################
    //   GESTURES
    // #################################################

    const moveInitial = useRef({ x: 0, y: 0 });
    const moveThreshold = gameDimensions.width * 0.1;

    const moveGestureBind = useDrag(
        ({ event, first, down, movement: [mx, my] }) => {
            event.stopPropagation();

            if (first) moveInitial.current = { x: 0, z: 0 };

            if (down) {
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
        },
        { filterTaps: true }
    );

    // #################################################
    //   DOUBLE CLICK
    // #################################################

    const doubleClickRef = useRef();
    useDoubleClick({ onDoubleClick: handleDoubleClick, ref: doubleClickRef });

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Input">
            <div className="moveTetro" {...moveGestureBind()} ref={doubleClickRef}></div>
        </div>
    );
}
