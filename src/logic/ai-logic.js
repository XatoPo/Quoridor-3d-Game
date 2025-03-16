import * as QuoridorLogic from "./quoridor-logic"

/**
 * Clase base para la IA de Quoridor
 */
class QuoridorAI {
  constructor(playerIndex, difficulty = "medium") {
    this.playerIndex = playerIndex // Índice del jugador IA (0 o 1)
    this.opponentIndex = playerIndex === 0 ? 1 : 0
    this.difficulty = difficulty
    this.BOARD_SIZE = 9
  }

  // Mejorar la función makeDecision en la clase base para manejar correctamente el modo muro
  makeDecision(gameState) {
    // Asegurarnos de que la IA siempre decide independientemente del modo muro
    const normalizedGameState = {
      ...gameState,
      wallMode: false, // Ignorar el modo muro para la toma de decisiones
    }

    // Implementado en las subclases
    throw new Error("Method not implemented")
  }

  /**
   * Calcula la distancia Manhattan entre dos puntos
   */
  calculateManhattanDistance(x1, z1, x2, z2) {
    return Math.abs(x1 - x2) + Math.abs(z1 - z2)
  }

  /**
   * Calcula la distancia al objetivo para un jugador
   */
  distanceToGoal(playerPos, playerIndex) {
    const goalZ = playerIndex === 0 ? this.BOARD_SIZE - 1 : 0
    return Math.abs(playerPos.z - goalZ)
  }

  /**
   * Encuentra el camino más corto a la meta usando BFS
   * @returns {Array} - Camino más corto o null si no hay camino
   */
  findShortestPath(gameState, playerIndex) {
    const player = gameState.players[playerIndex]
    const goalZ = playerIndex === 0 ? this.BOARD_SIZE - 1 : 0

    // Cola para BFS
    const queue = [{ x: player.x, z: player.z, path: [] }]
    const visited = new Set([`${player.x},${player.z}`])

    while (queue.length > 0) {
      const current = queue.shift()

      // Si llegamos a la meta, devolvemos el camino
      if (current.z === goalZ) {
        return [...current.path, { x: current.x, z: current.z }]
      }

      // Obtenemos todos los movimientos posibles
      const validMoves = this.getValidMovesForPosition(current.x, current.z, gameState)

      for (const move of validMoves) {
        const moveKey = `${move.x},${move.z}`
        if (!visited.has(moveKey)) {
          visited.add(moveKey)
          queue.push({
            x: move.x,
            z: move.z,
            path: [...current.path, { x: current.x, z: current.z }],
          })
        }
      }
    }

    // No hay camino a la meta
    return null
  }

  /**
   * Obtiene todos los movimientos válidos para una posición
   */
  getValidMovesForPosition(x, z, gameState) {
    // Creamos un estado temporal con el jugador en la posición dada
    const tempGameState = {
      ...gameState,
      players: [...gameState.players.map((p, idx) => (idx === this.playerIndex ? { ...p, x, z } : p))],
    }

    return QuoridorLogic.getValidMoves(this.playerIndex, tempGameState)
  }

  /**
   * Evalúa la calidad de un movimiento
   * @returns {number} - Puntuación del movimiento (mayor es mejor)
   */
  evaluateMove(move, gameState) {
    const player = gameState.players[this.playerIndex]
    const opponent = gameState.players[this.opponentIndex]

    // Distancia actual a la meta
    const currentDistance = this.distanceToGoal(player, this.playerIndex)

    // Distancia después del movimiento
    const newDistance = this.distanceToGoal({ x: move.x, z: move.z }, this.playerIndex)

    // Mejora en la distancia
    const distanceImprovement = currentDistance - newDistance

    // Distancia del oponente a su meta
    const opponentDistance = this.distanceToGoal(opponent, this.opponentIndex)

    // Puntuación base: priorizar acercarse a la meta
    let score = 10 * distanceImprovement

    // Bonus por estar más cerca de la meta que el oponente
    if (newDistance < opponentDistance) {
      score += 5
    }

    // Bonus por moverse hacia la meta
    if (this.playerIndex === 0 && move.z > player.z) {
      score += 3
    } else if (this.playerIndex === 1 && move.z < player.z) {
      score += 3
    }

    return score
  }

