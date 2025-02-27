"use client"

import { createContext, useContext, useState } from "react"

// Create context
const GameContext = createContext(undefined)

// Provider component
export function GameProvider({ children }) {
  const [selectedTile, setSelectedTile] = useState(null)
  const [hoveredWallPosition, setHoveredWallPosition] = useState(null)

  // Initial game state
  const initialState = {
    players: [
      { x: 4, z: 0, wallsLeft: 10 }, // Player 1 (red)
      { x: 4, z: 8, wallsLeft: 10 }, // Player 2 (blue)
    ],
    currentPlayer: 0,
    walls: [],
    wallMode: false,
    validMoves: [
      { x: 3, z: 0 },
      { x: 5, z: 0 },
      { x: 4, z: 1 },
    ],
    winner: null,
  }

  const [state, setState] = useState(initialState)

  // Calculate valid moves for current player
  const calculateValidMoves = (players, walls, currentPlayer) => {
    const player = players[currentPlayer]
    const opponent = players[currentPlayer === 0 ? 1 : 0]

    // Basic orthogonal moves
    const potentialMoves = [
      { x: player.x + 1, z: player.z },
      { x: player.x - 1, z: player.z },
      { x: player.x, z: player.z + 1 },
      { x: player.x, z: player.z - 1 },
    ]

    // Filter moves that are within the board
    return potentialMoves.filter((move) => {
      // Check if move is within board boundaries
      if (move.x < 0 || move.x > 8 || move.z < 0 || move.z > 8) {
        return false
      }

      // Check if move is blocked by a wall
      const isBlockedByWall = walls.some((wall) => {
        if (wall.orientation === "horizontal") {
          // Horizontal wall blocks vertical movement
          if (
            (player.x === wall.x || player.x === wall.x + 1) &&
            ((player.z === wall.z && move.z === wall.z - 1) || (player.z === wall.z - 1 && move.z === wall.z))
          ) {
            return true
          }
        } else {
          // Vertical wall blocks horizontal movement
          if (
            (player.z === wall.z || player.z === wall.z + 1) &&
            ((player.x === wall.x && move.x === wall.x - 1) || (player.x === wall.x - 1 && move.x === wall.x))
          ) {
            return true
          }
        }
        return false
      })

      if (isBlockedByWall) {
        return false
      }

      // Check if move is occupied by opponent
      if (move.x === opponent.x && move.z === opponent.z) {
        return false
      }

      return true
    })
  }

  // Simplified BFS algorithm to check if there's a path to the goal
  const hasPathToGoal = (player, playerIndex, walls) => {
    // Define the goal row based on player index
    const goalZ = playerIndex === 0 ? 8 : 0

    // Create a queue for BFS
    const queue = [{ x: player.x, z: player.z }]

    // Create a set to track visited positions
    const visited = new Set()
    visited.add(`${player.x},${player.z}`)

    // BFS algorithm
    while (queue.length > 0) {
      const current = queue.shift()

      // Check if we've reached the goal row
      if (current.z === goalZ) {
        return true
      }

      // Check all four possible moves
      const moves = [
        { x: current.x + 1, z: current.z }, // Right
        { x: current.x - 1, z: current.z }, // Left
        { x: current.x, z: current.z + 1 }, // Down
        { x: current.x, z: current.z - 1 }, // Up
      ]

      for (const move of moves) {
        // Skip if out of bounds
        if (move.x < 0 || move.x > 8 || move.z < 0 || move.z > 8) {
          continue
        }

        // Skip if already visited
        const moveKey = `${move.x},${move.z}`
        if (visited.has(moveKey)) {
          continue
        }

        // Check if move is blocked by a wall
        let isBlocked = false
        for (const wall of walls) {
          if (wall.orientation === "horizontal") {
            // Horizontal wall blocks vertical movement
            if (
              (current.x === wall.x || current.x === wall.x + 1) &&
              ((current.z === wall.z && move.z === wall.z - 1) || (current.z === wall.z - 1 && move.z === wall.z))
            ) {
              isBlocked = true
              break
            }
          } else {
            // Vertical wall blocks horizontal movement
            if (
              (current.z === wall.z || current.z === wall.z + 1) &&
              ((current.x === wall.x && move.x === wall.x - 1) || (current.x === wall.x - 1 && move.x === wall.x))
            ) {
              isBlocked = true
              break
            }
          }
        }

        if (!isBlocked) {
          visited.add(moveKey)
          queue.push(move)
        }
      }
    }

    // If we've exhausted all possibilities without reaching the goal
    return false
  }

  // Check if walls overlap
  const doWallsOverlap = (wall1, wall2) => {
    if (wall1.orientation === wall2.orientation) {
      if (wall1.orientation === "horizontal") {
        return wall1.z === wall2.z && Math.abs(wall1.x - wall2.x) < 1
      } else {
        return wall1.x === wall2.x && Math.abs(wall1.z - wall2.z) < 1
      }
    } else {
      if (wall1.orientation === "horizontal") {
        return (
          wall1.x === wall2.x - 0.5 &&
          wall1.z === wall2.z + 0.5
        )
      } else {
        return (
          wall1.x === wall2.x + 0.5 &&
          wall1.z === wall2.z - 0.5
        )
      }
    }
  }

  // Check if a wall placement is valid
  const isValidWallPlacement = (wallPos) => {
    const { x, z, orientation } = wallPos

    // Check if wall is within board boundaries
    if (orientation === "horizontal") {
      if (x < 0 || x > 7.5 || z <= 0 || z > 8) {
        return false
      }
    } else {
      if (x <= 0 || x > 8 || z < 0 || z > 7.5) {
        return false
      }
    }

    // Check if wall overlaps with existing walls
    const overlapsExisting = state.walls.some((wall) => doWallsOverlap(wall, wallPos))

    if (overlapsExisting) {
      return false
    }

    // Check if player has walls left
    if (state.players[state.currentPlayer].wallsLeft <= 0) {
      return false
    }

    // Check if the wall would block all paths to the goal for either player
    const tempWalls = [...state.walls, wallPos]

    try {
      // Check path for player 1
      if (!hasPathToGoal(state.players[0], 0, tempWalls)) {
        return false
      }

      // Check path for player 2
      if (!hasPathToGoal(state.players[1], 1, tempWalls)) {
        return false
      }
    } catch (error) {
      console.error("Error in path finding:", error)
      return false
    }

    return true
  }

  // Make a move
  const makeMove = (x, z) => {
    if (state.winner !== null || state.wallMode) return

    // Check if the move is valid
    if (!state.validMoves.some((move) => move.x === x && move.z === z)) {
      return
    }

    // Update player position
    const newPlayers = [...state.players]
    newPlayers[state.currentPlayer] = {
      ...newPlayers[state.currentPlayer],
      x,
      z,
    }

    // Check win condition
    let winner = null
    if (state.currentPlayer === 0 && z === 8) {
      winner = 0 // Player 1 wins
    } else if (state.currentPlayer === 1 && z === 0) {
      winner = 1 // Player 2 wins
    }

    // Switch to next player
    const nextPlayer = state.currentPlayer === 0 ? 1 : 0

    // Calculate valid moves for next player
    const validMoves = calculateValidMoves(newPlayers, state.walls, nextPlayer)

    setState({
      ...state,
      players: newPlayers,
      currentPlayer: nextPlayer,
      validMoves,
      winner,
    })

    // Clear selection
    setSelectedTile(null)
  }

  // Place a wall
  const placeWall = (x, z, orientation) => {
    if (state.winner !== null || !state.wallMode) return
  
    const wallPos = { x, z, orientation }
  
    // Check if wall placement is valid
    if (!isValidWallPlacement(wallPos)) {
      return
    }
  
    // Update walls and player's wall count
    const newWalls = [...state.walls, wallPos]
    const newPlayers = [...state.players]
    newPlayers[state.currentPlayer] = {
      ...newPlayers[state.currentPlayer],
      wallsLeft: newPlayers[state.currentPlayer].wallsLeft - 1,
    }
  
    // Switch to next player
    const nextPlayer = state.currentPlayer === 0 ? 1 : 0
  
    // Calculate valid moves for next player
    const validMoves = calculateValidMoves(newPlayers, newWalls, nextPlayer)
  
    setState({
      ...state,
      players: newPlayers,
      walls: newWalls,
      currentPlayer: nextPlayer,
      validMoves,
    })
  
    // Clear selection
    setHoveredWallPosition(null)
  }

  // Toggle wall mode
  const toggleWallMode = () => {
    setState({
      ...state,
      wallMode: !state.wallMode,
    })

    // Clear selections
    setSelectedTile(null)
    setHoveredWallPosition(null)
  }

  // Reset game
  const resetGame = () => {
    setState(initialState)
    setSelectedTile(null)
    setHoveredWallPosition(null)
  }

  // Create the game state object with methods
  const gameState = {
    ...state,
    isValidWallPlacement,
    setHoveredWallPosition,
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

