import { useEffect, useContext, useRef } from "react";
import SVG from "react-inlinesvg";

import { GlobalState } from "../contexts/GlobalState";

import Logo from "../resources/icons/logoColor.svg";

export default function useCloseApp() {
    const { set, get } = useContext(GlobalState);

    const userInteracted = useRef(false);

    useEffect(() => {
        const handleStayInApp = () => {
            window.history.pushState(null, null, "");

            set("showPopup", { ...get("showPopup"), visible: false });
        };

        const handleBrowserBack = () => {
            set("showPopup", {
                visible: true,
                canCloseWithBackground: true,
                inFrontOfNavbar: true,
                handleClose: handleStayInApp,
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
    }, [set, get]);
}
