import { useState, useRef, useContext, useEffect } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";

import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { Events } from "../../contexts/Events";

import Logo from "../../resources/icons/tetris.svg";
import BackgroundImage from "../../resources/images/Onboarding.png";

export default function Onboarding() {
    const { loginOrRegister } = useContext(API);
    const { emit } = useContext(Events);

    const username = useRef("");
    const password = useRef("");
    const [error, setError] = useState("");

    // #################################################
    //   CHECK VALIDITY
    // #################################################

    const loadingRef = useRef(false);
    const [loading, setLoading] = useState(false);

    const handleEnter = useThrottle(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        var result = await loginOrRegister(username.current, password.current);

        if ("error" in result) {
            setError(result.error.replaceAll(`"`, ""));

            setLoading(false);
            loadingRef.current = false;
        } else emit("refreshApp");
    }, 1500);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleUsernameChange = (event) => {
        username.current = event.target.value.toLowerCase();
    };

    const handlePasswordChange = (event) => {
        password.current = event.target.value;
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") handleEnter();
    };

    // #################################################
    //    FOCUS
    // #################################################

    const usernameInputRef = useRef();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        usernameInputRef.current.focus();
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

                <p>{"Login or Register"}</p>

                <p className="inputTitle">{"username"}</p>
                <input
                    className="input first"
                    type="text"
                    autoComplete="new-password"
                    onChange={handleUsernameChange}
                    ref={usernameInputRef}
                    title="username"
                    placeholder=""
                    maxLength="12"
                />

                <p className="inputTitle">{"password"}</p>
                <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    onChange={handlePasswordChange}
                    title="password"
                    placeholder=""
                />

                <p className={cn("error", { visible: !loading && error.length > 0 })}>{error || "-"}</p>
                <div className={cn("loading", { visible: loading })}>
                    <SVG className="icon rotateQuarters infinite" src={Logo}></SVG>
                </div>

                <div className="button middle" onClick={handleEnter}>
                    ENTER
                </div>

                <p className="subtitle">{"Your username will be publicly visible along with your highest score."}</p>
            </div>
        </div>
    );
}
