/**
 * Quoridor Game Logic
 *
 * Este módulo contiene toda la lógica del juego Quoridor, incluyendo:
 * - Gestión del estado del juego
 * - Validación de movimientos
 * - Colocación de muros
 * - Verificación de caminos
 * - Detección de victoria
 */

// Constantes del juego
const BOARD_SIZE = 9
const WALL_GRID_SIZE = 8 // Una unidad menos que el tamaño del tablero para la colocación de muros
const INITIAL_WALLS_PER_PLAYER = 10
const MAX_PATH_ITERATIONS = 1000 // Límite para evitar bucles infinitos en la búsqueda de caminos

/**
 * Crea el estado inicial del juego
 * @returns {Object} Estado inicial del juego
 */
export function createInitialGameState() {
  return {
    players: [
      { x: 4, z: 0, wallsLeft: INITIAL_WALLS_PER_PLAYER }, // Jugador 1 (rojo)
      { x: 4, z: 8, wallsLeft: INITIAL_WALLS_PER_PLAYER }, // Jugador 2 (azul)
    ],
    currentPlayer: 0,
    walls: [],
    wallMode: false,
    validMoves: [],
    winner: null,
  }
}

/**
 * Verifica si una posición está dentro de los límites del tablero
 * @param {number} x - Coordenada X
 * @param {number} z - Coordenada Z
 * @returns {boolean} Verdadero si la posición está dentro del tablero
 */
export function isWithinBoard(x, z) {
  return x >= 0 && x < BOARD_SIZE && z >= 0 && z < BOARD_SIZE
}

/**
 * Verifica si una posición de muro está dentro de los límites válidos del tablero
 * @param {Object} wall - Objeto que representa un muro
 * @returns {boolean} Verdadero si el muro está dentro de los límites
 */
export function isWallWithinBoard(wall) {
  // Tanto para muros horizontales como verticales, las coordenadas deben estar dentro del grid de muros
  const isValid = wall.x >= 0 && wall.x < WALL_GRID_SIZE && wall.z >= 0 && wall.z < WALL_GRID_SIZE

  // Registro para depuración
  if (process.env.NODE_ENV === "development") {
    console.group("Verificación de límites del muro")
    console.log("Muro:", wall)
    console.log("Está dentro del tablero:", isValid)
    console.log("Límites del tablero:", {
      x: [0, WALL_GRID_SIZE - 1],
      z: [0, WALL_GRID_SIZE - 1],
    })
    console.groupEnd()
  }

  return isValid
}

/**
 * Verifica si dos muros se superponen o intersectan
 * @param {Object} wall1 - Primer muro
 * @param {Object} wall2 - Segundo muro
 * @returns {boolean} Verdadero si los muros se superponen o intersectan de manera inválida
 */
export function doWallsOverlap(wall1, wall2) {
  // Muros con la misma orientación
  if (wall1.orientation === wall2.orientation) {
    if (wall1.orientation === "horizontal") {
      // Muros horizontales - verificar si están en la misma fila y se superponen
      return wall1.z === wall2.z && Math.abs(wall1.x - wall2.x) < 1
    } else {
      // Muros verticales - verificar si están en la misma columna y se superponen
      return wall1.x === wall2.x && Math.abs(wall1.z - wall2.z) < 1
    }
  }

  // Muros con orientaciones diferentes - verificar conexiones válidas e intersecciones inválidas
  const horizontal = wall1.orientation === "horizontal" ? wall1 : wall2
  const vertical = wall1.orientation === "horizontal" ? wall2 : wall1

  // Verificar si los muros se intersectan en sus secciones medias
  const intersectsMidSection =
    vertical.x > horizontal.x &&
    vertical.x < horizontal.x + 1 &&
    horizontal.z > vertical.z &&
    horizontal.z < vertical.z + 1

  // Verificar si los muros se conectan en sus extremos (conexiones en T válidas)
  const isValidTConnection =
    // El extremo superior del muro vertical se conecta con el muro horizontal
    (vertical.z + 1 === horizontal.z && vertical.x === horizontal.x) ||
    (vertical.z + 1 === horizontal.z && vertical.x === horizontal.x + 1) ||
    // El extremo inferior del muro vertical se conecta con el muro horizontal
    (vertical.z === horizontal.z && vertical.x === horizontal.x) ||
    (vertical.z === horizontal.z && vertical.x === horizontal.x + 1) ||
    // El extremo izquierdo del muro horizontal se conecta con el muro vertical
    (horizontal.x === vertical.x && horizontal.z === vertical.z) ||
    (horizontal.x === vertical.x && horizontal.z === vertical.z + 1) ||
    // El extremo derecho del muro horizontal se conecta con el muro vertical
    (horizontal.x + 1 === vertical.x && horizontal.z === vertical.z) ||
    (horizontal.x + 1 === vertical.x && horizontal.z === vertical.z + 1)

  // Retornar verdadero si los muros se intersectan en su parte media (inválido)
  // Retornar falso si tienen una conexión en T válida o no interactúan en absoluto
  return intersectsMidSection && !isValidTConnection
}

