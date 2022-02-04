import { useState, useRef, useContext, useEffect } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import ls from "local-storage";

import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { Data } from "../../contexts/Data";
import { Events } from "../../contexts/Events";

import Logo from "../../resources/icons/tetris.svg";
import BackgroundImage from "../../resources/images/Onboarding.png";

export default function Onboarding() {
    const { validateUsername } = useContext(API);
    const { APP_NAME } = useContext(Data);
    const { emit } = useContext(Events);

    const nickname = useRef("");
    const [error, setError] = useState("");

    // #################################################
    //   ONBOARDING DONE
    // #################################################

    const handleOnboardingDone = (validationResult) => {
        ls.set(`${APP_NAME}_username`, validationResult.username);
        emit("refreshApp");
    };

    // #################################################
    //   CHECK VALIDITY
    // #################################################

    const validatingRef = useRef(false);
    const [validating, setValidating] = useState(false);

    const handleEnter = useThrottle(async () => {
        if (validatingRef.current) return;
        validatingRef.current = true;
        setValidating(true);

        var validationResult = await validateUsername(nickname.current);

        if ("error" in validationResult) {
            setError(validationResult.error.replaceAll(`"`, ""));
            setValidating(false);
            validatingRef.current = false;
        } else handleOnboardingDone(validationResult);
    }, 1500);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleChange = (event) => {
        nickname.current = event.target.value.toLowerCase();
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") handleEnter();
    };

    // #################################################
    //    FOCUS
    // #################################################

    const inputRef = useRef();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        inputRef.current.focus();
        setVisible(true);
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Onboarding" onKeyDown={handleKeyDown}>
            <div className="backgroundImage">
                <img src={BackgroundImage} alt="" />
            </div>

            <div className="blur"></div>

            <div className={cn("contentContainer", { visible })}>
                <SVG className="logo" src={Logo}></SVG>
                <h1>KUBIC</h1>

                <p>{"Enter a nickname."}</p>
                <input
                    className="input"
                    type={"text"}
                    autoComplete="new-password"
                    onChange={handleChange}
                    ref={inputRef}
                    title="nickname"
                    placeholder=""
                    maxLength="12"
                />
                <p className={cn("error", { visible: error.length > 0 })}>
                    {error || "Mollit aliqua ex veniam laboris Mollit aliqua ex veniam laboris"}
                </p>

                <div className={cn("loading", { visible: validating })}>
                    <SVG className="icon rotateQuarters infinite" src={Logo}></SVG>
                </div>

                <div className="button middle" onClick={handleEnter}>
                    ENTER
                </div>

                <p className="subtitle">{"This will be publicly visible along with your highest score."}</p>
            </div>
        </div>
    );
}
