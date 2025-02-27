// Constants for the coordinate system
export const BOARD_SIZE = 9
export const CELL_SIZE = 1
export const WALL_THICKNESS = 0.1
export const WALL_HEIGHT = 0.4
export const WALL_LENGTH = 2

// Function to convert world coordinates to grid coordinates
export function worldToGrid(point) {
  return {
    x: Math.round(point.x + 4),
    z: Math.round(point.z + 4),
  }
}

// Function to determine the exact position of the wall on the grid
export function snapToWallPosition(point) {
  const gridX = point.x + 4
  const gridZ = point.z + 4

  // Determine if we are closer to a vertical or horizontal line
  const fracX = gridX - Math.floor(gridX)
  const fracZ = gridZ - Math.floor(gridZ)

  // If we are closer to a vertical line
  if (Math.abs(fracX - 0.5) < Math.abs(fracZ - 0.5)) {
    return {
      x: Math.round(gridX) - 0.5,
      z: Math.floor(gridZ),
      orientation: "vertical",
    }
  }

  // If we are closer to a horizontal line
  return {
    x: Math.floor(gridX),
    z: Math.round(gridZ) - 0.5,
    orientation: "horizontal",
  }
}

// Function to check if two walls intersect
export function checkWallIntersection(wall1, wall2) {
  if (wall1.orientation === wall2.orientation) {
    return wall1.x === wall2.x && wall1.z === wall2.z
  }

  if (wall1.orientation === "horizontal") {
    return wall1.x === wall2.x && wall1.z === wall2.z
  } else {
    return wall1.x === wall2.x && wall1.z === wall2.z
  }
}

// Function to check if a position is within the board
export function isWithinBoard(pos) {
  if (pos.orientation === "horizontal") {
    return pos.x >= 0 && pos.x < BOARD_SIZE - 1 && pos.z > 0 && pos.z < BOARD_SIZE
  } else {
    return pos.x > 0 && pos.x < BOARD_SIZE && pos.z >= 0 && pos.z < BOARD_SIZE - 1
  }
}

// Function to get the cells affected by a wall
export function getAffectedCells(wall) {
  if (wall.orientation === "horizontal") {
    return [
      { x: wall.x, z: wall.z - 1 },
      { x: wall.x + 1, z: wall.z - 1 },
      { x: wall.x, z: wall.z },
      { x: wall.x + 1, z: wall.z },
    ]
  } else {
    return [
      { x: wall.x - 1, z: wall.z },
      { x: wall.x - 1, z: wall.z + 1 },
      { x: wall.x, z: wall.z },
      { x: wall.x, z: wall.z + 1 },
    ]
  }
}