/**
 * Verifica si un muro bloquea el movimiento entre dos celdas adyacentes
 * @param {number} fromX - Coordenada X de origen
 * @param {number} fromZ - Coordenada Z de origen
 * @param {number} toX - Coordenada X de destino
 * @param {number} toZ - Coordenada Z de destino
 * @param {Array} walls - Array de muros en el tablero
 * @returns {boolean} Verdadero si el movimiento está bloqueado por un muro
 */
export function isMovementBlocked(fromX, fromZ, toX, toZ, walls) {
  // Solo verificar celdas adyacentes (un paso en cualquier dirección)
  if (Math.abs(fromX - toX) + Math.abs(fromZ - toZ) !== 1) {
    return false
  }

  // Movimiento horizontal
  if (fromZ === toZ) {
    const minX = Math.min(fromX, toX)
    // Verificar muros verticales entre estas celdas
    return walls.some(
      (wall) => wall.orientation === "vertical" && wall.x === minX && wall.z <= fromZ && wall.z + 1 >= fromZ,
    )
  }
  // Movimiento vertical
  else if (fromX === toX) {
    const minZ = Math.min(fromZ, toZ)
    // Verificar muros horizontales entre estas celdas
    return walls.some(
      (wall) => wall.orientation === "horizontal" && wall.z === minZ && wall.x <= fromX && wall.x + 1 >= fromX,
    )
  }

  return false
}

/**
 * Obtiene todos los movimientos válidos para un jugador, incluyendo saltos sobre oponentes
 * @param {number} playerIndex - Índice del jugador (0 o 1)
 * @param {Object} gameState - Estado actual del juego
 * @returns {Array} Array de movimientos válidos
 */
export function getValidMoves(playerIndex, gameState) {
  const player = gameState.players[playerIndex]
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0]
  const { walls } = gameState

  // Movimientos ortogonales básicos
  const potentialMoves = [
    { x: player.x + 1, z: player.z }, // Derecha
    { x: player.x - 1, z: player.z }, // Izquierda
    { x: player.x, z: player.z + 1 }, // Abajo
    { x: player.x, z: player.z - 1 }, // Arriba
  ]

  // Filtrar movimientos que están dentro del tablero y no están bloqueados por muros
  const validMoves = potentialMoves.filter((move) => {
    // Verificar si el movimiento está dentro de los límites del tablero
    if (!isWithinBoard(move.x, move.z)) {
      return false
    }

    // Verificar si el movimiento está bloqueado por un muro
    if (isMovementBlocked(player.x, player.z, move.x, move.z, walls)) {
      return false
    }

    // Verificar si el movimiento está ocupado por el oponente
    if (move.x === opponent.x && move.z === opponent.z) {
      return false
    }

    return true
  })

  // Manejar saltos sobre el oponente
  if (Math.abs(player.x - opponent.x) + Math.abs(player.z - opponent.z) === 1) {
    // Primero verificar si no hay un muro entre el jugador y el oponente
    if (!isMovementBlocked(player.x, player.z, opponent.x, opponent.z, walls)) {
      // Calcular posición de salto directo
      const jumpX = opponent.x + (opponent.x - player.x)
      const jumpZ = opponent.z + (opponent.z - player.z)

      // Verificar si el salto directo es posible
      if (isWithinBoard(jumpX, jumpZ) && !isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
        validMoves.push({ x: jumpX, z: jumpZ })
      } else if (isWithinBoard(jumpX, jumpZ)) {
        // Si el salto directo está bloqueado por un muro o fuera de los límites, verificar saltos diagonales
        const diagonalJumps = []

        // Añadir todos los posibles saltos diagonales
        if (player.x === opponent.x) {
          // Alineación vertical - verificar diagonales horizontales
          diagonalJumps.push({ x: opponent.x + 1, z: opponent.z })
          diagonalJumps.push({ x: opponent.x - 1, z: opponent.z })
        } else {
          // Alineación horizontal - verificar diagonales verticales
          diagonalJumps.push({ x: opponent.x, z: opponent.z + 1 })
          diagonalJumps.push({ x: opponent.x, z: opponent.z - 1 })
        }

        // Filtrar saltos diagonales válidos
        const validDiagonalJumps = diagonalJumps.filter(
          (jump) =>
            isWithinBoard(jump.x, jump.z) &&
            !isMovementBlocked(opponent.x, opponent.z, jump.x, jump.z, walls) &&
            !(jump.x === player.x && jump.z === player.z),
        )

        validMoves.push(...validDiagonalJumps)
      }
    }
  }

  return validMoves
}

