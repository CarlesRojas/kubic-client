import { useContext } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";

import useGlobalState from "../../hooks/useGlobalState";
import useThrottle from "../../hooks/useThrottle";

import { Events } from "../../contexts/Events";
import { Utils } from "../../contexts/Utils";

import LeftIcon from "../../resources/icons/left.svg";
import RightIcon from "../../resources/icons/right.svg";
import AutoFallIcon from "../../resources/icons/autofall.svg";

export default function TutorialUI({ stage, STAGES, handleNextStage, handleStageDone, popupVisible }) {
    const { emit } = useContext(Events);
    const { vibrate } = useContext(Utils);

    const [gameDimensions] = useGlobalState("gameDimensions");

    // #################################################
    //   HANDLE ACTIONS
    // #################################################

    const handleAction = (id, args) => {
        if (id === "autoFall") {
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
    //   HANDLERS
    // #################################################

    const handleRotateBase = useThrottle((rotateRight) => {
        vibrate(40);
        handleAction("rotateLevel", rotateRight);
    }, 250);

    const handleAutoFall = useThrottle(() => {
        vibrate(40);
        handleAction("autoFall");
    }, 250);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="TutorialUI">
            <div
                className="gameContainer"
                style={{ height: `${gameDimensions.height}px`, width: `${gameDimensions.width}px` }}
            >
                {!popupVisible && (
                    <>
                        <h1>{STAGES[stage.current].title}</h1>
                        <p>{STAGES[stage.current].subtitle}</p>
                        <div className={cn("nextButton", { visible: stage.done })} onClick={handleNextStage}>
                            {stage.current >= 5 && stage.done ? "FINISH" : "NEXT"}
                        </div>
                    </>
                )}

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
