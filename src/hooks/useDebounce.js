import { useEffect, useCallback, useRef } from "react";
import _ from "lodash";

export default function useDebounce(cb, delay) {
    const options = { leading: false, trailing: true };
    const inputsRef = useRef(cb);
    const isMounted = useIsMounted();

    useEffect(() => {
        inputsRef.current = { cb, delay };
    });

    // eslint-disable-next-line
    return useCallback(
        _.debounce(
            (...args) => {
                if (inputsRef.current.delay === delay && isMounted()) inputsRef.current.cb(...args);
            },
            delay,
            options
        ),
        [delay, _.debounce]
    );
}

function useIsMounted() {
    const isMountedRef = useRef(true);
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    return () => isMountedRef.current;
}
