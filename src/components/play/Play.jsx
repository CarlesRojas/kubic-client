import { useRef, useEffect, useContext, useState, useCallback } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";

import Input from "./Input";
import UI from "./UI";
import GameController from "../../game/GameController";

import useResize from "../../hooks/useResize";

import { GlobalState } from "../../contexts/GlobalState";
import { Events } from "../../contexts/Events";

import Logo from "../../resources/icons/tetris.svg";

export default function Play() {
    const globalState = useContext(GlobalState);
    const events = useContext(Events);

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

    useEffect(() => {
        const width = container.current.clientWidth;
        const height = container.current.clientHeight;

        gameController.current = new GameController();
        gameController.current.init({ globalState, events, width, height, container });
    }, [globalState, events]);

    // #################################################
    //   PAUSED
    // #################################################

    const [gamePaused, setGamePaused] = useState(true);
    const ignoreNext = useRef(false);

    const handleContinueGame = useCallback(() => {
        setGamePaused(false);
    }, []);

    const handleNewGame = useCallback(() => {
        setGamePaused(false);
    }, []);

    const handlePauseGame = useCallback(({ showPausePopup }) => {
        ignoreNext.current = !showPausePopup;
        setGamePaused(true);
    }, []);

    const showPopup = useCallback(() => {
        if (ignoreNext.current) {
            ignoreNext.current = false;
            return;
        }

        globalState.set("showPopup", {
            visible: gamePaused,
            canCloseWithBackground: false,
            inFrontOfNavbar: false,
            handleClose: () => null,
            content: (
                <>
                    <SVG className="logo" src={Logo}></SVG>
                    <h1>{"KUBIC"}</h1>

                    <div className="button middle" onClick={handleContinueGame}>
                        CONTINUE GAME
                    </div>

                    <div className={cn("button", "low")} onClick={handleNewGame}>
                        NEW GAME
                    </div>
                </>
            ),
        });
    }, [gamePaused, globalState, handleContinueGame, handleNewGame]);

    useEffect(() => {
        showPopup();

        if (gamePaused) gameController.current.pauseGame();
        else gameController.current.resumeGame();
    }, [gamePaused, showPopup]);

    // #################################################
    //   STAY IN APP
    // #################################################

    const handleMaybeCloseApp = () => {
        ignoreNext.current = true;
        setGamePaused(true);
    };

    const handleStayInApp = useCallback(() => {
        ignoreNext.current = false;
        showPopup();
    }, [showPopup]);

    useEffect(() => {
        events.sub("pauseGame", handlePauseGame);
        events.sub("maybeCloseApp", handleMaybeCloseApp);
        events.sub("stayInApp", handleStayInApp);

        return () => {
            events.unsub("pauseGame", handlePauseGame);
            events.unsub("maybeCloseApp", handleMaybeCloseApp);
            events.unsub("stayInApp", handleStayInApp);
        };
    }, [events, handleStayInApp, handlePauseGame]);

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
