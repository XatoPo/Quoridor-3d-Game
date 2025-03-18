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
 * Updated to prevent mid-wall intersections while allowing end connections
 */
export function doWallsOverlap(wall1, wall2) {
  // Same orientation walls
  if (wall1.orientation === wall2.orientation) {
    if (wall1.orientation === "horizontal") {
      // Horizontal walls - check if they're on the same row and overlapping
      return wall1.z === wall2.z && Math.abs(wall1.x - wall2.x) < 1
    } else {
      // Vertical walls - check if they're on the same column and overlapping
      return wall1.x === wall2.x && Math.abs(wall1.z - wall2.z) < 1
    }
  }

  // Different orientations - check for valid connections and invalid intersections
  const horizontal = wall1.orientation === "horizontal" ? wall1 : wall2
  const vertical = wall1.orientation === "horizontal" ? wall2 : wall1

  // Check if walls intersect in their middle sections
  const intersectsMidSection =
    vertical.x > horizontal.x &&
    vertical.x < horizontal.x + 1 &&
    horizontal.z > vertical.z &&
    horizontal.z < vertical.z + 1

  // Check if walls connect at their endpoints (valid T-connections)
  const isValidTConnection =
    // Vertical wall's top end connects to horizontal wall
    (vertical.z + 1 === horizontal.z && vertical.x === horizontal.x) ||
    (vertical.z + 1 === horizontal.z && vertical.x === horizontal.x + 1) ||
    // Vertical wall's bottom end connects to horizontal wall
    (vertical.z === horizontal.z && vertical.x === horizontal.x) ||
    (vertical.z === horizontal.z && vertical.x === horizontal.x + 1) ||
    // Horizontal wall's left end connects to vertical wall
    (horizontal.x === vertical.x && horizontal.z === vertical.z) ||
    (horizontal.x === vertical.x && horizontal.z === vertical.z + 1) ||
    // Horizontal wall's right end connects to vertical wall
    (horizontal.x + 1 === vertical.x && horizontal.z === vertical.z) ||
    (horizontal.x + 1 === vertical.x && horizontal.z === vertical.z + 1)

  // Return true if walls intersect in their middle (invalid)
  // Return false if they have a valid T-connection or don't interact at all
  return intersectsMidSection && !isValidTConnection
}

/**
 * Checks if a wall blocks the movement between two adjacent cells
 * Updated to align logical blocking with visual position
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
    const isBlocked = walls.some((wall) => {
      const blocks = wall.orientation === "vertical" && wall.x === minX && wall.z <= fromZ && wall.z + 1 >= fromZ
      if (blocks) {
      }
      return blocks
    })
    return isBlocked
  }
  // Moving vertically
  else if (fromX === toX) {
    const minZ = Math.min(fromZ, toZ)
    // Check for horizontal walls between these cells
    const isBlocked = walls.some((wall) => {
      const blocks = wall.orientation === "horizontal" && wall.z === minZ && wall.x <= fromX && wall.x + 1 >= fromX
      if (blocks) {
      }
      return blocks
    })
    return isBlocked
  }

  console.groupEnd()
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
    // First check if there's a wall between the player and opponent
    if (!isMovementBlocked(player.x, player.z, opponent.x, opponent.z, walls)) {
      // Calculate straight jump position
      const jumpX = opponent.x + (opponent.x - player.x)
      const jumpZ = opponent.z + (opponent.z - player.z)

      // Check if straight jump is possible
      if (isWithinBoard(jumpX, jumpZ) && !isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
        validMoves.push({ x: jumpX, z: jumpZ })
      } else if (isWithinBoard(jumpX, jumpZ)) {
        // If straight jump is blocked by a wall or out of bounds, check diagonal jumps
        const diagonalJumps = []

        // Add all possible diagonal jumps
        if (player.x === opponent.x) {
          // Vertical alignment - check horizontal diagonals
          diagonalJumps.push({ x: opponent.x + 1, z: opponent.z })
          diagonalJumps.push({ x: opponent.x - 1, z: opponent.z })
        } else {
          // Horizontal alignment - check vertical diagonals
          diagonalJumps.push({ x: opponent.x, z: opponent.z + 1 })
          diagonalJumps.push({ x: opponent.x, z: opponent.z - 1 })
        }

        // Filter valid diagonal jumps
        const validDiagonalJumps = diagonalJumps.filter((jump) => {
          return (
            isWithinBoard(jump.x, jump.z) &&
            !isMovementBlocked(opponent.x, opponent.z, jump.x, jump.z, walls) &&
            !(jump.x === player.x && jump.z === player.z)
          )
        })

        validMoves.push(...validDiagonalJumps)
      }
    }
  }

  return validMoves
}

// Mejorar la función hasPathToGoal para ser más robusta
export function hasPathToGoal(playerIndex, gameState) {
  const player = gameState.players[playerIndex]
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0]
  const { walls } = gameState

  // Define the goal row based on player index
  const goalZ = playerIndex === 0 ? BOARD_SIZE - 1 : 0

  // Create a queue for BFS with position and path
  const queue = [
    {
      x: player.x,
      z: player.z,
      path: [],
    },
  ]

  // Create a set to track visited positions
  const visited = new Set()
  visited.add(`${player.x},${player.z}`)

  // Limitar la búsqueda para evitar bucles infinitos
  let iterations = 0
  const MAX_ITERATIONS = 1000

  // BFS algorithm
  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++
    const current = queue.shift()

    // Check if we've reached the goal row
    if (current.z === goalZ) {
      return true
    }

    // Get all possible moves including jumps
    const moves = getAllPossibleMoves(current.x, current.z, opponent, walls)

    for (const move of moves) {
      const moveKey = `${move.x},${move.z}`
      if (!visited.has(moveKey)) {
        visited.add(moveKey)
        queue.push({
          x: move.x,
          z: move.z,
          path: [...current.path, { x: move.x, z: move.z }],
        })
      }
    }
  }

  // Si alcanzamos el límite de iteraciones, consideramos que no hay camino
  if (iterations >= MAX_ITERATIONS) {
    console.warn("Límite de iteraciones alcanzado en hasPathToGoal")
    return false
  }

  return false
}

/**
 * Gets all possible moves from a position, including jumps
 * New helper function to consider all movement possibilities
 */
