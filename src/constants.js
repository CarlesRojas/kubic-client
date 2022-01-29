const constants = {
    gridX: 4,
    gridZ: 4,
    gridY: 12,
    cubeSize: 10,
    tetrominos: [
        {
            id: "I",
            positions: [
                [0, 0, 0],
                [0, 0, -1],
                [0, 0, 1],
                [0, 0, 2],
            ],
            color: "#4CD7FF",
        },
        {
            id: "J",
            positions: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 0, 0],
                [1, 0, 1],
            ],
            color: "#FF8E31",
        },
        {
            id: "L",
            positions: [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, 2],
            ],
            color: "#3559FF",
        },
        {
            id: "M",
            positions: [
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ],
            color: "#35A126",
        },
        {
            id: "O",
            positions: [
                [0, 0, 0],
                [0, 0, 1],
                [0, 1, 0],
                [0, 1, 1],
            ],
            color: "#FFF454",
        },
        {
            id: "S",
            positions: [
                [0, 0, 0],
                [0, 0, -1],
                [0, 1, 0],
                [0, 1, 1],
            ],
            color: "#4EFB27",
        },
        {
            id: "T",
            positions: [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, -1],
            ],
            color: "#AB62FF",
        },
        {
            id: "Z",
            positions: [
                [0, 0, 0],
                [0, 0, 1],
                [1, 0, 0],
                [1, 1, 0],
            ],
            color: "#FF4C4C",
        },
    ],
};

export default constants;
