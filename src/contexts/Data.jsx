import { createContext, useRef } from "react";

const APP_NAME = "kubic";

export const Data = createContext();
const DataProvider = (props) => {
    // #################################################
    //   USER INFO
    // #################################################

    const token = useRef(null);

    return (
        <Data.Provider
            value={{
                APP_NAME,

                // USER INFO
                token,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
