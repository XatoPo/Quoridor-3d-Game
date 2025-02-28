// Constants
const BOARD_SIZE = 9
const WALL_GRID_SIZE = 8 // One less than board size for wall placement

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
  }
}

/**
 * Checks if a position is within the board boundaries
 */
export function isWithinBoard(x, z) {
  return x >= 0 && x < BOARD_SIZE && z >= 0 && z < BOARD_SIZE
}

/**
 * Checks if a wall position is within valid board boundaries
 * Updated to handle edge cases and prevent out-of-bounds walls
 */
export function isWallWithinBoard(wall) {
  const isValid =
    wall.orientation === "horizontal"
      ? wall.x >= 0 && wall.x < WALL_GRID_SIZE && wall.z >= 0 && wall.z < WALL_GRID_SIZE
      : wall.x >= 0 && wall.x < WALL_GRID_SIZE && wall.z >= 0 && wall.z < WALL_GRID_SIZE

  console.group("Wall Boundary Check")
  console.log("Checking wall:", wall)
  console.log("Is within board:", isValid)
  console.log("Board limits:", {
    horizontal: { x: [0, WALL_GRID_SIZE - 1], z: [0, WALL_GRID_SIZE - 1] },
    vertical: { x: [0, WALL_GRID_SIZE - 1], z: [0, WALL_GRID_SIZE - 1] },
  })
  console.groupEnd()

  return isValid
}

/**
 * Checks if two walls overlap or intersect
 * Updated to handle diagonal walls and T-shaped intersections
 */
export function doWallsOverlap(wall1, wall2) {
  // Same orientation walls
  if (wall1.orientation === wall2.orientation) {
    if (wall1.orientation === "horizontal") {
      // Horizontal walls - check if they're on the same row and touching/overlapping
      return wall1.z === wall2.z && Math.abs(wall1.x - wall2.x) <= 1
    } else {
      // Vertical walls - check if they're on the same column and touching/overlapping
      return wall1.x === wall2.x && Math.abs(wall1.z - wall2.z) <= 1
    }
  }

  // Different orientations - check for T-shaped and diagonal intersections
  const wall1Start = { x: wall1.x, z: wall1.z }
  const wall1End = {
    x: wall1.x + (wall1.orientation === "horizontal" ? 1 : 0),
    z: wall1.z + (wall1.orientation === "vertical" ? 1 : 0),
  }
  const wall2Start = { x: wall2.x, z: wall2.z }
  const wall2End = {
    x: wall2.x + (wall2.orientation === "horizontal" ? 1 : 0),
    z: wall2.z + (wall2.orientation === "vertical" ? 1 : 0),
  }

  // Check if walls intersect
  return (
    Math.min(wall1Start.x, wall1End.x) <= Math.max(wall2Start.x, wall2End.x) &&
    Math.max(wall1Start.x, wall1End.x) >= Math.min(wall2Start.x, wall2End.x) &&
    Math.min(wall1Start.z, wall1End.z) <= Math.max(wall2Start.z, wall2End.z) &&
    Math.max(wall1Start.z, wall1End.z) >= Math.min(wall2Start.z, wall2End.z)
  )
}

/**
 * Checks if a wall blocks the movement between two adjacent cells
 * Updated to handle diagonal walls
 */
export function isMovementBlocked(fromX, fromZ, toX, toZ, walls) {
  // Only check adjacent cells (one step in any direction)
  if (Math.abs(fromX - toX) + Math.abs(fromZ - toZ) !== 1) {
    return false
  }

  // Moving horizontally
  if (fromZ === toZ) {
    const minX = Math.min(fromX, toX)
    // Check for vertical walls between these cells
    return walls.some(
      (wall) => wall.orientation === "vertical" && wall.x === minX + 1 && wall.z <= fromZ && wall.z + 1 >= fromZ,
    )
  }
  // Moving vertically
  else if (fromX === toX) {
    const minZ = Math.min(fromZ, toZ)
    // Check for horizontal walls between these cells
    return walls.some(
      (wall) => wall.orientation === "horizontal" && wall.z === minZ + 1 && wall.x <= fromX && wall.x + 1 >= fromX,
    )
  }

  return false
}

