// Function to get valid moves from a position
export function getValidMoves(position, walls, boardSize) {
  const moves = []
  const directions = [
    { x: 0, z: 1 }, // Up
    { x: 1, z: 0 }, // Right
    { x: 0, z: -1 }, // Down
    { x: -1, z: 0 }, // Left
  ]

  for (const dir of directions) {
    const newPos = {
      x: position.x + dir.x,
      z: position.z + dir.z,
    }

    // Check board boundaries
    if (newPos.x < 0 || newPos.x >= boardSize || newPos.z < 0 || newPos.z >= boardSize) {
      continue
    }

    // Check if there is a wall blocking the movement
    let blocked = false
    for (const wall of walls) {
      if (wall.orientation === "horizontal") {
        if (dir.z !== 0) {
          // Vertical movement
          if (
            (position.x === wall.x || position.x === wall.x + 1) &&
            ((position.z === wall.z && newPos.z === wall.z - 1) || (position.z === wall.z - 1 && newPos.z === wall.z))
          ) {
            blocked = true
            break
          }
        }
      } else {
        // wall.orientation === "vertical"
        if (dir.x !== 0) {
          // Horizontal movement
          if (
            (position.z === wall.z || position.z === wall.z + 1) &&
            ((position.x === wall.x && newPos.x === wall.x - 1) || (position.x === wall.x - 1 && newPos.x === wall.x))
          ) {
            blocked = true
            break
          }
        }
      }
    }

    if (!blocked) {
      moves.push(newPos)
    }
  }

  return moves
}

// BFS algorithm implementation to find path to goal
export function hasPathToGoal(start, isGoal, walls, boardSize) {
  const queue = [{ ...start, distance: 0, parent: null }]
  const visited = new Set()
  visited.add(`${start.x},${start.z}`)

  while (queue.length > 0) {
    const current = queue.shift()

    if (isGoal(current)) {
      return true
    }

    const moves = getValidMoves(current, walls, boardSize)
    for (const move of moves) {
      const key = `${move.x},${move.z}`
      if (!visited.has(key)) {
        visited.add(key)
        queue.push({
          ...move,
          distance: current.distance + 1,
          parent: current,
        })
      }
    }
  }

  return false
}

// Function to validate if a wall placement blocks any player's path
export function validateWallPlacement(wallPos, players, existingWalls, boardSize) {
  const tempWalls = [...existingWalls, wallPos]

  // Check path for player 1 (goal at z = 8)
  const player1HasPath = hasPathToGoal(players[0], (pos) => pos.z === boardSize - 1, tempWalls, boardSize)

  if (!player1HasPath) return false

  // Check path for player 2 (goal at z = 0)
  const player2HasPath = hasPathToGoal(players[1], (pos) => pos.z === 0, tempWalls, boardSize)

  return player2HasPath
}

