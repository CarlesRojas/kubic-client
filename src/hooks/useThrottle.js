import { useEffect, useCallback, useRef } from "react";
import _ from "lodash";

export default function useThrottle(callback, delay) {
    const options = { leading: true, trailing: false };
    const callBackRef = useRef(callback);

    useEffect(() => {
        callBackRef.current = callback;
    });

    // eslint-disable-next-line
    return useCallback(
        _.throttle((...args) => callBackRef.current(...args), delay, options),
        [delay]
    );
}