  /**
   * Evalúa la calidad de colocar un muro
   * @returns {number} - Puntuación del muro (mayor es mejor)
   */
  evaluateWall(wall, gameState) {
    // Creamos un estado temporal con el nuevo muro
    const tempGameState = {
      ...gameState,
      walls: [...gameState.walls, wall],
    }

    // Camino actual del oponente
    const originalOpponentPath = this.findShortestPath(gameState, this.opponentIndex)
    if (!originalOpponentPath) return -1000 // No hay camino, no debería ocurrir

    // Camino del oponente después de colocar el muro
    const newOpponentPath = this.findShortestPath(tempGameState, this.opponentIndex)
    if (!newOpponentPath) return -1000 // El muro bloquea completamente al oponente, no es válido

    // Camino actual del jugador IA
    const originalAIPath = this.findShortestPath(gameState, this.playerIndex)
    if (!originalAIPath) return -1000 // No hay camino, no debería ocurrir

    // Camino del jugador IA después de colocar el muro
    const newAIPath = this.findShortestPath(tempGameState, this.playerIndex)
    if (!newAIPath) return -1000 // El muro bloquea al propio jugador, no es válido

    // Diferencia en la longitud del camino del oponente
    const opponentPathDifference = newOpponentPath.length - originalOpponentPath.length

    // Diferencia en la longitud del camino del jugador IA
    const aiPathDifference = newAIPath.length - originalAIPath.length

    // Puntuación base: priorizar aumentar el camino del oponente sin afectar demasiado al propio
    let score = 10 * opponentPathDifference - 5 * aiPathDifference

    // Bonus por bloquear al oponente cerca de su meta
    const opponent = gameState.players[this.opponentIndex]
    const opponentGoalZ = this.opponentIndex === 0 ? this.BOARD_SIZE - 1 : 0
    const isOpponentCloseToGoal = Math.abs(opponent.z - opponentGoalZ) <= 2

    if (isOpponentCloseToGoal && opponentPathDifference > 0) {
      score += 15
    }

    // Penalización por usar muros cuando quedan pocos
    const wallsLeft = gameState.players[this.playerIndex].wallsLeft
    if (wallsLeft <= 2) {
      score -= 10
    }

    return score
  }

  /**
   * Encuentra todos los posibles muros válidos
   */
  findAllValidWalls(gameState) {
    const validWalls = []

    // Recorremos todas las posiciones posibles para muros
    for (let x = 0; x < 8; x++) {
      for (let z = 0; z < 8; z++) {
        // Probamos muros horizontales
        const horizontalWall = { x, z, orientation: "horizontal" }
        if (QuoridorLogic.isValidWallPlacement(horizontalWall, gameState)) {
          validWalls.push(horizontalWall)
        }

        // Probamos muros verticales
        const verticalWall = { x, z, orientation: "vertical" }
        if (QuoridorLogic.isValidWallPlacement(verticalWall, gameState)) {
          validWalls.push(verticalWall)
        }
      }
    }

    return validWalls
  }

  /**
   * Encuentra muros que bloqueen el camino más corto del oponente
   */
  findBlockingWalls(gameState) {
    const opponentPath = this.findShortestPath(gameState, this.opponentIndex)
    if (!opponentPath || opponentPath.length <= 1) return []

    const blockingWalls = []

    // Consideramos solo los primeros pasos del camino para eficiencia
    const pathToConsider = opponentPath.slice(0, Math.min(4, opponentPath.length))

    for (let i = 0; i < pathToConsider.length - 1; i++) {
      const current = pathToConsider[i]
      const next = pathToConsider[i + 1]

      // Determinamos la orientación del muro necesario para bloquear
      if (current.x === next.x) {
        // Movimiento vertical, necesitamos un muro horizontal
        const minZ = Math.min(current.z, next.z)
        const wall = { x: current.x - 1, z: minZ, orientation: "horizontal" }

        // Verificamos si el muro es válido y lo añadimos
        if (QuoridorLogic.isValidWallPlacement(wall, gameState)) {
          blockingWalls.push(wall)
        }

        // También probamos el muro a la derecha
        const wallRight = { x: current.x, z: minZ, orientation: "horizontal" }
        if (QuoridorLogic.isValidWallPlacement(wallRight, gameState)) {
          blockingWalls.push(wallRight)
        }
      } else {
        // Movimiento horizontal, necesitamos un muro vertical
        const minX = Math.min(current.x, next.x)
        const wall = { x: minX, z: current.z - 1, orientation: "vertical" }

        // Verificamos si el muro es válido y lo añadimos
        if (QuoridorLogic.isValidWallPlacement(wall, gameState)) {
          blockingWalls.push(wall)
        }

        // También probamos el muro abajo
        const wallDown = { x: minX, z: current.z, orientation: "vertical" }
        if (QuoridorLogic.isValidWallPlacement(wallDown, gameState)) {
          blockingWalls.push(wallDown)
        }
      }
    }

    return blockingWalls
  }
}

