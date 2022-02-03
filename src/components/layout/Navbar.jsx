import { useState, useContext } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";

import useThrottle from "../../hooks/useThrottle";
import useGlobalState from "../../hooks/useGlobalState";

import { GlobalState } from "../../contexts/GlobalState";
import { Events } from "../../contexts/Events";
import { Utils } from "../../contexts/Utils";

import ScoresIcon from "../../resources/icons/scores.svg";
import PlayIcon from "../../resources/icons/play.svg";
import SettingsIcon from "../../resources/icons/settings.svg";

const PAGES = [
    {
        name: "Scores",
        icon: ScoresIcon,
    },
    {
        name: "Play",
        icon: PlayIcon,
    },
    {
        name: "Settings",
        icon: SettingsIcon,
    },
];

export default function Navbar({ setPage, currentPage }) {
    const { set, get } = useContext(GlobalState);
    const { emit } = useContext(Events);
    const { vibrate } = useContext(Utils);

    const [visible] = useGlobalState("navbarVisible");

    // #################################################
    //   STATE
    // #################################################

    const [selected, updateSelected] = useState(currentPage.current);

    const setSelected = useThrottle((newIndex) => {
        if (selected === newIndex) return;

        vibrate(25);

        set("showPopup", { ...get("showPopup"), visible: false });
        if (newIndex !== 1) emit("pauseGame", { showPausePopup: false });

        currentPage.current = newIndex;
        updateSelected(newIndex);
        setPage(newIndex);
    }, 300);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Navbar", { visible })}>
            {PAGES.map(({ name, icon }, i) => (
                <div
                    className={cn("container", { selected: selected === i }, { middle: i === 1 }, `navbar${name}`)}
                    onClick={() => setSelected(i)}
                    key={name}
                >
                    <SVG className={cn("icon", `navbar${name}`)} src={icon} />
                    <p className={cn("name", `navbar${name}`)}>{name}</p>
                </div>
            ))}
        </div>
    );
}
