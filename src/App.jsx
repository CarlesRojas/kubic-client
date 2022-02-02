import { useContext, useEffect, useState } from "react";

import Onboarding from "./components/onboarding/Onboarding";
import Tutorial from "./components/tutorial/Tutorial";
import MainLayout from "./components/layout/MainLayout";
import Landscape from "./components/layout/Landscape";

import useCloseApp from "./hooks/useCloseApp";

import { MediaQuery } from "./contexts/MediaQuery";
import { Data } from "./contexts/Data";
import { Utils } from "./contexts/Utils";

export default function App() {
    const { isMobile, isLandscape } = useContext(MediaQuery);
    const { APP_NAME } = useContext(Data);
    const { getCookie } = useContext(Utils);

    // #################################################
    //   CLOSE APP POPUP
    // #################################################

    useCloseApp();

    // #################################################
    //   LOAD DATA
    // #################################################

    const [data, setData] = useState({ username: null, tutorialDone: null });

    useEffect(() => {
        const usernameCookie = getCookie(`${APP_NAME}_username`);
        const tutorialDoneCookie = getCookie(`${APP_NAME}_tutorialDone`);
        setData({ username: usernameCookie || false, tutorialDone: tutorialDoneCookie || false });
    }, [APP_NAME, getCookie]);

    // #################################################
    //   RENDER
    // #################################################

    const { username, tutorialDone } = data;

    if (username === null && tutorialDone === null) return null;
    if (isMobile && isLandscape) return <Landscape />;

    if (!username) return <Onboarding />;
    if (!tutorialDone) return <Tutorial />;
    return <MainLayout />;
}
