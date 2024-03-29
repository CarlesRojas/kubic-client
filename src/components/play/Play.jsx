import cn from 'classnames';
import ls from 'local-storage';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import GameController from '../../game/GameController';
import Input from './Input';
import UI from './UI';

import useAutoResetState from '../../hooks/useAutoResetState';
import useResize from '../../hooks/useResize';

import { Events } from '../../contexts/Events';
import { GlobalState } from '../../contexts/GlobalState';
import { Utils } from '../../contexts/Utils';

import Logo from '../../resources/icons/tetris.svg';

export default function Play() {
  const globalState = useContext(GlobalState);
  const events = useContext(Events);
  const { vibrate } = useContext(Utils);

  const container = useRef();
  const gameController = useRef();

  // #################################################
  //   RESIZE
  // #################################################

  const handleResize = () => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    gameController.current.handleResize({ width, height });
  };

  useResize(handleResize, false);

  // #################################################
  //   INIT
  // #################################################

  const init = useCallback(() => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    gameController.current = new GameController();
    gameController.current.init({ globalState, events, width, height, container, APP_NAME: 'kubic' });
  }, [globalState, events]);

  useEffect(() => {
    init();
  }, [init]);

  // #################################################
  //   PAUSED
  // #################################################

  const [gamePaused, setGamePaused] = useState(true);
  const [newGameClicked, setNewGameClicked] = useAutoResetState(false, 2000);
  const ignoreNext = useRef(false);
  const gameLost = useRef(false);

  const handleContinueGame = useCallback(() => {
    vibrate(40);
    setGamePaused(false);
    gameController.current.resumeGame();
  }, [vibrate]);

  const handleNewGame = useCallback(
    (forceNew) => {
      const saveData = ls.get('kubic_saveData');

      vibrate(40);

      if (newGameClicked || !saveData) {
        setGamePaused(false);

        if (saveData || forceNew) {
          ls.remove('kubic_saveData');
          init();
        }
        gameController.current.resumeGame();
      } else {
        setNewGameClicked(true);
      }
    },
    [newGameClicked, setNewGameClicked, init, vibrate]
  );

  const handlePauseGame = useCallback(({ showPausePopup }) => {
    ignoreNext.current = !showPausePopup;
    setGamePaused(true);
    gameController.current.pauseGame();
    gameController.current.save();
  }, []);

  const showPopup = useCallback(() => {
    if (ignoreNext.current) {
      ignoreNext.current = false;
      return;
    }

    globalState.set('navbarVisible', gamePaused);

    if (!gamePaused) return globalState.set('showPopup', { ...globalState.get('showPopup'), visible: false });

    if (gameLost.current) {
      gameLost.current = false;

      const highestScore = ls.get('kubic_score');
      const currScore = gameController.current.global.score;

      globalState.set('showPopup', {
        visible: true,
        canCloseWithBackground: false,
        inFrontOfNavbar: false,
        handleClose: () => null,
        content: (
          <>
            <SVG className="logo" src={Logo}></SVG>
            <h1>{'GAME OVER'}</h1>

            <p className="score">score</p>
            <p className={cn('scoreValue', { high: currScore >= highestScore })}>{currScore}</p>
            {currScore >= highestScore && <p className="highScore">NEW HIGH SCORE!</p>}

            <div className="button" onClick={() => handleNewGame(true)}>
              NEW GAME
            </div>
          </>
        )
      });

      return;
    }

    const saveData = ls.get('kubic_saveData');
    const highestScore = ls.get('kubic_score');

    globalState.set('showPopup', {
      visible: true,
      canCloseWithBackground: false,
      inFrontOfNavbar: false,
      handleClose: () => null,
      content: (
        <>
          <SVG className="logo" src={Logo}></SVG>
          <h1>{'KUBIC'}</h1>

          {saveData && (
            <div className="button middle" onClick={handleContinueGame}>
              CONTINUE GAME
            </div>
          )}

          <div className={cn('button', { low: saveData && !newGameClicked })} onClick={() => handleNewGame(false)}>
            NEW GAME
          </div>

          {highestScore > 0 && <p className="yourScore">Your highest score:</p>}
          {highestScore > 0 && <p className="yourScoreValue">{highestScore}</p>}

          <div className={cn('message', { visible: newGameClicked })}>
            Your current game will be lost. Click again to confirm.
          </div>
        </>
      )
    });
  }, [gamePaused, globalState, handleContinueGame, handleNewGame, newGameClicked]);

  useEffect(() => {
    showPopup();
  }, [gamePaused, showPopup]);

  const handleGameLost = useCallback(() => {
    const highestScore = ls.get('kubic_score');
    if (gameController.current.global.score > highestScore) ls.set('kubic_score', gameController.current.global.score);

    ls.remove('kubic_saveData');

    gameController.current.pauseGame();
    gameLost.current = true;
    setGamePaused(true);
  }, []);

  // #################################################
  //   STAY IN APP
  // #################################################

  const handleMaybeCloseApp = useCallback(() => {
    ignoreNext.current = true;
    setGamePaused(true);
    gameController.current.pauseGame();
    gameController.current.save();
    globalState.set('navbarVisible', false);
  }, [globalState]);

  const handleStayInApp = useCallback(() => {
    ignoreNext.current = false;
    showPopup();
    globalState.set('navbarVisible', true);
  }, [showPopup, globalState]);

  const gameSavedBeforeClose = useRef(false);

  const handleAppClose = (event) => {
    event.preventDefault();
    if (gameSavedBeforeClose.current) return;
    gameSavedBeforeClose.current = true;

    gameController.current.save();

    event.returnValue = '';
  };

  // #################################################
  //   EVENTS
  // #################################################

  useEffect(() => {
    events.sub('pauseGame', handlePauseGame);
    events.sub('maybeCloseApp', handleMaybeCloseApp);
    events.sub('stayInApp', handleStayInApp);
    events.sub('gameLost', handleGameLost);
    window.addEventListener('beforeunload', handleAppClose);
    window.addEventListener('pagehide', handleAppClose);
    window.addEventListener('onunload', handleAppClose);
    window.addEventListener('blur', handleAppClose);

    return () => {
      events.unsub('pauseGame', handlePauseGame);
      events.unsub('maybeCloseApp', handleMaybeCloseApp);
      events.unsub('stayInApp', handleStayInApp);
      events.unsub('gameLost', handleGameLost);
      window.removeEventListener('beforeunload', handleAppClose);
      window.removeEventListener('pagehide', handleAppClose);
      window.removeEventListener('onunload', handleAppClose);
      window.removeEventListener('blur', handleAppClose);
    };
  }, [events, handleStayInApp, handlePauseGame, handleMaybeCloseApp, handleGameLost]);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <div className="Play">
      <div className="playContainer" ref={container}></div>
      <Input />
      <UI gamePaused={gamePaused} />
    </div>
  );
}
