const constants = {
    // GRID

    gridX: 4,
    gridZ: 4,
    gridY: 12,
    cellSize: 10,

    // FLOOR
    floor: {
        id: "floor",
        color: "#666666",
    },

    // TETROMINOS

    tetrominos: [
        {
            num: 0,
            id: "Z",
            positions: [
                [0, 0, 0],
                [0, 0, 1],
                [1, 0, 0],
                [1, 1, 0],
            ],
            colorPastel: "#ff7070",
            color: "#ff5454",
        },
        {
            num: 1,
            id: "J",
            positions: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 0, 0],
                [1, 0, 1],
            ],
            colorPastel: "#ffb070",
            color: "#ff9b54",
        },
        {
            num: 2,
            id: "O",
            positions: [
                [0, 0, 0],
                [0, 0, 1],
                [0, 1, 0],
                [0, 1, 1],
            ],
            colorPastel: "#fff170",
            color: "#ffff54",
        },
        {
            num: 3,
            id: "S",
            positions: [
                [0, 0, 0],
                [0, 0, -1],
                [0, 1, 0],
                [0, 1, 1],
            ],
            colorPastel: "#70ff70",
            color: "#79ff54",
        },
        {
            num: 4,
            id: "I",
            positions: [
                [0, 0, 0],
                [0, 0, -1],
                [0, 0, 1],
                [0, 0, 2],
            ],
            colorPastel: "#70e5ff",
            color: "#54e8ff",
        },
        {
            num: 5,
            id: "L",
            positions: [
                [0, 0, 0],
                [0, 0, -1],
                [0, 1, -1],
                [0, 0, 1],
            ],
            colorPastel: "#707eff",
            color: "#5f54ff",
        },
        {
            num: 6,
            id: "T",
            positions: [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, -1],
            ],
            colorPastel: "#b370ff",
            color: "#a154ff",
        },
        {
            num: -1,
            id: "M",
            positions: [
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ],
            colorPastel: "#ff70f5",
            color: "#ff54ee",
        },
    ],
};

export default constants;
