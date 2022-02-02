const initialState = {
    // GAME
    nextTetromino: 0,
    gameDimensions: { width: 0, height: 0 },

    // LAYOUT
    loadingVisible: true,
    showPopup: {
        visible: false,
        canCloseWithBackground: false,
        inFrontOfNavbar: true,
        handleClose: () => null,
        content: null,
    },
};

export default initialState;
