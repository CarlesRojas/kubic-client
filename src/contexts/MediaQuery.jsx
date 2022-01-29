import { createContext, useEffect } from "react";
import cn from "classnames";
import { useMediaQuery } from "react-responsive";
import { isMobile as isTouchScreen, isMobileOnly } from "react-device-detect";

export const MediaQuery = createContext();
const MediaQueryProvider = (props) => {
    const isDesktop = useMediaQuery({ minWidth: 1100 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1100 });
    const isMobileSize = useMediaQuery({ maxWidth: 768 });
    const isLandscape = useMediaQuery({ orientation: "landscape" });
    const isNotTouchscreen = !isTouchScreen;

    const queryClasses = () => {
        return cn({ isDesktop }, { isTablet }, { isLandscape }, { isNotTouchscreen });
    };

    useEffect(() => {
        isDesktop ? document.body.classList.add("isDesktop") : document.body.classList.remove("isDesktop");
        isTablet ? document.body.classList.add("isTablet") : document.body.classList.remove("isTablet");
        isMobileSize ? document.body.classList.add("isMobileSize") : document.body.classList.remove("isMobileSize");
        isLandscape ? document.body.classList.add("isLandscape") : document.body.classList.remove("isLandscape");
        isNotTouchscreen
            ? document.body.classList.add("isNotTouchscreen")
            : document.body.classList.remove("isNotTouchscreen");
    }, [isDesktop, isTablet, isMobileSize, isLandscape, isNotTouchscreen]);

    return (
        <MediaQuery.Provider
            value={{
                // MEDIA QUERIES
                isDesktop,
                isTablet,
                isMobileSize,
                isMobile: isMobileOnly,
                isLandscape,
                isNotTouchscreen,

                // CLASSES
                queryClasses,
            }}
        >
            {props.children}
        </MediaQuery.Provider>
    );
};

export default MediaQueryProvider;