/**
 * IA de nivel fácil
 * - Prioriza su propio movimiento hacia la meta
 * - Coloca muros solo ocasionalmente
 */
export class EasyAI extends QuoridorAI {
  constructor(playerIndex) {
    super(playerIndex, "easy")
  }

  makeDecision(gameState) {
    // 80% de probabilidad de mover, 20% de colocar muro
    const shouldMove = Math.random() < 0.8 || gameState.players[this.playerIndex].wallsLeft === 0

    if (shouldMove || !gameState.wallMode) {
      // Obtener movimientos válidos
      const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, gameState)
      if (validMoves.length === 0) return null

      // Evaluar cada movimiento
      let bestMove = validMoves[0]
      let bestScore = this.evaluateMove(bestMove, gameState)

      for (const move of validMoves) {
        const score = this.evaluateMove(move, gameState)
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      return { type: "move", x: bestMove.x, z: bestMove.z }
    } else {
      // Intentar colocar un muro
      // En nivel fácil, solo consideramos algunos muros aleatorios para bloquear
      const validWalls = this.findAllValidWalls(gameState)
      if (validWalls.length === 0) {
        // Si no hay muros válidos, movemos
        return this.makeDecision({ ...gameState, wallMode: false })
      }

      // Seleccionamos un muro aleatorio entre los primeros 5 (o menos si hay menos)
      const randomIndex = Math.floor(Math.random() * Math.min(5, validWalls.length))
      const wall = validWalls[randomIndex]

      return { type: "wall", x: wall.x, z: wall.z, orientation: wall.orientation }
    }
  }

  // En nivel fácil, evaluamos los movimientos de forma simple
  evaluateMove(move, gameState) {
    const player = gameState.players[this.playerIndex]
    const goalZ = this.playerIndex === 0 ? this.BOARD_SIZE - 1 : 0

    // Distancia actual a la meta
    const currentDistance = Math.abs(player.z - goalZ)

    // Distancia después del movimiento
    const newDistance = Math.abs(move.z - goalZ)

    // Mejora en la distancia (positiva si nos acercamos a la meta)
    const distanceImprovement = currentDistance - newDistance

    // Puntuación simple: priorizar acercarse a la meta
    return 10 * distanceImprovement
  }
}

/**
 * IA de nivel intermedio
 * - Analiza los movimientos del oponente
 * - Alterna entre avanzar y defender
 */
export class MediumAI extends QuoridorAI {
  constructor(playerIndex) {
    super(playerIndex, "medium")
  }

