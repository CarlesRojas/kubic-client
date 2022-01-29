import { useEffect, useContext, useRef } from "react";
import SVG from "react-inlinesvg";

import { GlobalState } from "../contexts/GlobalState";

import Logo from "../resources/icons/logoColor.svg";

export default function useCloseApp() {
    const { set } = useContext(GlobalState);

    const userInteracted = useRef(false);

    useEffect(() => {
        const handleStayInApp = () => {
            window.history.pushState(null, null, "");

            set("showPopup", {
                visible: false,
                canCloseWithBackground: false,
                closeButtonVisible: false,
                addPadding: true,
                fullscreen: false,
                content: (
                    <div className="closeApp">
                        <SVG className="logoColor" src={Logo}></SVG>
                        <h1>{"Click back again to close the app."}</h1>

                        <div className="closeButtons">
                            <div className="closeButton">Stay</div>
                        </div>
                    </div>
                ),
            });
        };

        const handleBrowserBack = () => {
            set("showPopup", {
                visible: true,
                canCloseWithBackground: false,
                closeButtonVisible: false,
                addPadding: true,
                fullscreen: false,
                content: (
                    <div className="closeApp">
                        <SVG className="logoColor" src={Logo}></SVG>

                        <h1>{"Click back again to close the app."}</h1>

                        <div className="closeButtons">
                            <div className="closeButton" onClick={handleStayInApp}>
                                Stay
                            </div>
                        </div>
                    </div>
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
    }, [set]);
}
