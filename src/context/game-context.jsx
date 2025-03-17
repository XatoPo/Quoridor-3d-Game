"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import * as QuoridorLogic from "../logic/quoridor-logic"
import { createAI } from "../logic/ai-logic"

// Create context
const GameContext = createContext(undefined)

// Provider component
export function GameProvider({ children }) {
  const [selectedTile, setSelectedTile] = useState(null)
  const [hoveredWallPosition, setHoveredWallPosition] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [soundTrigger, setSoundTrigger] = useState(0)
  const [aiPlayer, setAiPlayer] = useState(null)
  const [isAIMode, setIsAIMode] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState("medium")
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiStuck, setAiStuck] = useState(false)
  const [aiError, setAiError] = useState(null)

  // Referencia para el temporizador de seguridad de la IA
  const aiTimeoutRef = useRef(null)
  // Contador de intentos de la IA
  const aiRetryCountRef = useRef(0)
  // Máximo número de intentos antes de forzar un movimiento
  const MAX_AI_RETRIES = 3

  // Initialize game state
  const [state, setState] = useState(QuoridorLogic.createInitialGameState())

  // Calculate valid moves when the game starts
  useEffect(() => {
    if (state.validMoves.length === 0 && state.winner === null) {
      const validMoves = QuoridorLogic.getValidMoves(state.currentPlayer, state)
      setState((prevState) => ({
        ...prevState,
        validMoves,
      }))
    }
  }, [state])

  // Modificar la función makeAIMove para que ignore el estado wallMode actual
  const makeAIMove = () => {
    if (!aiPlayer || !isAIMode) return

    // Limpiar el temporizador de seguridad
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    try {
      console.log("IA: Iniciando turno")

      // Guardar el estado actual de wallMode para restaurarlo después
      const currentWallMode = state.wallMode

      // Verificar que hay movimientos válidos para la IA
      const validMoves = QuoridorLogic.getValidMoves(1, state)
      if (validMoves.length === 0) {
        console.error("IA: No hay movimientos válidos")
        throw new Error("No hay movimientos válidos para la IA")
      }

      // Obtener la decisión de la IA
      const aiDecision = aiPlayer.makeDecision({ ...state, wallMode: false })

      if (!aiDecision) {
        console.warn("IA: No pudo tomar una decisión, usando movimiento de emergencia")
        return makeEmergencyAIMove(currentWallMode)
      }

      console.log("IA: Decisión tomada", aiDecision)

      // Ejecutar la acción de la IA
      if (aiDecision.type === "move") {
        // Verificar que el movimiento es válido
        if (!validMoves.some((move) => move.x === aiDecision.x && move.z === aiDecision.z)) {
          console.error("IA: Movimiento inválido", aiDecision)
          return makeEmergencyAIMove(currentWallMode)
        }

        // Crear un estado temporal con wallMode = false para el movimiento
        const tempState = { ...state, wallMode: false }

        // Ejecutar el movimiento directamente
        const newState = QuoridorLogic.makeMove(aiDecision.x, aiDecision.z, tempState)

        // Restaurar el wallMode original para el jugador humano
        setState({
          ...newState,
          wallMode: currentWallMode,
        })

        setSelectedTile(null)
        setLastAction("movement")
        setSoundTrigger((prev) => prev + 1)
      } else if (aiDecision.type === "wall") {
        // Verificar que el muro es válido
        if (
          !QuoridorLogic.isValidWallPlacement(
            { x: aiDecision.x, z: aiDecision.z, orientation: aiDecision.orientation },
            { ...state, wallMode: true },
          )
        ) {
          console.error("IA: Muro inválido", aiDecision)
          return makeEmergencyAIMove(currentWallMode)
        }

        // Crear un estado temporal con wallMode = true para colocar el muro
        const tempState = { ...state, wallMode: true }

        // Colocar el muro directamente
        const newState = QuoridorLogic.placeWall(aiDecision.x, aiDecision.z, aiDecision.orientation, tempState)

        // Restaurar el wallMode original para el jugador humano
        setState({
          ...newState,
          wallMode: currentWallMode,
        })

        setHoveredWallPosition(null)
        setLastAction("wall")
        setSoundTrigger((prev) => prev + 1)
      } else {
        // Si llegamos aquí, la decisión no tiene un tipo válido
        console.error("IA: Tipo de decisión inválido", aiDecision)
        return makeEmergencyAIMove(currentWallMode)
      }
    } catch (error) {
      console.error("IA: Error en makeAIMove", error)
      // Intentar un movimiento de emergencia
      makeEmergencyAIMove()
    }
  }

  // Modificar el movimiento de emergencia para que también preserve el wallMode
  const makeEmergencyAIMove = (currentWallMode = state.wallMode) => {
    console.log("IA: Ejecutando movimiento de emergencia")

    // Incrementar contador de intentos
    aiRetryCountRef.current += 1

    try {
      // Obtener todos los movimientos válidos para la IA
      const validMoves = QuoridorLogic.getValidMoves(1, state)

      if (validMoves.length > 0) {
        // Si hay movimientos válidos, elegir uno aleatorio
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        console.log("IA: Movimiento de emergencia", randomMove)

        // Crear un estado temporal con wallMode = false para el movimiento
        const tempState = { ...state, wallMode: false }

        // Ejecutar el movimiento directamente
        const newState = QuoridorLogic.makeMove(randomMove.x, randomMove.z, tempState)

        // Restaurar el wallMode original para el jugador humano
        setState({
          ...newState,
          wallMode: currentWallMode,
        })

        setSelectedTile(null)
        setLastAction("movement")
        setSoundTrigger((prev) => prev + 1)
        return
      }

      // Si no hay movimientos válidos, intentar colocar un muro aleatorio
      if (state.players[1].wallsLeft > 0) {
        // Intentar hasta 20 posiciones aleatorias
        for (let i = 0; i < 20; i++) {
          const x = Math.floor(Math.random() * 8)
          const z = Math.floor(Math.random() * 8)
          const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"

          const wallPos = { x, z, orientation }

          if (QuoridorLogic.isValidWallPlacement(wallPos, { ...state, wallMode: true })) {
            console.log("IA: Muro de emergencia", wallPos)

            // Crear un estado temporal con wallMode = true para colocar el muro
            const tempState = { ...state, wallMode: true }

            // Colocar el muro directamente
            const newState = QuoridorLogic.placeWall(x, z, orientation, tempState)

            // Restaurar el wallMode original para el jugador humano
            setState({
              ...newState,
              wallMode: currentWallMode,
            })

            setHoveredWallPosition(null)
            setLastAction("wall")
            setSoundTrigger((prev) => prev + 1)
            return
          }
        }
      }

      // Si todavía estamos aquí y no hemos superado el máximo de intentos, intentar de nuevo
      if (aiRetryCountRef.current < MAX_AI_RETRIES) {
        console.log(`IA: Reintentando movimiento de emergencia (intento ${aiRetryCountRef.current})`)
        setTimeout(() => makeEmergencyAIMove(currentWallMode), 500)
        return
      }

      // Si todo falla, forzar el cambio de turno
      console.error("IA: No se pudo encontrar un movimiento válido")
      setAiError("La IA está teniendo problemas para encontrar un movimiento válido")
      setAiStuck(true)
    } catch (error) {
      console.error("IA: Error en el movimiento de emergencia", error)
      setAiError("La IA está teniendo problemas para calcular su movimiento")
      setAiStuck(true)
    }
  }

  // Forzar el siguiente turno cuando la IA está bloqueada
  const forceNextTurn = () => {
    const currentWallMode = state.wallMode
    setState((prevState) => ({
      ...prevState,
      currentPlayer: 0,
      validMoves: QuoridorLogic.getValidMoves(0, prevState),
      wallMode: currentWallMode, // Mantener el modo actual
    }))
    setAiStuck(false)
    setAiError(null)
    triggerSound()
  }

  // Modificar el efecto que maneja el turno de la IA para incluir un temporizador de seguridad más robusto
  useEffect(() => {
    if (isAIMode && state.currentPlayer === 1 && state.winner === null && gameStarted) {
      // Limpiar cualquier temporizador anterior
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
        aiTimeoutRef.current = null
      }

      // Reiniciar contador de intentos
      aiRetryCountRef.current = 0
      setAiStuck(false)

      // Añadir un pequeño retraso para que la IA parezca que está "pensando"
      setIsAIThinking(true)
      setAiError(null)

      const aiThinkingTime = aiDifficulty === "easy" ? 800 : aiDifficulty === "medium" ? 1200 : 1500

      const aiTimer = setTimeout(() => {
        try {
          makeAIMove()
        } catch (error) {
          console.error("IA: Error en el turno de la IA", error)
          setAiError("Error en la IA: " + error.message)

          // Intentar un movimiento de emergencia después de un breve retraso
          setTimeout(() => {
            makeEmergencyAIMove()
          }, 1000)
        } finally {
          setIsAIThinking(false)
        }
      }, aiThinkingTime)

      // Configurar un temporizador de seguridad para evitar que el juego se quede bloqueado
      aiTimeoutRef.current = setTimeout(() => {
        console.warn("IA: Temporizador de seguridad activado")
        setIsAIThinking(false)

        // Forzar un movimiento de emergencia si la IA no ha respondido
        if (state.currentPlayer === 1) {
          makeEmergencyAIMove()
        }
      }, aiThinkingTime + 5000) // 5 segundos adicionales como máximo

      return () => {
        clearTimeout(aiTimer)
        if (aiTimeoutRef.current) {
          clearTimeout(aiTimeoutRef.current)
          aiTimeoutRef.current = null
        }
      }
    }
  }, [isAIMode, state.currentPlayer, state.winner, gameStarted, aiDifficulty])

  // Start game
  const startGame = (withAI = false, difficulty = "medium") => {
    setGameStarted(true)
    setIsAIMode(withAI)
    setAiDifficulty(difficulty)

    if (withAI) {
      // Crear la IA con el nivel de dificultad seleccionado
      setAiPlayer(createAI(1, difficulty))
    } else {
      setAiPlayer(null)
    }

    setLastAction("click")
    triggerClickSound()
  }

  // Return to menu
  const returnToMenu = () => {
    // Limpiar cualquier temporizador de la IA
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    setGameStarted(false)
    resetGame()
    setIsAIMode(false)
    setAiPlayer(null)
    setAiError(null)
    setAiStuck(false)
    triggerSound()
  }

  // Añadir una nueva función para colocar muros directamente sin cambiar el modo
  const placeWallDirectly = (x, z, orientation) => {
    const wallState = { ...state, wallMode: true }
    const newState = QuoridorLogic.placeWall(x, z, orientation, wallState)
    setState(newState)
    setHoveredWallPosition(null)
    setLastAction("wall")
    setSoundTrigger((prev) => prev + 1)
  }

  // Modificar la función placeWall para que no cambie el modo después de colocar un muro
  const placeWall = (x, z, orientation) => {
    const newState = QuoridorLogic.placeWall(x, z, orientation, state)
    setState(newState)
    setHoveredWallPosition(null)
    setLastAction("wall")
    setSoundTrigger((prev) => prev + 1)

    // Si estamos en modo IA y es el turno del jugador humano, mantener el modo muro activo
    if (isAIMode && newState.currentPlayer === 0) {
      setState((prevState) => ({
        ...prevState,
        wallMode: state.wallMode, // Mantener el mismo modo que antes
      }))
    }
  }

  // Make a move
  const makeMove = (x, z) => {
    const newState = QuoridorLogic.makeMove(x, z, state)
    setState(newState)
    setSelectedTile(null)
    setLastAction("movement")
    setSoundTrigger((prev) => prev + 1)
  }

  // Toggle wall mode
  const toggleWallMode = () => {
    setState((prevState) => ({
      ...prevState,
      wallMode: !prevState.wallMode,
    }))

    // Clear selections
    setSelectedTile(null)
    setHoveredWallPosition(null)
    setLastAction("click")
    triggerClickSound()
  }

  // Reset game
  const resetGame = () => {
    // Limpiar cualquier temporizador de la IA
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    setState(QuoridorLogic.createInitialGameState())
    setSelectedTile(null)
    setHoveredWallPosition(null)
    setLastAction("click")
    setAiError(null)
    setAiStuck(false)
    triggerClickSound()
  }

  // Toggle muted state
  const toggleMuted = () => {
    setIsMuted(!isMuted)
    setLastAction("click")
    triggerClickSound()
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    setLastAction("click")
    triggerClickSound()
  }

  // Trigger sound effect
  const triggerSound = () => {
    setSoundTrigger((prev) => prev + 1)
  }

  // Update any UI button click to trigger click sound
  const triggerClickSound = () => {
    setLastAction("click")
    setSoundTrigger((prev) => prev + 1)
  }

  // Create the game state object with methods
  const gameState = {
    ...state,
    isValidWallPlacement: (wallPos) => QuoridorLogic.isValidWallPlacement(wallPos, state),
    placeWall,
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        selectedTile,
        hoveredWallPosition,
        gameStarted,
        isMuted,
        isDarkMode,
        lastAction,
        soundTrigger,
        isAIMode,
        aiDifficulty,
        isAIThinking,
        aiError,
        aiStuck,
        setSelectedTile,
        setHoveredWallPosition,
        startGame,
        makeMove,
        placeWall,
        toggleWallMode,
        resetGame,
        toggleMuted,
        toggleDarkMode,
        returnToMenu,
        triggerSound,
        forceNextTurn,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}
