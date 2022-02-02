import React from "react";
import cn from "classnames";
import { useTransition, animated } from "react-spring";
import useGlobalState from "../../hooks/useGlobalState";

export default function Popup() {
    const [information, setInformation] = useGlobalState("showPopup");

    const { visible, canCloseWithBackground, content } = information;

    // #################################################
    //   TRANSITIONS
    // #################################################

    const blurTransition = useTransition(visible, {
        from: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        enter: { backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px) opacity(1)" },
        leave: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        reverse: visible,
    });

    const contentTransition = useTransition(visible, {
        from: { translateY: "100vh" },
        enter: { translateY: "0vh" },
        leave: { translateY: "100vh" },
        reverse: visible,
    });

    // #################################################
    //   CLOSE
    // #################################################

    return (
        <div className="Popup">
            {blurTransition(
                (styles, item) =>
                    item && (
                        <animated.div
                            className={cn("blur", { canCloseWithBackground })}
                            style={styles}
                            onClick={() => canCloseWithBackground && setInformation({ ...information, visible: false })}
                        ></animated.div>
                    )
            )}
            {contentTransition(
                (styles, item) =>
                    item && (
                        <animated.div className={"contentContainer"} style={styles}>
                            {content}
                        </animated.div>
                    )
            )}
        </div>
    );
}
