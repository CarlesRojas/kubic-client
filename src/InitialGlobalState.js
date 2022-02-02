const initialState = {
    gameDimensions: { width: 0, height: 0 },
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
