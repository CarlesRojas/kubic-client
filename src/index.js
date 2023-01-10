import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './styles/main.scss';

// Contexts
import EventsProvider from './contexts/Events';
import GlobalStateProvider from './contexts/GlobalState';
import MediaQueryProvider from './contexts/MediaQuery';
import UtilsProvider from './contexts/Utils';

ReactDOM.render(
  <StrictMode>
    <EventsProvider>
      <UtilsProvider>
        <GlobalStateProvider>
          <MediaQueryProvider>
            <App />
          </MediaQueryProvider>
        </GlobalStateProvider>
      </UtilsProvider>
    </EventsProvider>
  </StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
