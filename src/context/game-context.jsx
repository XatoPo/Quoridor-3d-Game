"use client"

import { createContext, useContext, useState, useEffect } from "react"
import * as QuoridorLogic from "../logic/quoridor-logic"

// Create context
const GameContext = createContext(undefined)

// Provider component
export function GameProvider({ children }) {
  const [selectedTile, setSelectedTile] = useState(null)
  const [hoveredWallPosition, setHoveredWallPosition] = useState(null)

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

  // Make a move
  const makeMove = (x, z) => {
    const newState = QuoridorLogic.makeMove(x, z, state)
    setState(newState)
    setSelectedTile(null)
  }

  // Place a wall
  const placeWall = (x, z, orientation) => {
    const newState = QuoridorLogic.placeWall(x, z, orientation, state)
    setState(newState)
    setHoveredWallPosition(null)
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
  }

  // Reset game
  const resetGame = () => {
    setState(QuoridorLogic.createInitialGameState())
    setSelectedTile(null)
    setHoveredWallPosition(null)
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
        setSelectedTile,
        setHoveredWallPosition,
        makeMove,
        placeWall,
        toggleWallMode,
        resetGame,
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