function getAllPossibleMoves(x, z, opponent, walls) {
  const moves = []

  // Basic orthogonal moves
  const basicMoves = [
    { x: x + 1, z }, // Right
    { x: x - 1, z }, // Left
    { x, z: z + 1 }, // Down
    { x, z: z - 1 }, // Up
  ]

  // Check each basic move
  for (const move of basicMoves) {
    if (isValidMove(move.x, move.z, x, z, opponent, walls)) {
      moves.push(move)
    }
  }

  // Check for jump moves if adjacent to opponent
  if (Math.abs(x - opponent.x) + Math.abs(z - opponent.z) === 1) {
    // Only check jumps if there's no wall between the player and opponent
    if (!isMovementBlocked(x, z, opponent.x, opponent.z, walls)) {
      // Straight jump
      const jumpX = opponent.x + (opponent.x - x)
      const jumpZ = opponent.z + (opponent.z - z)

      if (isWithinBoard(jumpX, jumpZ)) {
        if (!isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
          moves.push({ x: jumpX, z: jumpZ })
        } else {
          // Diagonal jumps when straight jump is blocked
          const diagonalJumps = []

          // Add appropriate diagonal jumps based on alignment
          if (x === opponent.x) {
            // Vertical alignment - check horizontal diagonals
            diagonalJumps.push({ x: opponent.x + 1, z: opponent.z })
            diagonalJumps.push({ x: opponent.x - 1, z: opponent.z })
          } else {
            // Horizontal alignment - check vertical diagonals
            diagonalJumps.push({ x: opponent.x, z: opponent.z + 1 })
            diagonalJumps.push({ x: opponent.x, z: opponent.z - 1 })
          }

          // Filter valid diagonal jumps
          for (const jump of diagonalJumps) {
            if (
              isWithinBoard(jump.x, jump.z) &&
              !isMovementBlocked(opponent.x, opponent.z, jump.x, jump.z, walls) &&
              !(jump.x === x && jump.z === z)
            ) {
              moves.push(jump)
            }
          }
        }
      }
    }
  }

  return moves
}

/**
 * Checks if a move is valid
 * New helper function to validate individual moves
 */
function isValidMove(toX, toZ, fromX, fromZ, opponent, walls) {
  // Check board boundaries
  if (!isWithinBoard(toX, toZ)) {
    return false
  }

  // Check if move is blocked by wall
  if (isMovementBlocked(fromX, fromZ, toX, toZ, walls)) {
    return false
  }

  // Check if destination is occupied by opponent
  if (toX === opponent.x && toZ === opponent.z) {
    return false
  }

  return true
}

// Mejorar la función isValidWallPlacement para ser más robusta
export function isValidWallPlacement(wallPos, gameState) {
  try {
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

    // Check paths for both players
    const player1HasPath = hasPathToGoal(0, tempGameState)
    const player2HasPath = hasPathToGoal(1, tempGameState)

    return player1HasPath && player2HasPath
  } catch (error) {
    console.error("Error en isValidWallPlacement:", error)
    return false
  }
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
    // Mantener el wallMode como estaba
    wallMode: gameState.wallMode,
  }
}

/**
 * Places a wall for the current player
 */
export function placeWall(x, z, orientation, gameState) {
  if (gameState.winner !== null || !gameState.wallMode) {
    return gameState
  }

  const wallPos = { x, z, orientation }

  // Validate wall placement
  const isValid = isValidWallPlacement(wallPos, gameState)

  if (!isValid) {
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
    validMoves: getValidMoves(nextPlayer, {
      ...gameState,
      walls: newWalls,
      players: newPlayers,
    }),
    // Mantener el wallMode como estaba
    wallMode: gameState.wallMode,
  }

  return nextGameState
}

/**
 * Snaps a point to the nearest valid wall position
 * Updated to align with visual positions
 */
export function snapToWallPosition(point) {
  // Convert from Three.js coordinates to grid coordinates
  const gridX = point.x + 4
  const gridZ = point.z + 4

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
      x: snapX - 1,
      z: Math.floor(gridZ),
      orientation: "vertical",
    }
  } else {
    // Horizontal wall
    wallPos = {
      x: Math.floor(gridX),
      z: snapZ - 1,
      orientation: "horizontal",
    }
  }

  return wallPos
}

// Eliminar las funciones de debug que no son necesarias
function debugBoard(gameState, message = "") {
  // Esta función se mantiene vacía para evitar errores si es llamada
}

function debugWallPlacement(wallPos, isValid, gameState) {
  // Esta función se mantiene vacía para evitar errores si es llamada
}
