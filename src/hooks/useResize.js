import { useEffect, useRef } from "react";

import useDebounce from "./useDebounce";

export default function useResize(callback, callOnStart) {
    const handleResize = useDebounce(callback, 500);

    useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current && callOnStart) callback();
        firstRun.current = false;
    }, [callOnStart, callback]);

    return;
}
