"use client"

import { useRef } from "react"
import { useGameContext } from "../context/game-context"
import BoardTile from "./board-tile"
import PlayerPiece from "./player-piece"
import SimpleWall from "./simple-wall"
import WallGrid from "./wall-grid"
import { Vector3 } from "three"

// Updated color palette
const COLORS = {
  board: {
    light: "#E2E8F0", // Light gray
    dark: "#CBD5E1", // Darker gray
    p1Goal: "#FEE2E2", // Light red for player 1 goal
    p2Goal: "#DBEAFE", // Light blue for player 2 goal
    base: "#F8FAFC", // Off-white base
  },
  players: {
    p1: "#EF4444", // Vibrant red
    p2: "#3B82F6", // Vibrant blue
  },
  walls: {
    placed: "#6B21A8", // Deep purple
    preview: {
      valid: "#22C55E", // Green
      invalid: "#DC2626", // Red
    },
  },
}

export default function GameBoard() {
  const boardRef = useRef()
  const { gameState, selectedTile, hoveredWallPosition } = useGameContext()

  // Helper to determine tile color
  const getTileColor = (x, z) => {
    if (z === 0) return COLORS.board.p1Goal // Player 1 goal row
    if (z === 8) return COLORS.board.p2Goal // Player 2 goal row
    return (x + z) % 2 === 0 ? COLORS.board.light : COLORS.board.dark
  }

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color={COLORS.board.base} />
      </mesh>

      {/* Board grid */}
      {Array.from({ length: 9 }).map((_, x) =>
        Array.from({ length: 9 }).map((_, z) => (
          <BoardTile
            key={`${x}-${z}`}
            position={[x - 4, 0, z - 4]}
            tileX={x}
            tileZ={z}
            color={getTileColor(x, z)}
            isSelected={selectedTile?.x === x && selectedTile?.z === z}
            isValidMove={gameState.validMoves.some((move) => move.x === x && move.z === z)}
          />
        )),
      )}

      {/* Wall placement grid */}
      <WallGrid />

      {/* Placed walls */}
      {gameState.walls.map((wall, index) => (
        <SimpleWall
          key={`wall-${index}`}
          position={[wall.x - 4, 0.5, wall.z - 4]}
          orientation={wall.orientation}
          isPlaced={true}
          color={COLORS.walls.placed}
        />
      ))}

      {/* Hovered wall preview */}
      {hoveredWallPosition && (
        <SimpleWall
          position={[hoveredWallPosition.x - 4, 0.5, hoveredWallPosition.z - 4]}
          orientation={hoveredWallPosition.orientation}
          isPlaced={false}
          isHovered={true}
          isValid={gameState.isValidWallPlacement(hoveredWallPosition)}
          color={
            gameState.isValidWallPlacement(hoveredWallPosition)
              ? COLORS.walls.preview.valid
              : COLORS.walls.preview.invalid
          }
        />
      )}

      {/* Player pieces */}
      <PlayerPiece
        position={new Vector3(gameState.players[0].x - 4, 0.5, gameState.players[0].z - 4)}
        color={COLORS.players.p1}
        isCurrentPlayer={gameState.currentPlayer === 0}
      />
      <PlayerPiece
        position={new Vector3(gameState.players[1].x - 4, 0.5, gameState.players[1].z - 4)}
        color={COLORS.players.p2}
        isCurrentPlayer={gameState.currentPlayer === 1}
      />

      {/* Wall counters */}
      <mesh position={[-5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[0].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 0 ? COLORS.players.p1 : "#FCA5A5"} />
      </mesh>
      <mesh position={[5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[1].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 1 ? COLORS.players.p2 : "#93C5FD"} />
      </mesh>
    </group>
  )
}
