import { useRef } from "react";

import Play from "../play/Play";
import Scores from "../scores/Scores";
import Settings from "../settings/Settings";
import Navbar from "./Navbar";

import usePageAnimation from "../../hooks/usePageAnimation";

const STAGES = ["scores", "play", "settings"];

export default function MainLayout() {
    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const currentPage = useRef(1);

    const animationSpeed = 300;
    const content = STAGES.map((id) => {
        if (id === "scores") return <Scores />;
        else if (id === "play") return <Play />;
        else if (id === "settings") return <Settings />;
        else return null;
    });
    const [{ renderedPages, setPage }] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "mainPages",
        animationSpeed,
        animateFirst: false,
        initialPage: currentPage.current,
    });

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="MainLayout">
            <Navbar setPage={setPage} currentPage={currentPage} />
            <div className="mainPagesContent">{renderedPages}</div>
        </div>
    );
}
