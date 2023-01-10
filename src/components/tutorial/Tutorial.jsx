import ls from 'local-storage';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import TutorialController from '../../game/TutorialController';
import TutorialInput from './TutorialInput';
import TutorialUI from './TutorialUI';

import useResize from '../../hooks/useResize';

import { Events } from '../../contexts/Events';
import { GlobalState } from '../../contexts/GlobalState';
import { Utils } from '../../contexts/Utils';

import Logo from '../../resources/icons/tetris.svg';

const STAGES = [
  {
    title: 'Rotate along the Y axis',
    subtitle: 'Swipe left or right on the bubble'
  },
  {
    title: 'Rotate along the X axis',
    subtitle: 'Swipe up or down on the left side of the bubble'
  },
  {
    title: 'Rotate along the Z axis',
    subtitle: 'Swipe up or down on the right side of the bubble'
  },
  {
    title: 'Move the piece',
    subtitle: 'Swipe outside the bubble'
  },
  {
    title: 'Place down',
    subtitle: 'Click the arrows below the floor, or swipe down with two fingers outside the bubble'
  },
  {
    title: 'Rotate level',
    subtitle:
      'Click the arrows to the left and right of the floor, or swipe left or right with two fingers outside the bubble'
  }
];

export default function Tutorial() {
  const globalState = useContext(GlobalState);
  const events = useContext(Events);
  const { vibrate } = useContext(Utils);

  const container = useRef();
  const tutorialController = useRef();

  const [stage, setStage] = useState({ current: 0, done: false });

  // #################################################
  //   RESIZE
  // #################################################

  const handleResize = () => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    tutorialController.current.handleResize({ width, height });
  };

  useResize(handleResize, false);

  // #################################################
  //   INIT
  // #################################################

  const init = useCallback(() => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    tutorialController.current = new TutorialController();
    tutorialController.current.init({ globalState, events, width, height, container });
  }, [globalState, events]);

  useEffect(() => {
    init();
  }, [init]);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleTutorialFinished = useCallback(async () => {
    vibrate(40);
    ls.set('kubic_tutorialStatus', true);

    events.emit('refreshApp');
  }, [events, vibrate]);

  const handleStageDone = () => {
    events.emit('tutorialStageDone');
    setStage((prev) => ({ ...prev, done: true }));
  };

  const handleNextStage = () => {
    if (stage.current >= STAGES.length - 1) return handleTutorialFinished();

    vibrate(40);
    setStage((prev) => ({ current: prev.current + 1, done: false }));
  };

  // #################################################
  //   WELCOME
  // #################################################

  const [popupVisible, setPopupVisible] = useState(true);

  const togglePopup = useCallback(() => {
    globalState.set('showPopup', {
      visible: popupVisible,
      canCloseWithBackground: false,
      inFrontOfNavbar: false,
      handleClose: () => null,
      content: (
        <>
          <SVG className="logo" src={Logo}></SVG>
          <h1>{'KUBIC'}</h1>

          <p>Get the basics down with this quick tutorial</p>

          <button
            className="button middle"
            onClick={() => {
              vibrate(40);
              setPopupVisible(false);
            }}
          >
            START TUTORIAL
          </button>

          <button className="subtitle" onClick={handleTutorialFinished}>
            Skip Tutorial
          </button>
        </>
      )
    });
  }, [globalState, popupVisible, handleTutorialFinished, vibrate]);

  useEffect(() => {
    togglePopup();
  }, [togglePopup]);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <div className="Tutorial">
      <div className="tutorialContainer" ref={container}></div>
      <TutorialInput stage={stage} handleStageDone={handleStageDone} />
      <TutorialUI
        stage={stage}
        STAGES={STAGES}
        handleNextStage={handleNextStage}
        handleStageDone={handleStageDone}
        popupVisible={popupVisible}
      />
    </div>
  );
}
