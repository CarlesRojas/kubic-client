import constants from "../constants";

export const gridPosToWorldPos = ({ x, y, z }) => {
    const { cellSize, gridX, gridZ } = constants;

    const worldX = x * cellSize - (gridX / 2) * cellSize + cellSize / 2;
    const worldY = y * cellSize + cellSize / 2;
    const worldZ = z * cellSize - (gridZ / 2) * cellSize + cellSize / 2;

    return { worldX, worldY, worldZ };
};
