"use client"

import { useRef } from "react"
import { useGameContext } from "../context/game-context"
import BoardTile from "./board-tile"
import PlayerPiece from "./player-piece"
import SimpleWall from "./simple-wall"
import WallGrid from "./wall-grid"
import AnimatedBackground from "./animated-background"
import ConfettiEffect from "./confetti-effect"
import { Vector3 } from "three"
import * as THREE from "three";


// Updated color palette
const COLORS = {
  board: {
    light: "#E2E8F0", // Light gray
    dark: "#CBD5E1", // Darker gray
    p1Goal: "#FEE2E2", // Light red for player 1 goal
    p2Goal: "#DBEAFE", // Light blue for player 2 goal
    base: "#F8FAFC", // Off-white base
    darkMode: {
      light: "#1E293B", // Dark slate gray
      dark: "#0F172A", // Darker slate
      p1Goal: "#7F1D1D", // Dark red
      p2Goal: "#1E3A8A", // Dark blue
      base: "#0F172A", // Dark slate
    },
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
  const { gameState, selectedTile, hoveredWallPosition, isDarkMode } = useGameContext()

  // Helper to determine tile color with dark mode support
  const getTileColor = (x, z) => {
    const colors = isDarkMode ? COLORS.board.darkMode : COLORS.board

    if (z === 0) return colors.p1Goal // Player 1 goal row
    if (z === 8) return colors.p2Goal // Player 2 goal row
    return (x + z) % 2 === 0 ? colors.light : colors.dark
  }

  return (
    <group ref={boardRef}>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Board base */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color={isDarkMode ? COLORS.board.darkMode.base : COLORS.board.base} roughness={0.7} />
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
          position={[
            wall.x - 4 + (wall.orientation === "vertical" ? 0.5 : 0),
            0.5,
            wall.z - 4 + (wall.orientation === "horizontal" ? 0.5 : 0),
          ]}
          orientation={wall.orientation}
          isPlaced={true}
          color={COLORS.walls.placed}
        />
      ))}

      {/* Hovered wall preview */}
      {hoveredWallPosition && (
        <SimpleWall
          position={[
            hoveredWallPosition.x - 4 + (hoveredWallPosition.orientation === "vertical" ? 0.5 : 0),
            0.5,
            hoveredWallPosition.z - 4 + (hoveredWallPosition.orientation === "horizontal" ? 0.5 : 0),
          ]}
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
        position={new Vector3(gameState.players[0].x - 4, 0.3, gameState.players[0].z - 4)}
        color={COLORS.players.p1}
        isCurrentPlayer={gameState.currentPlayer === 0}
      />
      <PlayerPiece
        position={new Vector3(gameState.players[1].x - 4, 0.3, gameState.players[1].z - 4)}
        color={COLORS.players.p2}
        isCurrentPlayer={gameState.currentPlayer === 1}
      />

      {/* Wall counters with improved visuals */}
      <group position={[-5, 0.5, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={isDarkMode ? "#27272A" : "#F1F5F9"} roughness={0.7} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 0.1, 1)]} />
            <lineBasicMaterial color={isDarkMode ? "#F1F5F9" : "#27272A"} />
          </lineSegments>
        </mesh>
        {Array.from({ length: gameState.players[0].wallsLeft }).map((_, i) => (
          <group key={`wall-counter-p1-${i}`} position={[0, 0.05 + i * 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial
                color={gameState.currentPlayer === 0 ? COLORS.players.p1 : "#FCA5A5"}
                roughness={0.7}
                emissive={gameState.currentPlayer === 0 ? COLORS.players.p1 : "#FCA5A5"}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.08, 0.8)]} />
              <lineBasicMaterial color={isDarkMode ? "#27272A" : "#F1F5F9"} />
            </lineSegments>
          </group>
        ))}
      </group>

      <group position={[5, 0.5, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={isDarkMode ? "#27272A" : "#F1F5F9"} roughness={0.7} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 0.1, 1)]} />
            <lineBasicMaterial color={isDarkMode ? "#F1F5F9" : "#27272A"} />
          </lineSegments>
        </mesh>
        {Array.from({ length: gameState.players[1].wallsLeft }).map((_, i) => (
          <group key={`wall-counter-p2-${i}`} position={[0, 0.05 + i * 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial
                color={gameState.currentPlayer === 1 ? COLORS.players.p2 : "#93C5FD"}
                roughness={0.7}
                emissive={gameState.currentPlayer === 1 ? COLORS.players.p2 : "#93C5FD"}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.08, 0.8)]} />
              <lineBasicMaterial color={isDarkMode ? "#27272A" : "#F1F5F9"} />
            </lineSegments>
          </group>
        ))}
      </group>

      {/* Victory confetti effect */}
      {gameState.winner !== null && <ConfettiEffect />}
    </group>
  )
}
