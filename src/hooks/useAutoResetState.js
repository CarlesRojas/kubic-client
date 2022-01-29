import { useEffect, useState } from "react";

export default function useAutoResetState(initialValue, duration) {
    const [internalState, setInternalState] = useState(initialValue);

    useEffect(() => {
        var timeout = null;
        if (internalState !== initialValue) timeout = setTimeout(() => setInternalState(initialValue), duration);

        return () => clearTimeout(timeout);
    }, [duration, initialValue, internalState]);

    return [internalState, setInternalState];
}
