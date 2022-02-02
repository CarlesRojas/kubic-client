import { useContext } from "react";
import SVG from "react-inlinesvg";
import useGlobalState from "../../hooks/useGlobalState";
import useThrottle from "../../hooks/useThrottle";

import { Events } from "../../contexts/Events";

import LeftIcon from "../../resources/icons/left.svg";
import RightIcon from "../../resources/icons/right.svg";
import AutoFallIcon from "../../resources/icons/autofall.svg";

export default function UI() {
    const { emit } = useContext(Events);
    const [gameDimensions] = useGlobalState("gameDimensions");

    // #################################################
    //   HANDLERS
    // #################################################

    const handleRotateBase = useThrottle((rotateRight) => {
        emit("rotateLevel", rotateRight);
    }, 250);

    const handleAutoFall = useThrottle(() => {
        emit("autoFall");
    }, 250);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="UI">
            <div
                className="gameContainer"
                style={{ height: `${gameDimensions.height}px`, width: `${gameDimensions.width}px` }}
            >
                <div className="rotateBaseIcons" style={{ height: `${gameDimensions.width * 0.13}px` }}>
                    <SVG className="icon reflectVertical" src={LeftIcon} onClick={() => handleRotateBase(true)}></SVG>
                    <SVG className="icon reflectVertical" src={RightIcon} onClick={() => handleRotateBase(false)}></SVG>
                </div>

                <div className="autoFallIcons" style={{ height: `${gameDimensions.width * 0.13}px` }}>
                    <SVG className="icon" src={AutoFallIcon} onClick={handleAutoFall}></SVG>
                </div>
            </div>
        </div>
    );
}
