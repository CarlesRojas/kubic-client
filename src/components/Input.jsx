import { useRef, useContext } from "react";
import { useDrag } from "@use-gesture/react";
import useDoubleClick from "../hooks/useDoubleClick";
import useGlobalState from "../hooks/useGlobalState";

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
                    // if (movX > 0 && movY > 0) handleMove("bottomRight");
                    // else if (movX < 0 && movY > 0) handleMove("bottomLeft");
                    // else if (movX > 0 && movY < 0) handleMove("topRight");
                    // else if (movX < 0 && movY < 0) handleMove("topLeft");
                }
            }
        },
        { filterTaps: true }
    );

    // #################################################
    //   DOUBLE CLICK
    // #################################################

    const doubleClickRef = useRef();
    useDoubleClick({ onDoubleClick: () => null /*handleDoubleClick*/, ref: doubleClickRef });

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Input">
            <div className="moveTetro" {...moveGestureBind()} ref={doubleClickRef}></div>
        </div>
    );
}
