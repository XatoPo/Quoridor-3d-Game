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
import * as THREE from "three"

// Paleta de colores mejorada con mayor contraste y coherencia visual
const COLORS = {
  board: {
    light: "#E5E9F0", // Gris claro más suave
    dark: "#D8DEE9", // Gris más oscuro con tono azulado
    p1Goal: "#FFCDD2", // Rojo claro más suave para meta del jugador 1
    p2Goal: "#BBDEFB", // Azul claro más suave para meta del jugador 2
    base: "#ECEFF4", // Base blanca con tono azulado
    darkMode: {
      light: "#2E3440", // Gris oscuro con tono azulado
      dark: "#1E2430", // Gris más oscuro para contraste
      p1Goal: "#5E2A2A", // Rojo oscuro para meta del jugador 1
      p2Goal: "#2A3F5E", // Azul oscuro para meta del jugador 2
      base: "#1A1E27", // Base oscura con tono azulado
    },
  },
  players: {
    p1: "#EF5350", // Rojo vibrante
    p2: "#42A5F5", // Azul vibrante
  },
  walls: {
    p1: "#EF5350", // Rojo para muros del jugador 1
    p2: "#42A5F5", // Azul para muros del jugador 2
    preview: {
      valid: "#66BB6A", // Verde para muros válidos
      invalid: "#EF5350", // Rojo para muros inválidos
    },
  },
}

export default function GameBoard() {
  const boardRef = useRef()
  const { gameState, selectedTile, hoveredWallPosition, isDarkMode } = useGameContext()

  // Función para determinar el color de la casilla con soporte para modo oscuro
  const getTileColor = (x, z) => {
    const colors = isDarkMode ? COLORS.board.darkMode : COLORS.board

    if (z === 0) return colors.p1Goal // Fila meta del jugador 1
    if (z === 8) return colors.p2Goal // Fila meta del jugador 2
    return (x + z) % 2 === 0 ? colors.light : colors.dark
  }

  return (
    <group ref={boardRef}>
      {/* Fondo animado */}
      <AnimatedBackground />

      {/* Base del tablero mejorada */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[10, 0.3, 10]} />
        <meshStandardMaterial
          color={isDarkMode ? COLORS.board.darkMode.base : COLORS.board.base}
          roughness={0.7}
          metalness={0.1}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(10, 0.3, 10)]} />
          <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} linewidth={1.5} />
        </lineSegments>
      </mesh>

      {/* Cuadrícula del tablero mejorada */}
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

      {/* Cuadrícula para colocación de muros */}
      <WallGrid />

      {/* Muros colocados con colores por jugador */}
      {gameState.walls.map((wall, index) => {
        // Determinar el color del muro según el jugador que lo colocó
        // Si el índice es par, lo colocó el jugador 1 (rojo), si es impar, el jugador 2 (azul)
        const wallColor = index % 2 === 0 ? COLORS.walls.p1 : COLORS.walls.p2

        return (
          <SimpleWall
            key={`wall-${index}`}
            position={[
              wall.x - 4 + (wall.orientation === "vertical" ? 0.5 : 0),
              0.5,
              wall.z - 4 + (wall.orientation === "horizontal" ? 0.5 : 0),
            ]}
            orientation={wall.orientation}
            isPlaced={true}
            color={wallColor}
            playerIndex={index % 2}
          />
        )
      })}

      {/* Vista previa del muro al pasar el cursor */}
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
          playerIndex={gameState.currentPlayer}
        />
      )}

      {/* Fichas de los jugadores */}
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

      {/* Contadores de muros con visuales mejorados */}
      <group position={[-5, 0.5, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={isDarkMode ? "#2E3440" : "#ECEFF4"} roughness={0.7} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 0.1, 1)]} />
            <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} />
          </lineSegments>
        </mesh>
        {Array.from({ length: gameState.players[0].wallsLeft }).map((_, i) => (
          <group key={`wall-counter-p1-${i}`} position={[0, 0.05 + i * 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial
                color={gameState.currentPlayer === 0 ? COLORS.players.p1 : "#FFCDD2"}
                roughness={0.7}
                emissive={gameState.currentPlayer === 0 ? COLORS.players.p1 : "#FFCDD2"}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.08, 0.8)]} />
              <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} />
            </lineSegments>
          </group>
        ))}
      </group>

      <group position={[5, 0.5, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={isDarkMode ? "#2E3440" : "#ECEFF4"} roughness={0.7} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 0.1, 1)]} />
            <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} />
          </lineSegments>
        </mesh>
        {Array.from({ length: gameState.players[1].wallsLeft }).map((_, i) => (
          <group key={`wall-counter-p2-${i}`} position={[0, 0.05 + i * 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial
                color={gameState.currentPlayer === 1 ? COLORS.players.p2 : "#BBDEFB"}
                roughness={0.7}
                emissive={gameState.currentPlayer === 1 ? COLORS.players.p2 : "#BBDEFB"}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.08, 0.8)]} />
              <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} />
            </lineSegments>
          </group>
        ))}
      </group>

      {/* Efecto de confeti para la victoria */}
      {gameState.winner !== null && <ConfettiEffect />}

      {/* Luces adicionales para mejorar la visibilidad en modo oscuro */}
      {isDarkMode && <ambientLight intensity={0.3} />}
    </group>
  )
}

