"use client"

import { createContext, useContext, useState, useEffect } from "react"
import * as QuoridorLogic from "../logic/quoridor-logic"

// Create context
const GameContext = createContext(undefined)

// Provider component
export function GameProvider({ children }) {
  const [selectedTile, setSelectedTile] = useState(null)
  const [hoveredWallPosition, setHoveredWallPosition] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Modificar la inicialización del estado isMuted para que comience en true (sonido apagado)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [soundTrigger, setSoundTrigger] = useState(0)

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

  // Start game
  const startGame = () => {
    setGameStarted(true)
    setLastAction("click")
  }

  // Return to menu
  const returnToMenu = () => {
    setGameStarted(false)
    resetGame()
    triggerSound()
  }

  // Make a move
  const makeMove = (x, z) => {
    const newState = QuoridorLogic.makeMove(x, z, state)
    setState(newState)
    setSelectedTile(null)
    setLastAction("move")
    setSoundTrigger((prev) => prev + 1) // Añadir esta línea
  }

  // Place a wall
  const placeWall = (x, z, orientation) => {
    const newState = QuoridorLogic.placeWall(x, z, orientation, state)
    setState(newState)
    setHoveredWallPosition(null)
    setLastAction("wall")
    setSoundTrigger((prev) => prev + 1) // Añadir esta línea
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
  }

  // Reset game
  const resetGame = () => {
    setState(QuoridorLogic.createInitialGameState())
    setSelectedTile(null)
    setHoveredWallPosition(null)
    setLastAction("click")
  }

  // Toggle muted state
  const toggleMuted = () => {
    setIsMuted(!isMuted)
    setLastAction("click")
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    setLastAction("click")
  }

  // Trigger sound effect
  const triggerSound = () => {
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
