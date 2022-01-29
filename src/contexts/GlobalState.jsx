import { createContext, useRef } from "react";
import initialState from "../InitialGlobalState";

const getObjectFromInitialState = () => {
    const result = {};
    for (const [key, value] of Object.entries(initialState)) result[key] = { value, subbedFunctions: [] };
    return result;
};

export const GlobalState = createContext();
const GlobalStateProvider = (props) => {
    const state = useRef(getObjectFromInitialState());

    const sub = (stateName, func) => {
        state.current[stateName] = state.current[stateName] || { value: null, subbedFunctions: [] };
        state.current[stateName].subbedFunctions.push(func);
    };

    const unsub = (stateName, func) => {
        if (state.current[stateName])
            for (var i = 0; i < state.current[stateName].subbedFunctions.length; i++)
                if (state.current[stateName].subbedFunctions[i] === func) {
                    state.current[stateName].subbedFunctions.splice(i, 1);
                    break;
                }
    };

    const set = (stateName, value) => {
        if (state.current[stateName]) {
            state.current[stateName].value = value;
            state.current[stateName].subbedFunctions.forEach(function (func) {
                func(value);
            });
        } else state.current[stateName] = { value, subbedFunctions: [] };
    };

    const get = (stateName) => {
        if (state.current[stateName]) return state.current[stateName].value;
        return null;
    };

    return (
        <GlobalState.Provider
            value={{
                sub,
                unsub,
                set,
                get,
            }}
        >
            {props.children}
        </GlobalState.Provider>
    );
};

export default GlobalStateProvider;