/**
 * Verifica si hay un camino hacia la meta para un jugador
 * @param {number} playerIndex - Índice del jugador (0 o 1)
 * @param {Object} gameState - Estado actual del juego
 * @returns {boolean} Verdadero si existe un camino hacia la meta
 */
export function hasPathToGoal(playerIndex, gameState) {
  const player = gameState.players[playerIndex]
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0]
  const { walls } = gameState

  // Definir la fila meta basada en el índice del jugador
  const goalZ = playerIndex === 0 ? BOARD_SIZE - 1 : 0

  // Crear una cola para BFS con posición y camino
  const queue = [
    {
      x: player.x,
      z: player.z,
      path: [],
    },
  ]

  // Crear un conjunto para rastrear posiciones visitadas
  const visited = new Set()
  visited.add(`${player.x},${player.z}`)

  // Limitar la búsqueda para evitar bucles infinitos
  let iterations = 0

  // Algoritmo BFS
  while (queue.length > 0 && iterations < MAX_PATH_ITERATIONS) {
    iterations++
    const current = queue.shift()

    // Verificar si hemos llegado a la fila meta
    if (current.z === goalZ) {
      return true
    }

    // Obtener todos los movimientos posibles incluyendo saltos
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
  if (iterations >= MAX_PATH_ITERATIONS) {
    console.warn("Límite de iteraciones alcanzado en hasPathToGoal")
    return false
  }

  return false
}

/**
 * Obtiene todos los movimientos posibles desde una posición, incluyendo saltos
 * @param {number} x - Coordenada X actual
 * @param {number} z - Coordenada Z actual
 * @param {Object} opponent - Posición del oponente
 * @param {Array} walls - Array de muros en el tablero
 * @returns {Array} Array de movimientos posibles
 */
