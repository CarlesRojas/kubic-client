import { StrictMode } from "react";
import * as serviceWorker from "./serviceWorker";
import ReactDOM from "react-dom";
import App from "./App";
import "./styles/main.scss";

// Contexts
import EventsProvider from "./contexts/Events";
import UtilsProvider from "./contexts/Utils";
import APIProvider from "./contexts/API";
import GlobalStateProvider from "./contexts/GlobalState";
import DataProvider from "./contexts/Data";
import MediaQueryProvider from "./contexts/MediaQuery";

ReactDOM.render(
    <StrictMode>
        <EventsProvider>
            <UtilsProvider>
                <GlobalStateProvider>
                    <DataProvider>
                        <APIProvider>
                            <MediaQueryProvider>
                                <App />
                            </MediaQueryProvider>
                        </APIProvider>
                    </DataProvider>
                </GlobalStateProvider>
            </UtilsProvider>
        </EventsProvider>
    </StrictMode>,
    document.getElementById("root")
);

serviceWorker.register();