/**
 * Gets all valid moves for a player, including jumps over opponents
 * Updated to handle wall-blocked movements more accurately
 */
export function getValidMoves(playerIndex, gameState) {
  const player = gameState.players[playerIndex]
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0]
  const { walls } = gameState

  // Basic orthogonal moves
  const potentialMoves = [
    { x: player.x + 1, z: player.z }, // Right
    { x: player.x - 1, z: player.z }, // Left
    { x: player.x, z: player.z + 1 }, // Down
    { x: player.x, z: player.z - 1 }, // Up
  ]

  // Filter moves that are within the board and not blocked by walls
  const validMoves = potentialMoves.filter((move) => {
    // Check if move is within board boundaries
    if (!isWithinBoard(move.x, move.z)) {
      return false
    }

    // Check if move is blocked by a wall
    if (isMovementBlocked(player.x, player.z, move.x, move.z, walls)) {
      return false
    }

    // Check if move is occupied by opponent
    if (move.x === opponent.x && move.z === opponent.z) {
      return false
    }

    return true
  })

  // Handle jumps over opponent
  if (Math.abs(player.x - opponent.x) + Math.abs(player.z - opponent.z) === 1) {
    // Opponent is adjacent, check if we can jump
    const jumpX = opponent.x + (opponent.x - player.x)
    const jumpZ = opponent.z + (opponent.z - player.z)

    // Check if jump destination is within board
    if (isWithinBoard(jumpX, jumpZ)) {
      // Check if there's no wall blocking the jump
      if (!isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
        // Add the jump move
        validMoves.push({ x: jumpX, z: jumpZ })
      } else {
        // If straight jump is blocked, check for diagonal jumps
        const diagonalJumps = [
          { x: opponent.x + 1, z: opponent.z },
          { x: opponent.x - 1, z: opponent.z },
          { x: opponent.x, z: opponent.z + 1 },
          { x: opponent.x, z: opponent.z - 1 },
        ].filter((jump) => {
          return (
            isWithinBoard(jump.x, jump.z) &&
            !isMovementBlocked(opponent.x, opponent.z, jump.x, jump.z, walls) &&
            !isMovementBlocked(player.x, player.z, opponent.x, opponent.z, walls) &&
            !(jump.x === player.x && jump.z === player.z)
          )
        })

        validMoves.push(...diagonalJumps)
      }
    }
  }

  return validMoves
}

/**
 * Checks if a player has a path to their goal using BFS
 */
export function hasPathToGoal(playerIndex, gameState) {
  const player = gameState.players[playerIndex]
  const { walls } = gameState

  // Define the goal row based on player index
  const goalZ = playerIndex === 0 ? BOARD_SIZE - 1 : 0

  // Create a queue for BFS
  const queue = [{ x: player.x, z: player.z }]

  // Create a set to track visited positions
  const visited = new Set()
  visited.add(`${player.x},${player.z}`)

  // BFS algorithm
  while (queue.length > 0) {
    const current = queue.shift()

    // Check if we've reached the goal row
    if (current.z === goalZ) {
      return true
    }

    // Check all four possible moves
    const moves = [
      { x: current.x + 1, z: current.z }, // Right
      { x: current.x - 1, z: current.z }, // Left
      { x: current.x, z: current.z + 1 }, // Down
      { x: current.x, z: current.z - 1 }, // Up
    ]

    for (const move of moves) {
      // Skip if out of bounds
      if (!isWithinBoard(move.x, move.z)) {
        continue
      }

      // Skip if already visited
      const moveKey = `${move.x},${move.z}`
      if (visited.has(moveKey)) {
        continue
      }

      // Check if move is blocked by a wall
      if (isMovementBlocked(current.x, current.z, move.x, move.z, walls)) {
        continue
      }

      visited.add(moveKey)
      queue.push(move)
    }
  }

  // If we've exhausted all possibilities without reaching the goal
  return false
}

