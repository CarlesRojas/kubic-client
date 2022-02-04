import { useContext, useEffect, useState, useCallback } from "react";
import ls from "local-storage";

import Onboarding from "./components/onboarding/Onboarding";
import Tutorial from "./components/tutorial/Tutorial";
import MainLayout from "./components/layout/MainLayout";
import Landscape from "./components/layout/Landscape";
import Popup from "./components/layout/Popup";

import useCloseApp from "./hooks/useCloseApp";

import { MediaQuery } from "./contexts/MediaQuery";
import { Data } from "./contexts/Data";
import { Events } from "./contexts/Events";
import { API } from "./contexts/API";

export default function App() {
    const { isMobile, isLandscape } = useContext(MediaQuery);
    const { APP_NAME, token } = useContext(Data);
    const { sub, unsub } = useContext(Events);
    const { getUserInfo } = useContext(API);

    // #################################################
    //   CLOSE APP POPUP
    // #################################################

    useCloseApp();

    // #################################################
    //   LOAD DATA
    // #################################################

    const [userLoaded, setUserLoaded] = useState(null);

    const handleRefreshApp = useCallback(async () => {
        const tokenInCookie = ls.get(`${APP_NAME}_token`);

        if (!tokenInCookie) return setUserLoaded(false);

        token.current = tokenInCookie;
        const success = await getUserInfo();
        setUserLoaded(success);
    }, [APP_NAME, getUserInfo, token]);

    useEffect(() => {
        sub("refreshApp", handleRefreshApp);
        handleRefreshApp();

        return () => {
            unsub("refreshApp", handleRefreshApp);
        };
    }, [sub, unsub, handleRefreshApp]);

    // #################################################
    //   RENDER
    // #################################################

    if (userLoaded === null) return null;

    // Wrong orientation on phones
    if (isMobile && isLandscape) return <Landscape />;

    // Login or Register
    if (!userLoaded) return <Onboarding />;

    // Do the tutorial
    const tutorialDone = ls.get(`${APP_NAME}_tutorialStatus`);
    if (!tutorialDone) return <Tutorial />;

    // Main Game
    return (
        <>
            <Popup />
            <MainLayout />
        </>
    );
}
