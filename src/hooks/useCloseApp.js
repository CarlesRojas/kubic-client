import { useEffect, useContext, useRef } from "react";
import SVG from "react-inlinesvg";

import { GlobalState } from "../contexts/GlobalState";
import { Events } from "../contexts/Events";

import Logo from "../resources/icons/tetris.svg";

export default function useCloseApp() {
    const { set, get } = useContext(GlobalState);
    const { emit } = useContext(Events);

    const userInteracted = useRef(false);

    useEffect(() => {
        const handleStayInApp = () => {
            window.history.pushState(null, null, "");
            set("showPopup", { ...get("showPopup"), visible: false });
            emit("stayInApp");
        };

        const handleBrowserBack = () => {
            emit("maybeCloseApp");

            set("showPopup", {
                visible: true,
                canCloseWithBackground: false,
                inFrontOfNavbar: true,
                handleClose: handleStayInApp,
                content: (
                    <>
                        <SVG className="logo" src={Logo}></SVG>
                        <h1>{"KUBIC"}</h1>

                        <p>{"Click back again to close the app."}</p>

                        <div className="button" onClick={handleStayInApp}>
                            Stay
                        </div>
                    </>
                ),
            });
        };

        const handleInteraction = () => {
            if (userInteracted.current) return;

            userInteracted.current = true;
            window.history.pushState(null, null, "");
        };

        window.addEventListener("popstate", handleBrowserBack);
        document.body.addEventListener("keydown", handleInteraction);
        document.body.addEventListener("click", handleInteraction);
        document.body.addEventListener("touchstart", handleInteraction);

        return () => {
            window.removeEventListener("popstate", handleBrowserBack);
            document.body.removeEventListener("keydown", handleInteraction);
            document.body.removeEventListener("click", handleInteraction);
            document.body.removeEventListener("touchstart", handleInteraction);
        };
    }, [set, get, emit]);
}
