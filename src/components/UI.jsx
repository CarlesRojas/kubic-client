import { useContext } from "react";
import SVG from "react-inlinesvg";
import useGlobalState from "../hooks/useGlobalState";

import { Events } from "../contexts/Events";

import LeftIcon from "../resources/icons/left.svg";
import RightIcon from "../resources/icons/right.svg";

export default function UI() {
    const { emit } = useContext(Events);
    const [gameDimensions] = useGlobalState("gameDimensions");

    // #################################################
    //   HANDLERS
    // #################################################

    const handleRotateBase = (rotateRight) => {
        emit("rotateLevel", rotateRight);
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="UI">
            <div
                className="gameContainer"
                style={{ height: `${gameDimensions.height}px`, width: `${gameDimensions.width}px` }}
            >
                <div className="rotateBaseIcons" style={{ height: `${gameDimensions.width * 0.15}px` }}>
                    <SVG className="icon" src={LeftIcon} onClick={() => handleRotateBase(false)}></SVG>
                    <SVG className="icon" src={RightIcon} onClick={() => handleRotateBase(true)}></SVG>
                </div>
            </div>
        </div>
    );
}
