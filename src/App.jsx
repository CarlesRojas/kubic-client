import ls from 'local-storage';
import { useCallback, useContext, useEffect, useState } from 'react';

import Landscape from './components/layout/Landscape';
import Popup from './components/layout/Popup';
import Tutorial from './components/tutorial/Tutorial';

import useCloseApp from './hooks/useCloseApp';

import Play from './components/play/Play';
import { Events } from './contexts/Events';
import { MediaQuery } from './contexts/MediaQuery';

export default function App() {
  const { isMobile, isLandscape } = useContext(MediaQuery);
  const { sub, unsub } = useContext(Events);

  // #################################################
  //   CLOSE APP POPUP
  // #################################################

  useCloseApp();

  // #################################################
  //   LOAD DATA
  // #################################################

  const [tutorialDone, setTutorialDone] = useState(ls.get('kubic_tutorialStatus'));

  const handleRefreshApp = useCallback(async () => {
    const tutorialDone = ls.get('kubic_tutorialStatus');

    setTutorialDone(tutorialDone);
  }, []);

  useEffect(() => {
    sub('refreshApp', handleRefreshApp);
    handleRefreshApp();

    return () => {
      unsub('refreshApp', handleRefreshApp);
    };
  }, [sub, unsub, handleRefreshApp]);

  // #################################################
  //   RENDER
  // #################################################

  // Wrong orientation on phones
  if (isMobile && isLandscape) return <Landscape />;

  // Do the tutorial
  if (!tutorialDone)
    return (
      <>
        <Popup />
        <Tutorial />
      </>
    );

  // Main Game
  return (
    <>
      <Popup />
      <Play />
    </>
  );
}