  makeDecision(gameState) {
    // 60% de probabilidad de mover, 40% de colocar muro
    const shouldMove = Math.random() < 0.6 || gameState.players[this.playerIndex].wallsLeft === 0

    if (shouldMove || !gameState.wallMode) {
      // Obtener movimientos válidos
      const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, gameState)
      if (validMoves.length === 0) return null

      // Evaluar cada movimiento
      let bestMove = validMoves[0]
      let bestScore = this.evaluateMove(bestMove, gameState)

      for (const move of validMoves) {
        const score = this.evaluateMove(move, gameState)
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      return { type: "move", x: bestMove.x, z: bestMove.z }
    } else {
      // Intentar colocar un muro
      // Primero buscamos muros que bloqueen el camino del oponente
      const blockingWalls = this.findBlockingWalls(gameState)

      if (blockingWalls.length > 0) {
        // Evaluamos cada muro bloqueante
        let bestWall = blockingWalls[0]
        let bestScore = this.evaluateWall(bestWall, gameState)

        for (const wall of blockingWalls) {
          const score = this.evaluateWall(wall, gameState)
          if (score > bestScore) {
            bestScore = score
            bestWall = wall
          }
        }

        // Si el mejor muro tiene una puntuación positiva, lo colocamos
        if (bestScore > 0) {
          return {
            type: "wall",
            x: bestWall.x,
            z: bestWall.z,
            orientation: bestWall.orientation,
          }
        }
      }

      // Si no encontramos un buen muro bloqueante, probamos con muros aleatorios
      const validWalls = this.findAllValidWalls(gameState)
      if (validWalls.length === 0) {
        // Si no hay muros válidos, movemos
        return this.makeDecision({ ...gameState, wallMode: false })
      }

      // Evaluamos algunos muros aleatorios (para eficiencia)
      const wallsToEvaluate = validWalls.slice(0, Math.min(10, validWalls.length))
      let bestWall = wallsToEvaluate[0]
      let bestScore = this.evaluateWall(bestWall, gameState)

      for (const wall of wallsToEvaluate) {
        const score = this.evaluateWall(wall, gameState)
        if (score > bestScore) {
          bestScore = score
          bestWall = wall
        }
      }

      // Si el mejor muro tiene una puntuación positiva, lo colocamos
      if (bestScore > 0) {
        return {
          type: "wall",
          x: bestWall.x,
          z: bestWall.z,
          orientation: bestWall.orientation,
        }
      }

      // Si no encontramos un buen muro, movemos
      return this.makeDecision({ ...gameState, wallMode: false })
    }
  }
}

/**
 * IA de nivel difícil
 * - Usa minimax para planificar varios turnos adelante
 * - Coloca muros estratégicamente
 */
export class HardAI extends QuoridorAI {
  constructor(playerIndex) {
    super(playerIndex, "hard")
    this.MAX_DEPTH = 3 // Profundidad máxima para minimax
  }

  makeDecision(gameState) {
    // En nivel difícil, usamos minimax para decidir entre mover o colocar muro
    const result = this.minimax(gameState, 0, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    return result.action
  }

  minimax(gameState, depth, isMaximizing, alpha, beta) {
    // Si hemos llegado a la profundidad máxima o el juego ha terminado
    if (depth >= this.MAX_DEPTH || gameState.winner !== null) {
      return {
        score: this.evaluateGameState(gameState, isMaximizing),
        action: null,
      }
    }

    const playerIndex = isMaximizing ? this.playerIndex : this.opponentIndex

    // Generamos posibles acciones (movimientos y muros)
    const possibleActions = this.generatePossibleActions(gameState, playerIndex)

    if (possibleActions.length === 0) {
      return {
        score: this.evaluateGameState(gameState, isMaximizing),
        action: null,
      }
    }

    let bestScore = isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    let bestAction = possibleActions[0]

    for (const action of possibleActions) {
      // Aplicamos la acción para obtener el nuevo estado
      const newGameState = this.applyAction(gameState, action, playerIndex)

      // Llamada recursiva a minimax
      const result = this.minimax(newGameState, depth + 1, !isMaximizing, alpha, beta)

      // Actualizamos el mejor resultado
      if (isMaximizing) {
        if (result.score > bestScore) {
          bestScore = result.score
          bestAction = action
        }
        alpha = Math.max(alpha, bestScore)
      } else {
        if (result.score < bestScore) {
          bestScore = result.score
          bestAction = action
        }
        beta = Math.min(beta, bestScore)
      }

      // Poda alfa-beta
      if (beta <= alpha) {
        break
      }
    }

    return { score: bestScore, action: bestAction }
  }

  /**
   * Genera todas las posibles acciones para un jugador
   */
  generatePossibleActions(gameState, playerIndex) {
    const actions = []

    // Añadimos movimientos
    const validMoves = QuoridorLogic.getValidMoves(playerIndex, gameState)
    for (const move of validMoves) {
      actions.push({ type: "move", x: move.x, z: move.z })
    }

    // Añadimos muros si quedan
    if (gameState.players[playerIndex].wallsLeft > 0) {
      // Para eficiencia, limitamos el número de muros a considerar
      const blockingWalls = this.findBlockingWalls(gameState)

      // Añadimos los muros que bloquean el camino del oponente
      for (const wall of blockingWalls) {
        actions.push({
          type: "wall",
          x: wall.x,
          z: wall.z,
          orientation: wall.orientation,
        })
      }

      // Añadimos algunos muros aleatorios para diversidad
      const allValidWalls = this.findAllValidWalls(gameState)
      const randomWalls = allValidWalls
        .filter((w) => !blockingWalls.some((bw) => bw.x === w.x && bw.z === w.z && bw.orientation === w.orientation))
        .slice(0, Math.min(5, allValidWalls.length))

      for (const wall of randomWalls) {
        actions.push({
          type: "wall",
          x: wall.x,
          z: wall.z,
          orientation: wall.orientation,
        })
      }
    }

    return actions
  }

  // Mejorar la función applyAction en HardAI para manejar correctamente el modo muro
  applyAction(gameState, action, playerIndex) {
    // Normalizar el estado del juego para ignorar el modo muro
    const normalizedGameState = {
      ...gameState,
      wallMode: false,
    }

    if (action.type === "move") {
      // Creamos un estado temporal con el jugador en la nueva posición
      const newPlayers = [...normalizedGameState.players]
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        x: action.x,
        z: action.z,
      }

      // Comprobamos si hay un ganador
      let winner = null
      if (playerIndex === 0 && action.z === this.BOARD_SIZE - 1) {
        winner = 0
      } else if (playerIndex === 1 && action.z === 0) {
        winner = 1
      }

      // Cambiamos al siguiente jugador
      const nextPlayer = playerIndex === 0 ? 1 : 0

      return {
        ...normalizedGameState,
        players: newPlayers,
        currentPlayer: nextPlayer,
        winner,
      }
    } else if (action.type === "wall") {
      // Colocamos un muro
      const newWalls = [...normalizedGameState.walls, { x: action.x, z: action.z, orientation: action.orientation }]

      // Actualizamos el número de muros restantes
      const newPlayers = [...normalizedGameState.players]
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        wallsLeft: newPlayers[playerIndex].wallsLeft - 1,
      }

      // Cambiamos al siguiente jugador
      const nextPlayer = playerIndex === 0 ? 1 : 0

      return {
        ...normalizedGameState,
        players: newPlayers,
        walls: newWalls,
        currentPlayer: nextPlayer,
      }
    }

