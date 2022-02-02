import { useRef, useEffect, useContext } from "react";
import useResize from "../../hooks/useResize";
import Input from "./Input";
import UI from "./UI";
import GameController from "../../game/GameController";

import { GlobalState } from "../../contexts/GlobalState";
import { Events } from "../../contexts/Events";

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

        gameController.current.load();

        return () => {
            gameController.current.save();
        };
    }, [globalState, events]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Play" ref={container}>
            <Input />
            <UI />
        </div>
    );
}
