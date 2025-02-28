// Constants
const BOARD_SIZE = 9;
const WALL_GRID_SIZE = 8; // One less than board size for wall placement

/**
 * Creates the initial game state
 */
export function createInitialGameState() {
  return {
    players: [
      { x: 4, z: 0, wallsLeft: 10 }, // Player 1 (red)
      { x: 4, z: 8, wallsLeft: 10 }, // Player 2 (blue)
    ],
    currentPlayer: 0,
    walls: [],
    wallMode: false,
    validMoves: [],
    winner: null,
  };
}

/**
 * Checks if a position is within the board boundaries
 */
export function isWithinBoard(x, z) {
  return x >= 0 && x < BOARD_SIZE && z >= 0 && z < BOARD_SIZE;
}

/**
 * Checks if a wall position is within valid board boundaries
 * Ensures walls can only be placed between 2x2 blocks of squares
 */
export function isWallWithinBoard(wall) {
  if (wall.orientation === "horizontal") {
    // Horizontal walls must be between rows and have space for 2 squares
    return (
      wall.x >= 0 &&
      wall.x < WALL_GRID_SIZE &&
      wall.z > 0 &&
      wall.z < BOARD_SIZE &&
      Number.isInteger(wall.z)
    );
  } else {
    // Vertical walls must be between columns and have space for 2 squares
    return (
      wall.x > 0 &&
      wall.x < BOARD_SIZE &&
      wall.z >= 0 &&
      wall.z < WALL_GRID_SIZE &&
      Number.isInteger(wall.x)
    );
  }
}

/**
 * Checks if two walls overlap or are adjacent in a way that would create a continuous barrier
 * Updated to properly check 2x2 block coverage
 */
export function doWallsOverlap(wall1, wall2) {
  if (wall1.orientation === wall2.orientation) {
    if (wall1.orientation === "horizontal") {
      // Check if walls share the same row and are adjacent or overlapping
      return wall1.z === wall2.z && Math.abs(wall1.x - wall2.x) <= 1;
    } else {
      // Check if walls share the same column and are adjacent or overlapping
      return wall1.x === wall2.x && Math.abs(wall1.z - wall2.z) <= 1;
    }
  }

  // Check intersection of different orientations
  if (wall1.orientation === "horizontal") {
    return (
      wall1.x <= wall2.x &&
      wall1.x + 1 >= wall2.x &&
      wall2.z <= wall1.z &&
      wall2.z + 1 >= wall1.z
    );
  } else {
    return (
      wall2.x <= wall1.x &&
      wall2.x + 1 >= wall1.x &&
      wall1.z <= wall2.z &&
      wall1.z + 1 >= wall2.z
    );
  }
}

/**
 * Checks if a wall blocks the movement between two adjacent cells
 */
export function isMovementBlocked(fromX, fromZ, toX, toZ, walls) {
  // Only check adjacent cells (one step in any direction)
  if (Math.abs(fromX - toX) + Math.abs(fromZ - toZ) !== 1) {
    return false;
  }

  // Moving horizontally
  if (fromZ === toZ) {
    const minX = Math.min(fromX, toX);
    // Check for vertical walls between these cells
    return walls.some(
      (wall) =>
        wall.orientation === "vertical" &&
        wall.x === minX + 1 &&
        (wall.z === fromZ || wall.z === fromZ - 1)
    );
  }
  // Moving vertically
  else if (fromX === toX) {
    const minZ = Math.min(fromZ, toZ);
    // Check for horizontal walls between these cells
    return walls.some(
      (wall) =>
        wall.orientation === "horizontal" &&
        wall.z === minZ + 1 &&
        (wall.x === fromX || wall.x === fromX - 1)
    );
  }

  return false;
}

/**
 * Gets all valid moves for a player, including jumps over opponents
 */
export function getValidMoves(playerIndex, gameState) {
  const player = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];
  const { walls } = gameState;

  // Basic orthogonal moves
  const potentialMoves = [
    { x: player.x + 1, z: player.z }, // Right
    { x: player.x - 1, z: player.z }, // Left
    { x: player.x, z: player.z + 1 }, // Down
    { x: player.x, z: player.z - 1 }, // Up
  ];

  // Filter moves that are within the board and not blocked by walls
  const validMoves = potentialMoves.filter((move) => {
    // Check if move is within board boundaries
    if (!isWithinBoard(move.x, move.z)) {
      return false;
    }

    // Check if move is blocked by a wall
    if (isMovementBlocked(player.x, player.z, move.x, move.z, walls)) {
      return false;
    }

    // Check if move is occupied by opponent
    if (move.x === opponent.x && move.z === opponent.z) {
      // If opponent is in this position, we need to check for jump possibilities
      return false;
    }

    return true;
  });

  // Handle jumps over opponent
  if (Math.abs(player.x - opponent.x) + Math.abs(player.z - opponent.z) === 1) {
    // Opponent is adjacent, check if we can jump
    const jumpX = opponent.x + (opponent.x - player.x);
    const jumpZ = opponent.z + (opponent.z - player.z);

    // Check if jump destination is within board
    if (isWithinBoard(jumpX, jumpZ)) {
      // Check if there's no wall blocking the jump
      if (!isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
        // Add the jump move
        validMoves.push({ x: jumpX, z: jumpZ });
      } else {
        // If straight jump is blocked, check for diagonal jumps
        const diagonalJumps = [
          {
            x: opponent.x + (player.z - opponent.z),
            z: opponent.z + (player.x - opponent.x),
          },
          {
            x: opponent.x - (player.z - opponent.z),
            z: opponent.z - (player.x - opponent.x),
          },
        ];

        diagonalJumps.forEach((jump) => {
          if (
            isWithinBoard(jump.x, jump.z) &&
            !isMovementBlocked(opponent.x, opponent.z, jump.x, jump.z, walls) &&
            !isMovementBlocked(
              player.x,
              player.z,
              opponent.x,
              opponent.z,
              walls
            )
          ) {
            validMoves.push(jump);
          }
        });
      }
    }
  }

  return validMoves;
}