function getAllPossibleMoves(x, z, opponent, walls) {
  const moves = []

  // Movimientos ortogonales básicos
  const basicMoves = [
    { x: x + 1, z }, // Derecha
    { x: x - 1, z }, // Izquierda
    { x, z: z + 1 }, // Abajo
    { x, z: z - 1 }, // Arriba
  ]

  // Verificar cada movimiento básico
  for (const move of basicMoves) {
    if (isValidMove(move.x, move.z, x, z, opponent, walls)) {
      moves.push(move)
    }
  }

  // Verificar movimientos de salto si está adyacente al oponente
  if (Math.abs(x - opponent.x) + Math.abs(z - opponent.z) === 1) {
    // Solo verificar saltos si no hay un muro entre el jugador y el oponente
    if (!isMovementBlocked(x, z, opponent.x, opponent.z, walls)) {
      // Salto directo
      const jumpX = opponent.x + (opponent.x - x)
      const jumpZ = opponent.z + (opponent.z - z)

      if (isWithinBoard(jumpX, jumpZ)) {
        if (!isMovementBlocked(opponent.x, opponent.z, jumpX, jumpZ, walls)) {
          moves.push({ x: jumpX, z: jumpZ })
        } else {
          // Saltos diagonales cuando el salto directo está bloqueado
          const diagonalJumps = []

          // Añadir saltos diagonales apropiados basados en la alineación
          if (x === opponent.x) {
            // Alineación vertical - verificar diagonales horizontales
            diagonalJumps.push({ x: opponent.x + 1, z: opponent.z })
            diagonalJumps.push({ x: opponent.x - 1, z: opponent.z })
          } else {
            // Alineación horizontal - verificar diagonales verticales
            diagonalJumps.push({ x: opponent.x, z: opponent.z + 1 })
            diagonalJumps.push({ x: opponent.x, z: opponent.z - 1 })
          }

          // Filtrar saltos diagonales válidos
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
 * Verifica si un movimiento es válido
 * @param {number} toX - Coordenada X de destino
 * @param {number} toZ - Coordenada Z de destino
 * @param {number} fromX - Coordenada X de origen
 * @param {number} fromZ - Coordenada Z de origen
 * @param {Object} opponent - Posición del oponente
 * @param {Array} walls - Array de muros en el tablero
 * @returns {boolean} Verdadero si el movimiento es válido
 */
function isValidMove(toX, toZ, fromX, fromZ, opponent, walls) {
  // Verificar límites del tablero
  if (!isWithinBoard(toX, toZ)) {
    return false
  }

  // Verificar si el movimiento está bloqueado por un muro
  if (isMovementBlocked(fromX, fromZ, toX, toZ, walls)) {
    return false
  }

  // Verificar si el destino está ocupado por el oponente
  if (toX === opponent.x && toZ === opponent.z) {
    return false
  }

  return true
}

/**
 * Verifica si la colocación de un muro es válida
 * @param {Object} wallPos - Posición y orientación del muro
 * @param {Object} gameState - Estado actual del juego
 * @returns {boolean} Verdadero si la colocación del muro es válida
 */
export function isValidWallPlacement(wallPos, gameState) {
  try {
    // Verificar si el muro está dentro de los límites del tablero
    if (!isWallWithinBoard(wallPos)) {
      return false
    }

    // Verificar cantidad de muros
    if (gameState.players[gameState.currentPlayer].wallsLeft <= 0) {
      return false
    }

    // Verificar superposición con muros existentes
    if (gameState.walls.some((wall) => doWallsOverlap(wall, wallPos))) {
      return false
    }

    // Crear un estado de juego temporal con el nuevo muro
    const tempWalls = [...gameState.walls, wallPos]
    const tempGameState = { ...gameState, walls: tempWalls }

    // Verificar caminos para ambos jugadores
    const player1HasPath = hasPathToGoal(0, tempGameState)
    const player2HasPath = hasPathToGoal(1, tempGameState)

    return player1HasPath && player2HasPath
  } catch (error) {
    console.error("Error en isValidWallPlacement:", error)
    return false
  }
}

/**
 * Realiza un movimiento para el jugador actual
 * @param {number} x - Coordenada X de destino
 * @param {number} z - Coordenada Z de destino
 * @param {Object} gameState - Estado actual del juego
 * @returns {Object} Nuevo estado del juego después del movimiento
 */
export function makeMove(x, z, gameState) {
  // No permitir movimientos si hay un ganador o estamos en modo muro
  if (gameState.winner !== null || gameState.wallMode) {
    return gameState
  }

  // Verificar si el movimiento es válido
  const validMoves = getValidMoves(gameState.currentPlayer, gameState)
  if (!validMoves.some((move) => move.x === x && move.z === z)) {
    return gameState
  }

  // Actualizar posición del jugador
  const newPlayers = [...gameState.players]
  newPlayers[gameState.currentPlayer] = {
    ...newPlayers[gameState.currentPlayer],
    x,
    z,
  }

  // Verificar condición de victoria
  let winner = null
  if (gameState.currentPlayer === 0 && z === BOARD_SIZE - 1) {
    winner = 0 // Jugador 1 gana
  } else if (gameState.currentPlayer === 1 && z === 0) {
    winner = 1 // Jugador 2 gana
  }

  // Cambiar al siguiente jugador
  const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0

  // Calcular movimientos válidos para el siguiente jugador
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
 * Coloca un muro para el jugador actual
 * @param {number} x - Coordenada X del muro
 * @param {number} z - Coordenada Z del muro
 * @param {string} orientation - Orientación del muro ("horizontal" o "vertical")
 * @param {Object} gameState - Estado actual del juego
 * @returns {Object} Nuevo estado del juego después de colocar el muro
 */
export function placeWall(x, z, orientation, gameState) {
  // No permitir colocar muros si hay un ganador o no estamos en modo muro
  if (gameState.winner !== null || !gameState.wallMode) {
    return gameState
  }

  const wallPos = { x, z, orientation }

  // Validar colocación del muro
  const isValid = isValidWallPlacement(wallPos, gameState)

  if (!isValid) {
    return gameState
  }

  // Actualizar estado del juego
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
 * Ajusta un punto a la posición de muro válida más cercana
 * @param {Object} point - Punto a ajustar (coordenadas Three.js)
 * @returns {Object} Posición de muro ajustada
 */
export function snapToWallPosition(point) {
  // Convertir de coordenadas Three.js a coordenadas de grid
  const gridX = point.x + 4
  const gridZ = point.z + 4

  // Encontrar la posición de muro más cercana
  const snapX = Math.round(gridX)
  const snapZ = Math.round(gridZ)

  // Determinar si estamos más cerca de un muro vertical u horizontal
  const fracX = Math.abs(gridX - snapX)
  const fracZ = Math.abs(gridZ - snapZ)

  let wallPos
  if (fracX < fracZ) {
    // Muro vertical
    wallPos = {
      x: snapX - 1,
      z: Math.floor(gridZ),
      orientation: "vertical",
    }
  } else {
    // Muro horizontal
    wallPos = {
      x: Math.floor(gridX),
      z: snapZ - 1,
      orientation: "horizontal",
    }
  }

  return wallPos
}

// Funciones de depuración vacías para evitar errores si son llamadas
function debugBoard(gameState, message = "") {
  // Esta función se mantiene vacía para evitar errores si es llamada
}

function debugWallPlacement(wallPos, isValid, gameState) {
  // Esta función se mantiene vacía para evitar errores si es llamada
}