/**
 * Validates if a wall placement follows all game rules
 * Updated to prevent trapping players and handle diagonal walls
 */
export function isValidWallPlacement(wallPos, gameState) {
  // Check if wall is within board boundaries
  if (!isWallWithinBoard(wallPos)) {
    return false
  }

  // Check wall count
  if (gameState.players[gameState.currentPlayer].wallsLeft <= 0) {
    return false
  }

  // Check overlap with existing walls
  if (gameState.walls.some((wall) => doWallsOverlap(wall, wallPos))) {
    return false
  }

  // Create a temporary game state with the new wall
  const tempWalls = [...gameState.walls, wallPos]
  const tempGameState = { ...gameState, walls: tempWalls }

  // Check if both players still have a path to their goal
  const player1HasPath = hasPathToGoal(0, tempGameState)
  const player2HasPath = hasPathToGoal(1, tempGameState)

  // Wall placement is only valid if both players still have a path
  return player1HasPath && player2HasPath
}

/**
 * Makes a move for the current player
 */
export function makeMove(x, z, gameState) {
  if (gameState.winner !== null || gameState.wallMode) {
    return gameState
  }

  // Check if the move is valid
  const validMoves = getValidMoves(gameState.currentPlayer, gameState)
  if (!validMoves.some((move) => move.x === x && move.z === z)) {
    return gameState
  }

  // Update player position
  const newPlayers = [...gameState.players]
  newPlayers[gameState.currentPlayer] = {
    ...newPlayers[gameState.currentPlayer],
    x,
    z,
  }

  // Check win condition
  let winner = null
  if (gameState.currentPlayer === 0 && z === BOARD_SIZE - 1) {
    winner = 0 // Player 1 wins
  } else if (gameState.currentPlayer === 1 && z === 0) {
    winner = 1 // Player 2 wins
  }

  // Switch to next player
  const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0

  // Calculate valid moves for next player
  const nextValidMoves = winner === null ? getValidMoves(nextPlayer, { ...gameState, players: newPlayers }) : []

  return {
    ...gameState,
    players: newPlayers,
    currentPlayer: nextPlayer,
    validMoves: nextValidMoves,
    winner,
  }
}

/**
 * Places a wall for the current player
 */
export function placeWall(x, z, orientation, gameState) {
  console.group("Wall Placement")
  console.log("Attempting to place wall:", { x, z, orientation })

  if (gameState.winner !== null || !gameState.wallMode) {
    console.log("Cannot place wall: game over or not in wall mode")
    console.groupEnd()
    return gameState
  }

  const wallPos = { x, z, orientation }

  // Validate wall placement
  const isValid = isValidWallPlacement(wallPos, gameState)
  debugWallPlacement(wallPos, isValid, gameState)

  if (!isValid) {
    console.log("Invalid wall placement")
    console.groupEnd()
    return gameState
  }

  // Update game state
  const newWalls = [...gameState.walls, wallPos]
  const newPlayers = [...gameState.players]
  newPlayers[gameState.currentPlayer] = {
    ...newPlayers[gameState.currentPlayer],
    wallsLeft: newPlayers[gameState.currentPlayer].wallsLeft - 1,
  }

  const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0
  const nextGameState = {
    ...gameState,
    players: newPlayers,
    walls: newWalls,
    currentPlayer: nextPlayer,
    validMoves: getValidMoves(nextPlayer, { ...gameState, walls: newWalls, players: newPlayers }),
  }

  debugBoard(nextGameState, "After wall placement")
  console.groupEnd()
  return nextGameState
}

