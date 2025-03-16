import * as QuoridorLogic from "./quoridor-logic"

// Eliminar console.log excesivos y mejorar la clase base de la IA
class QuoridorAI {
  constructor(playerIndex, difficulty = "medium") {
    this.playerIndex = playerIndex // Índice del jugador IA (0 o 1)
    this.opponentIndex = playerIndex === 0 ? 1 : 0
    this.difficulty = difficulty
    this.BOARD_SIZE = 9
    this.MAX_PATH_ITERATIONS = 1000 // Límite para evitar bucles infinitos
  }

  // Función principal para tomar decisiones
  makeDecision(gameState) {
    try {
      console.log(`IA (${this.difficulty}): Analizando estado del juego`)

      // Crear una copia limpia del estado para evitar problemas de referencia
      const cleanGameState = this.sanitizeGameState(gameState)

      // Verificar que hay movimientos válidos disponibles
      const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, cleanGameState)

      if (validMoves.length === 0) {
        console.error("IA: No hay movimientos válidos")
        return this.makeRandomMove(cleanGameState)
      }

      // Implementado en las subclases
      throw new Error("Method not implemented")
    } catch (error) {
      console.error("IA: Error en la decisión", error)
      return this.makeRandomMove(gameState)
    }
  }

  // Crear una copia limpia del estado del juego para evitar problemas de referencia
  sanitizeGameState(gameState) {
    // Crear una copia profunda del estado
    const cleanState = JSON.parse(
      JSON.stringify({
        players: gameState.players,
        currentPlayer: gameState.currentPlayer,
        walls: gameState.walls,
        wallMode: false, // Siempre forzar a false para la IA
        winner: gameState.winner,
      }),
    )

    // Asegurarse de que las propiedades críticas existen
    if (!cleanState.players || !Array.isArray(cleanState.players)) {
      cleanState.players = [
        { x: 4, z: 0, wallsLeft: 10 },
        { x: 4, z: 8, wallsLeft: 10 },
      ]
    }

    if (!cleanState.walls || !Array.isArray(cleanState.walls)) {
      cleanState.walls = []
    }

    if (cleanState.currentPlayer === undefined) {
      cleanState.currentPlayer = this.playerIndex
    }

    return cleanState
  }

  // Movimiento aleatorio como último recurso
  makeRandomMove(gameState) {
    try {
      console.log("IA: Realizando movimiento aleatorio de emergencia")
      const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, gameState)

      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        return { type: "move", x: randomMove.x, z: randomMove.z }
      }

      // Si no hay movimientos válidos, intentar colocar un muro aleatorio
      if (gameState.players[this.playerIndex].wallsLeft > 0) {
        for (let attempts = 0; attempts < 20; attempts++) {
          const x = Math.floor(Math.random() * 8)
          const z = Math.floor(Math.random() * 8)
          const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"

          const wallPos = { x, z, orientation }

          if (QuoridorLogic.isValidWallPlacement(wallPos, gameState)) {
            return { type: "wall", x, z, orientation }
          }
        }
      }

      // Si todo falla, mover en una dirección aleatoria (incluso si no es válido)
      // El juego debería manejar este caso y evitar movimientos inválidos
      const player = gameState.players[this.playerIndex]
      const directions = [
        { x: player.x + 1, z: player.z },
        { x: player.x - 1, z: player.z },
        { x: player.x, z: player.z + 1 },
        { x: player.x, z: player.z - 1 },
      ]

      const validDirections = directions.filter((dir) => dir.x >= 0 && dir.x < 9 && dir.z >= 0 && dir.z < 9)

      if (validDirections.length > 0) {
        const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)]
        return { type: "move", x: randomDir.x, z: randomDir.z }
      }

      // Último recurso: quedarse en el mismo lugar
      return { type: "move", x: player.x, z: player.z }
    } catch (error) {
      console.error("IA: Error en makeRandomMove", error)
      // Devolver un movimiento nulo y dejar que el sistema lo maneje
      return null
    }
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

  // Algoritmo de búsqueda de camino mejorado con detección de errores
  findShortestPath(gameState, playerIndex) {
    try {
      const player = gameState.players[playerIndex]
      const goalZ = playerIndex === 0 ? this.BOARD_SIZE - 1 : 0

      // Cola para BFS
      const queue = [{ x: player.x, z: player.z, path: [] }]
      const visited = new Set([`${player.x},${player.z}`])

      // Limitar la búsqueda a un número máximo de iteraciones para evitar bucles infinitos
      let iterations = 0

      while (queue.length > 0 && iterations < this.MAX_PATH_ITERATIONS) {
        iterations++
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

      // Si alcanzamos el límite de iteraciones, devolvemos un camino aproximado
      if (iterations >= this.MAX_PATH_ITERATIONS) {
        console.warn("IA: Límite de iteraciones alcanzado en findShortestPath")
        // Devolver un camino directo hacia la meta como aproximación
        return this.getApproximatePath(player, goalZ)
      }

      // No hay camino a la meta, devolver un camino aproximado
      return this.getApproximatePath(player, goalZ)
    } catch (error) {
      console.error("IA: Error en findShortestPath", error)
      // En caso de error, devolver un camino aproximado
      const player = gameState.players[playerIndex]
      const goalZ = playerIndex === 0 ? this.BOARD_SIZE - 1 : 0
      return this.getApproximatePath(player, goalZ)
    }
  }

  // Genera un camino aproximado hacia la meta cuando no se puede encontrar un camino real
  getApproximatePath(player, goalZ) {
    const path = [{ x: player.x, z: player.z }]

    // Determinar dirección hacia la meta
    const zDirection = goalZ > player.z ? 1 : -1

    // Generar un camino directo hacia la meta
    let currentZ = player.z
    while (currentZ !== goalZ) {
      currentZ += zDirection
      path.push({ x: player.x, z: currentZ })
    }

    return path
  }

  /**
   * Obtiene todos los movimientos válidos para una posición
   */
  getValidMovesForPosition(x, z, gameState) {
    try {
      // Creamos un estado temporal con el jugador en la posición dada
      const tempGameState = {
        ...gameState,
        players: [...gameState.players.map((p, idx) => (idx === this.playerIndex ? { ...p, x, z } : p))],
      }

      return QuoridorLogic.getValidMoves(this.playerIndex, tempGameState)
    } catch (error) {
      console.error("IA: Error en getValidMovesForPosition", error)
      // En caso de error, devolver movimientos básicos filtrados por límites del tablero
      const basicMoves = [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 },
      ]

      return basicMoves.filter((move) => move.x >= 0 && move.x < 9 && move.z >= 0 && move.z < 9)
    }
  }

  /**
   * Evalúa la calidad de un movimiento
   * @returns {number} - Puntuación del movimiento (mayor es mejor)
   */
  evaluateMove(move, gameState) {
    try {
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
    } catch (error) {
      console.error("IA: Error en evaluateMove", error)
      // En caso de error, devolver una puntuación neutra
      return 0
    }
  }

  // Evaluación de muros mejorada con manejo de errores
  evaluateWall(wall, gameState) {
    try {
      // Creamos un estado temporal con el nuevo muro
      const tempGameState = {
        ...gameState,
        walls: [...gameState.walls, wall],
      }

      // Camino actual del oponente
      const originalOpponentPath = this.findShortestPath(gameState, this.opponentIndex)
      if (!originalOpponentPath || originalOpponentPath.length === 0) return -1000 // No hay camino, no debería ocurrir

      // Camino del oponente después de colocar el muro
      const newOpponentPath = this.findShortestPath(tempGameState, this.opponentIndex)
      if (!newOpponentPath || newOpponentPath.length === 0) return -1000 // El muro bloquea completamente al oponente, no es válido

      // Camino actual del jugador IA
      const originalAIPath = this.findShortestPath(gameState, this.playerIndex)
      if (!originalAIPath || originalAIPath.length === 0) return -1000 // No hay camino, no debería ocurrir

      // Camino del jugador IA después de colocar el muro
      const newAIPath = this.findShortestPath(tempGameState, this.playerIndex)
      if (!newAIPath || newAIPath.length === 0) return -1000 // El muro bloquea al propio jugador, no es válido

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
    } catch (error) {
      console.error("IA: Error al evaluar muro", error)
      return -1000 // Valor negativo para evitar este muro
    }
  }

  /**
   * Encuentra todos los posibles muros válidos
   */
  findAllValidWalls(gameState) {
    try {
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
    } catch (error) {
      console.error("IA: Error en findAllValidWalls", error)
      return [] // Devolver array vacío en caso de error
    }
  }

  /**
   * Encuentra muros que bloqueen el camino más corto del oponente
   */
  findBlockingWalls(gameState) {
    try {
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
    } catch (error) {
      console.error("IA: Error en findBlockingWalls", error)
      return [] // Devolver array vacío en caso de error
    }
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
    try {
      // Crear una copia limpia del estado para evitar problemas de referencia
      const cleanGameState = this.sanitizeGameState(gameState)

      // 80% de probabilidad de mover, 20% de colocar muro
      const shouldMove = Math.random() < 0.8 || cleanGameState.players[this.playerIndex].wallsLeft === 0

      if (shouldMove) {
        // Obtener movimientos válidos
        const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, cleanGameState)
        if (validMoves.length === 0) return this.makeRandomMove(cleanGameState)

        // Evaluar cada movimiento
        let bestMove = validMoves[0]
        let bestScore = this.evaluateMove(bestMove, cleanGameState)

        for (const move of validMoves) {
          const score = this.evaluateMove(move, cleanGameState)
          if (score > bestScore) {
            bestScore = score
            bestMove = move
          }
        }

        console.log("IA (fácil): Moviendo ficha", bestMove)
        return { type: "move", x: bestMove.x, z: bestMove.z }
      } else {
        // Intentar colocar un muro
        // En nivel fácil, solo consideramos algunos muros aleatorios para bloquear
        const validWalls = this.findAllValidWalls(cleanGameState)
        if (validWalls.length === 0) {
          // Si no hay muros válidos, movemos
          return this.makeDecision({ ...cleanGameState, wallMode: false })
        }

        // Seleccionamos un muro aleatorio entre los primeros 5 (o menos si hay menos)
        const randomIndex = Math.floor(Math.random() * Math.min(5, validWalls.length))
        const wall = validWalls[randomIndex]

        console.log("IA (fácil): Colocando muro", wall)
        return { type: "wall", x: wall.x, z: wall.z, orientation: wall.orientation }
      }
    } catch (error) {
      console.error("IA (fácil): Error en makeDecision", error)
      return this.makeRandomMove(gameState)
    }
  }

  // En nivel fácil, evaluamos los movimientos de forma simple
  evaluateMove(move, gameState) {
    try {
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
    } catch (error) {
      console.error("IA (fácil): Error en evaluateMove", error)
      return 0 // Valor neutro en caso de error
    }
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
    try {
      // Crear una copia limpia del estado para evitar problemas de referencia
      const cleanGameState = this.sanitizeGameState(gameState)

      // 60% de probabilidad de mover, 40% de colocar muro
      const shouldMove = Math.random() < 0.6 || cleanGameState.players[this.playerIndex].wallsLeft === 0

      if (shouldMove) {
        // Obtener movimientos válidos
        const validMoves = QuoridorLogic.getValidMoves(this.playerIndex, cleanGameState)
        if (validMoves.length === 0) return this.makeRandomMove(cleanGameState)

        // Evaluar cada movimiento
        let bestMove = validMoves[0]
        let bestScore = this.evaluateMove(bestMove, cleanGameState)

        for (const move of validMoves) {
          const score = this.evaluateMove(move, cleanGameState)
          if (score > bestScore) {
            bestScore = score
            bestMove = move
          }
        }

        console.log("IA (medio): Moviendo ficha", bestMove)
        return { type: "move", x: bestMove.x, z: bestMove.z }
      } else {
        // Intentar colocar un muro
        // Primero buscamos muros que bloqueen el camino del oponente
        const blockingWalls = this.findBlockingWalls(cleanGameState)

        if (blockingWalls.length > 0) {
          // Evaluamos cada muro bloqueante
          let bestWall = blockingWalls[0]
          let bestScore = this.evaluateWall(bestWall, cleanGameState)

          for (const wall of blockingWalls) {
            const score = this.evaluateWall(wall, cleanGameState)
            if (score > bestScore) {
              bestScore = score
              bestWall = wall
            }
          }

          // Si el mejor muro tiene una puntuación positiva, lo colocamos
          if (bestScore > 0) {
            console.log("IA (medio): Colocando muro bloqueante", bestWall)
            return {
              type: "wall",
              x: bestWall.x,
              z: bestWall.z,
              orientation: bestWall.orientation,
            }
          }
        }

        // Si no encontramos un buen muro bloqueante, probamos con muros aleatorios
        const validWalls = this.findAllValidWalls(cleanGameState)
        if (validWalls.length === 0) {
          // Si no hay muros válidos, movemos
          return this.makeDecision({ ...cleanGameState, wallMode: false })
        }

        // Evaluamos algunos muros aleatorios (para eficiencia)
        const wallsToEvaluate = validWalls.slice(0, Math.min(10, validWalls.length))
        let bestWall = wallsToEvaluate[0]
        let bestScore = this.evaluateWall(bestWall, cleanGameState)

        for (const wall of wallsToEvaluate) {
          const score = this.evaluateWall(wall, cleanGameState)
          if (score > bestScore) {
            bestScore = score
            bestWall = wall
          }
        }

        // Si el mejor muro tiene una puntuación positiva, lo colocamos
        if (bestScore > 0) {
          console.log("IA (medio): Colocando muro estratégico", bestWall)
          return {
            type: "wall",
            x: bestWall.x,
            z: bestWall.z,
            orientation: bestWall.orientation,
          }
        }

        // Si no encontramos un buen muro, movemos
        return this.makeDecision({ ...cleanGameState, wallMode: false })
      }
    } catch (error) {
      console.error("IA (medio): Error en makeDecision", error)
      return this.makeRandomMove(gameState)
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
    this.MAX_DEPTH = 2 // Reducido para evitar problemas de rendimiento
  }

  makeDecision(gameState) {
    try {
      // Crear una copia limpia del estado para evitar problemas de referencia
      const cleanGameState = this.sanitizeGameState(gameState)

      // En nivel difícil, usamos minimax para decidir entre mover o colocar muro
      const result = this.minimax(cleanGameState, 0, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)

      if (!result || !result.action) {
        console.warn("IA (difícil): Minimax no produjo una acción válida, usando movimiento aleatorio")
        return this.makeRandomMove(cleanGameState)
      }

      console.log("IA (difícil): Decisión tomada", result.action)
      return result.action
    } catch (error) {
      console.error("IA (difícil): Error en makeDecision", error)
      return this.makeRandomMove(gameState)
    }
  }

  minimax(gameState, depth, isMaximizing, alpha, beta) {
    try {
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
    } catch (error) {
      console.error("IA (difícil): Error en minimax", error)
      // En caso de error, devolver una acción aleatoria
      const playerIndex = isMaximizing ? this.playerIndex : this.opponentIndex
      const validMoves = QuoridorLogic.getValidMoves(playerIndex, gameState)

      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        return {
          score: 0,
          action: { type: "move", x: randomMove.x, z: randomMove.z },
        }
      }

      return { score: 0, action: null }
    }
  }

  /**
   * Genera todas las posibles acciones para un jugador
   */
  generatePossibleActions(gameState, playerIndex) {
    try {
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
    } catch (error) {
      console.error("IA (difícil): Error en generatePossibleActions", error)
      // En caso de error, devolver al menos un movimiento aleatorio si es posible
      const validMoves = QuoridorLogic.getValidMoves(playerIndex, gameState)
      if (validMoves.length > 0) {
        return [{ type: "move", x: validMoves[0].x, z: validMoves[0].z }]
      }
      return []
    }
  }

  // Función mejorada para aplicar acciones
  applyAction(gameState, action, playerIndex) {
    try {
      // Crear una copia profunda del estado para evitar modificar el original
      const newGameState = JSON.parse(JSON.stringify(gameState))

      if (action.type === "move") {
        // Actualizar la posición del jugador
        newGameState.players[playerIndex] = {
          ...newGameState.players[playerIndex],
          x: action.x,
          z: action.z,
        }

        // Comprobar si hay un ganador
        let winner = null
        if (playerIndex === 0 && action.z === this.BOARD_SIZE - 1) {
          winner = 0
        } else if (playerIndex === 1 && action.z === 0) {
          winner = 1
        }

        // Cambiar al siguiente jugador
        const nextPlayer = playerIndex === 0 ? 1 : 0

        return {
          ...newGameState,
          currentPlayer: nextPlayer,
          winner,
        }
      } else if (action.type === "wall") {
        // Añadir el nuevo muro
        newGameState.walls.push({
          x: action.x,
          z: action.z,
          orientation: action.orientation,
        })

        // Actualizar el número de muros restantes
        newGameState.players[playerIndex] = {
          ...newGameState.players[playerIndex],
          wallsLeft: newGameState.players[playerIndex].wallsLeft - 1,
        }

        // Cambiar al siguiente jugador
        const nextPlayer = playerIndex === 0 ? 1 : 0

        return {
          ...newGameState,
          currentPlayer: nextPlayer,
        }
      }

      return newGameState
    } catch (error) {
      console.error("IA (difícil): Error en applyAction", error)
      // En caso de error, devolver el estado original
      return gameState
    }
  }

  /**
   * Evalúa el estado del juego
   */
  evaluateGameState(gameState, isMaximizing) {
    try {
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
    } catch (error) {
      console.error("IA (difícil): Error en evaluateGameState", error)
      return 0 // Valor neutro en caso de error
    }
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
