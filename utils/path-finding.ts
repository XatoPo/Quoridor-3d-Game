import type { GridPosition, WallPosition } from "./wall-placement"

// Interfaz para el nodo del grafo
interface Node extends GridPosition {
  distance: number
  parent: Node | null
}

// Función para obtener los movimientos válidos desde una posición
export function getValidMoves(position: GridPosition, walls: WallPosition[], boardSize: number): GridPosition[] {
  const moves: GridPosition[] = []
  const directions = [
    { x: 0, z: 1 }, // Arriba
    { x: 1, z: 0 }, // Derecha
    { x: 0, z: -1 }, // Abajo
    { x: -1, z: 0 }, // Izquierda
  ]

  for (const dir of directions) {
    const newPos = {
      x: position.x + dir.x,
      z: position.z + dir.z,
    }

    // Verificar límites del tablero
    if (newPos.x < 0 || newPos.x >= boardSize || newPos.z < 0 || newPos.z >= boardSize) {
      continue
    }

    // Verificar si hay un muro bloqueando el movimiento
    let blocked = false
    for (const wall of walls) {
      if (wall.orientation === "horizontal") {
        if (dir.z !== 0) {
          // Movimiento vertical
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
          // Movimiento horizontal
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

// Implementación del algoritmo BFS para encontrar camino a la meta
export function hasPathToGoal(
  start: GridPosition,
  isGoal: (pos: GridPosition) => boolean,
  walls: WallPosition[],
  boardSize: number,
): boolean {
  const queue: Node[] = [{ ...start, distance: 0, parent: null }]
  const visited = new Set<string>()
  visited.add(`${start.x},${start.z}`)

  while (queue.length > 0) {
    const current = queue.shift()!

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

// Función para verificar si un muro bloquea completamente el camino de algún jugador
export function validateWallPlacement(
  wallPos: WallPosition,
  players: GridPosition[],
  existingWalls: WallPosition[],
  boardSize: number,
): boolean {
  const tempWalls = [...existingWalls, wallPos]

  // Verificar camino para el jugador 1 (meta en z = 8)
  const player1HasPath = hasPathToGoal(players[0], (pos) => pos.z === boardSize - 1, tempWalls, boardSize)

  if (!player1HasPath) return false

  // Verificar camino para el jugador 2 (meta en z = 0)
  const player2HasPath = hasPathToGoal(players[1], (pos) => pos.z === 0, tempWalls, boardSize)

  return player2HasPath
}

