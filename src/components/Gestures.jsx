import { useRef } from "react";
import { useDrag } from "@use-gesture/react";
import useDoubleClick from "../hooks/useDoubleClick";

export default function Gestures({ gameDimensions, handleMove, handleDoubleClick, onRotateX, onRotateY, onRotateZk }) {
    // #################################################
    //   GESTURES
    // #################################################

    const moveInitial = useRef({ x: 0, y: 0 });
    const moveThreshold = gameDimensions.width * 0.1;

    const moveGestureBind = useDrag(
        ({ event, first, down, movement: [mx, my] }) => {
            event.stopPropagation();

            if (first) moveInitial.current = { x: 0, y: 0 };

            if (down) {
                const movX = mx - moveInitial.current.x;
                const movY = my - moveInitial.current.y;

                const disp = Math.sqrt(movX * movX + movY * movY);

                if (
                    Math.abs(movX) > moveThreshold * 0.3 &&
                    Math.abs(movY) > moveThreshold * 0.3 &&
                    disp > moveThreshold
                ) {
                    moveInitial.current = { x: mx, y: my };
                    if (movX > 0 && movY > 0) handleMove("bottomRight");
                    else if (movX < 0 && movY > 0) handleMove("bottomLeft");
                    else if (movX > 0 && movY < 0) handleMove("topRight");
                    else if (movX < 0 && movY < 0) handleMove("topLeft");
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
        <div className="Gestures">
            <div className="moveTetro" {...moveGestureBind()} ref={doubleClickRef}></div>
        </div>
    );
}
