import { useContext, useEffect, useState, useCallback } from "react";
import { GlobalState } from "../contexts/GlobalState";

export default function useGlobalState(stateName) {
    const { sub, unsub, set, get } = useContext(GlobalState);

    const [state, setState] = useState(get(stateName));

    const setData = useCallback(
        (value) => {
            set(stateName, value);
        },
        [set, stateName]
    );

    useEffect(() => {
        sub(stateName, setState);

        return () => {
            unsub(stateName, setState);
        };
    }, [sub, unsub, stateName]);

    return [state, setData];
}
