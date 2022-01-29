import { useRef, useEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";

export default function Gestures({ gameDimensions, onRotateBase, onMove, onRotateX, onRotateY, onRotateZ, onClick }) {
    // #################################################
    //   GESTURES
    // #################################################

    const rotateBaseThreshold = gameDimensions.width * 0.2;

    const rotateBaseGestureBind = useDrag(
        ({ event, down, movement: [mx], velocity: [vx], direction: [dx] }) => {
            event.stopPropagation();

            if (!down) {
                const velX = vx * dx;
                if ((mx > rotateBaseThreshold && velX >= 0) || velX > 0.3) onRotateBase(true);
                else if ((mx < -rotateBaseThreshold && velX <= 0) || velX < -0.3) onRotateBase(false);
            }
        },
        { filterTaps: true, axis: "x" }
    );

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
                    if (movX > 0 && movY > 0) onMove("bottomRight");
                    else if (movX < 0 && movY > 0) onMove("bottomLeft");
                    else if (movX > 0 && movY < 0) onMove("topRight");
                    else if (movX < 0 && movY < 0) onMove("topLeft");
                }
            }
        },
        { filterTaps: true }
    );

    // #################################################
    //   RESIZE
    // #################################################

    const gesturesRef = useRef();
    const [rotateBaseHeight, setRotateBaseHeight] = useState(0);

    useEffect(() => {
        const box = gesturesRef.current.getBoundingClientRect();

        if (box.height > gameDimensions.height) {
            const gamePart = gameDimensions.height * 0.25;
            const restPart = (box.height - gameDimensions.height) / 2;

            setRotateBaseHeight(gamePart + restPart);
        } else setRotateBaseHeight(gameDimensions.height * 0.25);
    }, [gameDimensions]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Gestures" ref={gesturesRef}>
            <div className="click"></div>
            <div className="moveTetro" {...moveGestureBind()}></div>
            <div className="rotateBase" style={{ height: `${rotateBaseHeight}px` }} {...rotateBaseGestureBind()}></div>
        </div>
    );
}
