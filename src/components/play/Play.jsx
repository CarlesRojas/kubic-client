import { useRef, useEffect, useContext, useState, useCallback } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";
import ls from "local-storage";

import Input from "./Input";
import UI from "./UI";
import GameController from "../../game/GameController";

import useResize from "../../hooks/useResize";
import useAutoResetState from "../../hooks/useAutoResetState";

import { GlobalState } from "../../contexts/GlobalState";
import { Events } from "../../contexts/Events";
import { Data } from "../../contexts/Data";

import Logo from "../../resources/icons/tetris.svg";

export default function Play() {
    const globalState = useContext(GlobalState);
    const events = useContext(Events);
    const { APP_NAME } = useContext(Data);

    const container = useRef();
    const gameController = useRef();

    // #################################################
    //   RESIZE
    // #################################################

    const handleResize = () => {
        const width = container.current.clientWidth;
        const height = container.current.clientHeight;

        gameController.current.handleResize({ width, height });
    };

    useResize(handleResize, false);

    // #################################################
    //   INIT
    // #################################################

    const init = useCallback(() => {
        const width = container.current.clientWidth;
        const height = container.current.clientHeight;

        gameController.current = new GameController();
        gameController.current.init({ globalState, events, width, height, container, APP_NAME });
    }, [globalState, events, APP_NAME]);

    useEffect(() => {
        init();
    }, [init]);

    // #################################################
    //   PAUSED
    // #################################################

    const [gamePaused, setGamePaused] = useState(true);
    const [newGameClicked, setNewGameClicked] = useAutoResetState(false, 2000);
    const ignoreNext = useRef(false);
    const gameLost = useRef(false);

    const handleContinueGame = useCallback(() => {
        setGamePaused(false);
        gameController.current.resumeGame();
    }, []);

    const handleNewGame = useCallback(
        (forceNew) => {
            const saveData = ls.get(`${APP_NAME}_saveData`);

            if (newGameClicked || !saveData) {
                setGamePaused(false);

                if (saveData || forceNew) {
                    ls.remove(`${APP_NAME}_saveData`);
                    init();
                }
                gameController.current.resumeGame();
            } else {
                setNewGameClicked(true);
            }
        },
        [newGameClicked, setNewGameClicked, init, APP_NAME]
    );

    const handlePauseGame = useCallback(({ showPausePopup }) => {
        ignoreNext.current = !showPausePopup;
        setGamePaused(true);
        gameController.current.pauseGame();
        gameController.current.save();
    }, []);

    const showPopup = useCallback(() => {
        if (ignoreNext.current) {
            ignoreNext.current = false;
            return;
        }

        globalState.set("navbarVisible", gamePaused);

        if (!gamePaused) return globalState.set("showPopup", { ...globalState.get("showPopup"), visible: false });

        if (gameLost.current) {
            gameLost.current = false;

            globalState.set("showPopup", {
                visible: true,
                canCloseWithBackground: false,
                inFrontOfNavbar: false,
                handleClose: () => null,
                content: (
                    <>
                        <SVG className="logo" src={Logo}></SVG>
                        <h1>{"GAME OVER"}</h1>

                        <p>Score: 4050</p>
                        <p className="highScore">NEW HIGH SCORE</p>

                        <div className="button" onClick={() => handleNewGame(true)}>
                            NEW GAME
                        </div>
                    </>
                ),
            });

            return;
        }

        const saveData = ls.get(`${APP_NAME}_saveData`);
        globalState.set("showPopup", {
            visible: true,
            canCloseWithBackground: false,
            inFrontOfNavbar: false,
            handleClose: () => null,
            content: (
                <>
                    <SVG className="logo" src={Logo}></SVG>
                    <h1>{"KUBIC"}</h1>

                    {saveData && (
                        <div className="button middle" onClick={handleContinueGame}>
                            CONTINUE GAME
                        </div>
                    )}

                    <div
                        className={cn("button", { low: saveData && !newGameClicked })}
                        onClick={() => handleNewGame(false)}
                    >
                        NEW GAME
                    </div>

                    <div className={cn("message", { visible: newGameClicked })}>
                        Your current game will be lost. Click again to confirm.
                    </div>
                </>
            ),
        });
    }, [gamePaused, globalState, handleContinueGame, handleNewGame, newGameClicked, APP_NAME]);

    useEffect(() => {
        showPopup();
    }, [gamePaused, showPopup]);

    const handleGameLost = useCallback(() => {
        ls.remove(`${APP_NAME}_saveData`);
        gameLost.current = true;
        setGamePaused(true);
    }, []);

    // #################################################
    //   STAY IN APP
    // #################################################

    const handleMaybeCloseApp = useCallback(() => {
        ignoreNext.current = true;
        setGamePaused(true);
        gameController.current.pauseGame();
        gameController.current.save();
        globalState.set("navbarVisible", false);
    }, [globalState]);

    const handleStayInApp = useCallback(() => {
        ignoreNext.current = false;
        showPopup();
        globalState.set("navbarVisible", true);
    }, [showPopup, globalState]);

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        events.sub("pauseGame", handlePauseGame);
        events.sub("maybeCloseApp", handleMaybeCloseApp);
        events.sub("stayInApp", handleStayInApp);
        events.sub("gameLost", handleGameLost);

        return () => {
            events.unsub("pauseGame", handlePauseGame);
            events.unsub("maybeCloseApp", handleMaybeCloseApp);
            events.unsub("stayInApp", handleStayInApp);
            events.unsub("gameLost", handleGameLost);
        };
    }, [events, handleStayInApp, handlePauseGame, handleMaybeCloseApp]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Play" ref={container}>
            <Input />
            <UI gamePaused={gamePaused} />
        </div>
    );
}