    return normalizedGameState
  }

  /**
   * Evalúa el estado del juego
   */
  evaluateGameState(gameState, isMaximizing) {
    const aiPlayer = gameState.players[this.playerIndex]
    const opponent = gameState.players[this.opponentIndex]

    // Si hay un ganador, devolvemos un valor extremo
    if (gameState.winner === this.playerIndex) {
      return 1000
    } else if (gameState.winner === this.opponentIndex) {
      return -1000
    }

    // Encontramos los caminos más cortos
    const aiPath = this.findShortestPath(gameState, this.playerIndex)
    const opponentPath = this.findShortestPath(gameState, this.opponentIndex)

    if (!aiPath || !opponentPath) return 0 // No debería ocurrir

    // Longitud de los caminos
    const aiPathLength = aiPath.length
    const opponentPathLength = opponentPath.length

    // Distancia a la meta
    const aiDistance = this.distanceToGoal(aiPlayer, this.playerIndex)
    const opponentDistance = this.distanceToGoal(opponent, this.opponentIndex)

    // Muros restantes
    const aiWallsLeft = aiPlayer.wallsLeft
    const opponentWallsLeft = opponent.wallsLeft

    // Calculamos la puntuación
    let score = 0

    // Factores principales: longitud del camino y distancia
    score += 20 * (opponentPathLength - aiPathLength)
    score += 10 * (opponentDistance - aiDistance)

    // Factor secundario: muros restantes
    score += 5 * (aiWallsLeft - opponentWallsLeft)

    // Bonus por estar cerca de la meta
    if (aiDistance <= 2) {
      score += 15
    }

    // Bonus por tener un camino más corto
    if (aiPathLength < opponentPathLength) {
      score += 10
    }

    return score
  }
}

/**
 * Crea una instancia de IA según el nivel de dificultad
 */
export function createAI(playerIndex, difficulty) {
  switch (difficulty) {
    case "easy":
      return new EasyAI(playerIndex)
    case "medium":
      return new MediumAI(playerIndex)
    case "hard":
      return new HardAI(playerIndex)
    default:
      return new MediumAI(playerIndex)
  }
}
