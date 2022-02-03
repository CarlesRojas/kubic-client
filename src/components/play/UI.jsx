import { useContext, useEffect, useCallback, useState } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useGlobalState from "../../hooks/useGlobalState";
import useThrottle from "../../hooks/useThrottle";

import { Events } from "../../contexts/Events";
import { Utils } from "../../contexts/Utils";

import LeftIcon from "../../resources/icons/left.svg";
import RightIcon from "../../resources/icons/right.svg";
import PauseIcon from "../../resources/icons/pause.svg";
import AutoFallIcon from "../../resources/icons/autofall.svg";

import T0Icon from "../../resources/icons/T0.png";
import T1Icon from "../../resources/icons/T1.png";
import T2Icon from "../../resources/icons/T2.png";
import T3Icon from "../../resources/icons/T3.png";
import T4Icon from "../../resources/icons/T4.png";
import T5Icon from "../../resources/icons/T5.png";
import T6Icon from "../../resources/icons/T6.png";
import T7Icon from "../../resources/icons/T7.png";

const TETROMINO_ICONS = [T0Icon, T1Icon, T2Icon, T3Icon, T4Icon, T5Icon, T6Icon, T7Icon];

export default function UI({ gamePaused }) {
    const { emit, sub, unsub } = useContext(Events);
    const { vibrate } = useContext(Utils);

    const [gameDimensions] = useGlobalState("gameDimensions");
    const [nextTetromino] = useGlobalState("nextTetromino");

    // #################################################
    //   HANDLERS
    // #################################################

    const handleRotateBase = useThrottle((rotateRight) => {
        vibrate(40);
        emit("rotateLevel", rotateRight);
    }, 250);

    const handleAutoFall = useThrottle(() => {
        vibrate(40);
        emit("autoFall");
    }, 250);

    const handlePause = useThrottle(() => {
        vibrate(40);
        emit("pauseGame", { showPausePopup: true });
    }, 250);

    // #################################################
    //   SCORE
    // #################################################

    const [score, setScore] = useState(0);

    const handleUpdateScore = useCallback((score) => {
        setScore(score);
    }, []);

    useEffect(() => {
        sub("updateScore", handleUpdateScore);

        return () => {
            unsub("updateScore", handleUpdateScore);
        };
    }, [sub, unsub, handleUpdateScore]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="UI">
            <div
                className="gameContainer"
                style={{ height: `${gameDimensions.height}px`, width: `${gameDimensions.width}px` }}
            >
                <div className="topIcons" style={{ height: `${gameDimensions.width * 0.13}px` }}>
                    <SVG className={cn("icon", { gamePaused })} src={PauseIcon} onClick={handlePause}></SVG>
                    <p className="score">{score}</p>
                    <img className="nextTetromino" src={TETROMINO_ICONS[nextTetromino]} alt="" />
                </div>

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
