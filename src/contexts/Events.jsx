import { createContext, useRef } from "react";

export const Events = createContext();
const EventsProvider = (props) => {
    const events = useRef({});

    const sub = (eventName, func) => {
        events.current[eventName] = events.current[eventName] || [];
        events.current[eventName].push(func);
    };

    const unsub = (eventName, func) => {
        if (events.current[eventName])
            for (var i = 0; i < events.current[eventName].length; i++)
                if (events.current[eventName][i] === func) {
                    events.current[eventName].splice(i, 1);
                    break;
                }
    };

    const emit = (eventName, data) => {
        if (events.current[eventName])
            events.current[eventName].forEach(function (func) {
                func(data);
            });
    };

    return (
        <Events.Provider
            value={{
                sub,
                unsub,
                emit,
            }}
        >
            {props.children}
        </Events.Provider>
    );
};

export default EventsProvider;