/**
 * Checks if a player has a path to their goal using BFS
 */
export function hasPathToGoal(playerIndex, gameState) {
  const player = gameState.players[playerIndex];
  const { walls } = gameState;

  // Define the goal row based on player index
  const goalZ = playerIndex === 0 ? BOARD_SIZE - 1 : 0;

  // Create a queue for BFS
  const queue = [{ x: player.x, z: player.z }];

  // Create a set to track visited positions
  const visited = new Set();
  visited.add(`${player.x},${player.z}`);

  // BFS algorithm
  while (queue.length > 0) {
    const current = queue.shift();

    // Check if we've reached the goal row
    if (current.z === goalZ) {
      return true;
    }

    // Check all four possible moves
    const moves = [
      { x: current.x + 1, z: current.z }, // Right
      { x: current.x - 1, z: current.z }, // Left
      { x: current.x, z: current.z + 1 }, // Down
      { x: current.x, z: current.z - 1 }, // Up
    ];

    for (const move of moves) {
      // Skip if out of bounds
      if (!isWithinBoard(move.x, move.z)) {
        continue;
      }

      // Skip if already visited
      const moveKey = `${move.x},${move.z}`;
      if (visited.has(moveKey)) {
        continue;
      }

      // Check if move is blocked by a wall
      if (isMovementBlocked(current.x, current.z, move.x, move.z, walls)) {
        continue;
      }

      visited.add(moveKey);
      queue.push(move);
    }
  }

  // If we've exhausted all possibilities without reaching the goal
  return false;
}

/**
 * Validates if a wall placement follows all game rules
 */
export function isValidWallPlacement(wallPos, gameState) {
  // Check basic position validity
  if (!isWallWithinBoard(wallPos)) {
    return false;
  }

  // Check wall count
  if (gameState.players[gameState.currentPlayer].wallsLeft <= 0) {
    return false;
  }

  // Check overlap with existing walls
  if (gameState.walls.some((wall) => doWallsOverlap(wall, wallPos))) {
    return false;
  }

  // Check if wall blocks all paths to goal
  const tempWalls = [...gameState.walls, wallPos];
  const tempGameState = { ...gameState, walls: tempWalls };

  // Ensure both players still have a path to their goal
  return hasPathToGoal(0, tempGameState) && hasPathToGoal(1, tempGameState);
}

/**
 * Makes a move for the current player
 */
export function makeMove(x, z, gameState) {
  if (gameState.winner !== null || gameState.wallMode) {
    return gameState;
  }

  // Check if the move is valid
  const validMoves = getValidMoves(gameState.currentPlayer, gameState);
  if (!validMoves.some((move) => move.x === x && move.z === z)) {
    return gameState;
  }

  // Update player position
  const newPlayers = [...gameState.players];
  newPlayers[gameState.currentPlayer] = {
    ...newPlayers[gameState.currentPlayer],
    x,
    z,
  };

  // Check win condition
  let winner = null;
  if (gameState.currentPlayer === 0 && z === BOARD_SIZE - 1) {
    winner = 0; // Player 1 wins
  } else if (gameState.currentPlayer === 1 && z === 0) {
    winner = 1; // Player 2 wins
  }

  // Switch to next player
  const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0;

  // Calculate valid moves for next player
  const nextValidMoves =
    winner === null
      ? getValidMoves(nextPlayer, { ...gameState, players: newPlayers })
      : [];

  return {
    ...gameState,
    players: newPlayers,
    currentPlayer: nextPlayer,
    validMoves: nextValidMoves,
    winner,
  };
}

/**
 * Places a wall for the current player
 */
export function placeWall(x, z, orientation, gameState) {
  if (gameState.winner !== null || !gameState.wallMode) {
    return gameState;
  }

  const wallPos = { x, z, orientation };

  // Check if wall placement is valid
  if (!isValidWallPlacement(wallPos, gameState)) {
    return gameState;
  }

  // Update walls and player's wall count
  const newWalls = [...gameState.walls, wallPos];
  const newPlayers = [...gameState.players];
  newPlayers[gameState.currentPlayer] = {
    ...newPlayers[gameState.currentPlayer],
    wallsLeft: newPlayers[gameState.currentPlayer].wallsLeft - 1,
  };

  // Switch to next player
  const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0;

  // Calculate valid moves for next player
  const nextGameState = {
    ...gameState,
    players: newPlayers,
    walls: newWalls,
  };

  const validMoves = getValidMoves(nextPlayer, nextGameState);

  return {
    ...nextGameState,
    currentPlayer: nextPlayer,
    validMoves,
  };
}

/**
 * Snaps a point to the nearest valid wall position
 * This function ensures walls are placed exactly between 2x2 blocks of squares
 */
export function snapToWallPosition(point) {
  // Adjust for the board offset (-4)
  const gridX = point.x + 4;
  const gridZ = point.z + 4;

  // Find the nearest grid intersection
  const nearestX = Math.round(gridX);
  const nearestZ = Math.round(gridZ);

  // Calculate distances to the nearest grid intersection
  const distX = Math.abs(gridX - nearestX);
  const distZ = Math.abs(gridZ - nearestZ);

  if (distX < distZ) {
    // Vertical wall (between columns)
    return {
      x: nearestX,
      z: Math.floor(gridZ),
      orientation: "vertical",
    };
  } else {
    // Horizontal wall (between rows)
    return {
      x: Math.floor(gridX),
      z: nearestZ,
      orientation: "horizontal",
    };
  }
}
