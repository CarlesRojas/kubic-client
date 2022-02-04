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
    const { APP_NAME } = useContext(Data);
    const { sub, unsub } = useContext(Events);
    const { getUser } = useContext(API);

    // #################################################
    //   CLOSE APP POPUP
    // #################################################

    useCloseApp();

    // #################################################
    //   LOAD DATA
    // #################################################

    const [data, setData] = useState({ userLoaded: null, tutorialDone: null });

    const getUserData = useCallback(
        async (usernameCookie) => {
            if (!usernameCookie) return false;

            const user = await getUser(usernameCookie);

            if ("error" in user) {
                ls.clear();
                return false;
            }

            ls.set(`${APP_NAME}_username`, user.username);
            ls.set(`${APP_NAME}_score`, user.score);

            return true;
        },
        [APP_NAME, getUser]
    );

    const handleRefreshApp = useCallback(async () => {
        const usernameCookie = ls.get(`${APP_NAME}_username`);
        const userLoaded = await getUserData(usernameCookie);

        const tutorialDoneCookie = ls.get(`${APP_NAME}_tutorialDone`);
        setData({ userLoaded, tutorialDone: tutorialDoneCookie || false });
    }, [APP_NAME, getUserData]);

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

    const { userLoaded, tutorialDone } = data;

    if (userLoaded === null && tutorialDone === null) return null;
    if (isMobile && isLandscape) return <Landscape />;

    if (!userLoaded) return <Onboarding />;
    // if (!tutorialDone) return <Tutorial />;
    return (
        <>
            <Popup />
            <MainLayout />
        </>
    );
}
