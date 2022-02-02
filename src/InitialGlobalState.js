const initialState = {
    gameDimensions: { width: 0, height: 0 },
    loadingVisible: true,
    showPopup: {
        show: false,
        canCloseWithBackground: false,
        closeButtonVisible: true,
        content: null,
        addPadding: true,
        fullscreen: false,
    },
};

export default initialState;