/**
 * Snaps a point to the nearest valid wall position
 */
export function snapToWallPosition(point) {
  // Convert from Three.js coordinates to grid coordinates
  const gridX = point.x + 4
  const gridZ = point.z + 4

  console.group("Wall Snap Debug")
  console.log("Original point:", { x: point.x, z: point.z })
  console.log("Grid coordinates:", { x: gridX, z: gridZ })

  // Find the nearest wall position
  const snapX = Math.round(gridX)
  const snapZ = Math.round(gridZ)

  // Determine if we're closer to a vertical or horizontal wall position
  const fracX = Math.abs(gridX - snapX)
  const fracZ = Math.abs(gridZ - snapZ)

  let wallPos
  if (fracX < fracZ) {
    // Vertical wall
    wallPos = {
      x: snapX,
      z: Math.floor(gridZ),
      orientation: "vertical",
    }
  } else {
    // Horizontal wall
    wallPos = {
      x: Math.floor(gridX),
      z: snapZ,
      orientation: "horizontal",
    }
  }

  console.log("Snapped wall position:", wallPos)
  console.log("Wall orientation:", wallPos.orientation)
  console.groupEnd()

  return wallPos
}

/**
 * Debug helper to visualize the board state
 */
function debugBoard(gameState, message = "") {
  console.group(`Board State: ${message}`)

  // Create visual representation of the board
  const boardVisual = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill("·"))

  // Add players
  gameState.players.forEach((player, idx) => {
    boardVisual[player.z][player.x] = idx === 0 ? "R" : "B"
  })

  // Add walls
  gameState.walls.forEach((wall) => {
    if (wall.orientation === "horizontal") {
      if (wall.x >= 0 && wall.x < BOARD_SIZE - 1 && wall.z >= 0 && wall.z < BOARD_SIZE) {
        boardVisual[wall.z][wall.x] = "="
        boardVisual[wall.z][wall.x + 1] = "="
      }
    } else {
      if (wall.x >= 0 && wall.x < BOARD_SIZE && wall.z >= 0 && wall.z < BOARD_SIZE - 1) {
        boardVisual[wall.z][wall.x] = "‖"
        boardVisual[wall.z + 1][wall.x] = "‖"
      }
    }
  })

  // Print board
  console.log("  0 1 2 3 4 5 6 7 8")
  boardVisual.forEach((row, idx) => {
    console.log(`${idx} ${row.join(" ")}`)
  })

  console.log("\nGame State Details:")
  console.log("Current Player:", gameState.currentPlayer)
  console.log("Wall Mode:", gameState.wallMode)
  console.log("Player 1 Walls:", gameState.players[0].wallsLeft)
  console.log("Player 2 Walls:", gameState.players[1].wallsLeft)
  console.log("Valid Moves:", gameState.validMoves)
  console.log("Walls:", gameState.walls)

  console.groupEnd()
}

/**
 * Debug helper for wall placement
 */
function debugWallPlacement(wallPos, isValid, gameState) {
  console.group("Wall Placement Debug")
  console.log("Attempting to place wall at:", {
    x: wallPos.x,
    z: wallPos.z,
    orientation: wallPos.orientation,
  })
  console.log("Wall position is valid:", isValid)

  if (!isValid) {
    console.log("Validation failures:")
    if (!isWallWithinBoard(wallPos)) {
      console.log("- Wall is outside board boundaries")
    }
    if (gameState.walls.some((wall) => doWallsOverlap(wall, wallPos))) {
      console.log("- Wall overlaps with existing wall")
    }
    const tempGameState = { ...gameState, walls: [...gameState.walls, wallPos] }
    if (!hasPathToGoal(0, tempGameState)) {
      console.log("- Blocks Player 1's path to goal")
    }
    if (!hasPathToGoal(1, tempGameState)) {
      console.log("- Blocks Player 2's path to goal")
    }
  }

  console.groupEnd()
}
