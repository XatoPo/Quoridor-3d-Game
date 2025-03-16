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

  // AI turn logic with improved error handling and fallback
  useEffect(() => {
    if (isAIMode && state.currentPlayer === 1 && state.winner === null && gameStarted) {
      // Limpiar cualquier temporizador anterior
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
        aiTimeoutRef.current = null
      }

      // Reiniciar contador de intentos
      aiRetryCountRef.current = 0

      // Añadir un pequeño retraso para que la IA parezca que está "pensando"
      setIsAIThinking(true)
      setAiError(null)

      const aiThinkingTime = aiDifficulty === "easy" ? 800 : aiDifficulty === "medium" ? 1200 : 1500 // Tiempo de "pensamiento" según dificultad

      const aiTimer = setTimeout(() => {
        try {
          makeAIMove()
        } catch (error) {
          console.error("Error en el turno de la IA:", error)
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
        console.warn("Temporizador de seguridad de la IA activado")
        setIsAIThinking(false)
        makeEmergencyAIMove()
      }, aiThinkingTime + 5000) // 5 segundos adicionales como máximo

      return () => {
        clearTimeout(aiTimer)
        if (aiTimeoutRef.current) {
          clearTimeout(aiTimeoutRef.current)
          aiTimeoutRef.current = null
        }
      }
    }
  }, [isAIMode, state.currentPlayer, state.winner, gameStarted])

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

  // Movimiento de emergencia para la IA cuando falla
  const makeEmergencyAIMove = () => {
    console.log("Ejecutando movimiento de emergencia para la IA")

    // Incrementar contador de intentos
    aiRetryCountRef.current += 1

    try {
      // Obtener todos los movimientos válidos para la IA
      const validMoves = QuoridorLogic.getValidMoves(1, state)

      if (validMoves.length > 0) {
        // Si hay movimientos válidos, elegir uno aleatorio
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        console.log("Movimiento de emergencia:", randomMove)
        makeMove(randomMove.x, randomMove.z)
        return
      }

      // Si no hay movimientos válidos, intentar colocar un muro aleatorio
      if (state.players[1].wallsLeft > 0) {
        // Intentar hasta 10 posiciones aleatorias
        for (let i = 0; i < 10; i++) {
          const x = Math.floor(Math.random() * 8)
          const z = Math.floor(Math.random() * 8)
          const orientation = Math.random() < 0.5 ? "horizontal" : "vertical"

          const wallPos = { x, z, orientation }

          if (QuoridorLogic.isValidWallPlacement(wallPos, state)) {
            console.log("Muro de emergencia:", wallPos)
            placeWallDirectly(x, z, orientation)
            return
          }
        }
      }

      // Si todavía estamos aquí y no hemos superado el máximo de intentos, intentar de nuevo
      if (aiRetryCountRef.current < MAX_AI_RETRIES) {
        console.log(`Reintentando movimiento de emergencia (intento ${aiRetryCountRef.current})`)
        setTimeout(makeEmergencyAIMove, 500)
        return
      }

      // Si todo falla, mostrar un error y pasar el turno
      console.error("No se pudo encontrar un movimiento válido para la IA")
      setAiError("La IA no pudo encontrar un movimiento válido")

      // Forzar el cambio de turno
      setState((prevState) => ({
        ...prevState,
        currentPlayer: 0,
        validMoves: QuoridorLogic.getValidMoves(0, prevState),
      }))
    } catch (error) {
      console.error("Error en el movimiento de emergencia:", error)
      setAiError("Error crítico en la IA: " + error.message)

      // Forzar el cambio de turno como último recurso
      setState((prevState) => ({
        ...prevState,
        currentPlayer: 0,
        validMoves: QuoridorLogic.getValidMoves(0, prevState),
      }))
    }
  }

  // Modificar la función makeAIMove para manejar correctamente el modo muro
  const makeAIMove = () => {
    if (!aiPlayer || !isAIMode) return

    // Limpiar el temporizador de seguridad
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    try {
      // Obtener la decisión de la IA
      const aiDecision = aiPlayer.makeDecision({ ...state, wallMode: false }) // Forzar a que la IA decida independientemente del modo muro

      if (!aiDecision) {
        throw new Error("La IA no pudo tomar una decisión")
      }

      console.log("Decisión de la IA:", aiDecision)

      // Ejecutar la acción de la IA
      if (aiDecision.type === "move") {
        makeMove(aiDecision.x, aiDecision.z)
      } else if (aiDecision.type === "wall") {
        // Colocar el muro directamente sin cambiar el modo
        placeWallDirectly(aiDecision.x, aiDecision.z, aiDecision.orientation)
      }
    } catch (error) {
      console.error("Error en makeAIMove:", error)
      throw error // Propagar el error para que se maneje en el efecto
    }
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
    triggerSound()
  }

  // Añadir una nueva función para colocar muros directamente sin cambiar el modo
  const placeWallDirectly = (x, z, orientation) => {
    const newState = QuoridorLogic.placeWall(x, z, orientation, state)
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
