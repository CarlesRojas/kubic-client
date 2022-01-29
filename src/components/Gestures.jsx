import { useRef, useEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";

export default function Gestures({ gameDimensions, onRotateBase, onRotateX, onRotateY, onRotateZ, onClick }) {
    // #################################################
    //   GESTURES
    // #################################################

    const gestureThreshold = gameDimensions.width * 0.2;

    const rotateBaseGestureBind = useDrag(
        ({ event, down, movement: [mx], velocity: [vx], direction: [dx] }) => {
            event.stopPropagation();

            if (!down) {
                const velX = vx * dx;
                if ((mx > gestureThreshold && velX >= 0) || velX > 1) onRotateBase(true);
                else if ((mx < -gestureThreshold && velX <= 0) || velX < -1) onRotateBase(false);
            }
        },
        { filterTaps: true, axis: "x" }
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

            <div className="rotateContainer">
                <div className="rotateY">
                    <div className="rotateX"> </div>
                    <div className="rotateZ"> </div>
                </div>

                <div
                    className="rotateBase"
                    style={{ height: `${rotateBaseHeight}px` }}
                    {...rotateBaseGestureBind()}
                ></div>
            </div>
        </div>
    );
}
