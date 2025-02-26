"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import BoardTile from "./board-tile"
import PlayerPiece from "./player-piece"
import SimpleWall from "./simple-wall"
import WallGrid from "./wall-grid"
import * as THREE from "three"
import { Vector3 } from "three"

export default function GameBoard() {
  const boardRef = useRef<THREE.Group>(null)
  const { gameState, selectedTile, hoveredWallPosition } = useGameContext()

  // Gentle board animation
  useFrame((state, delta) => {
    if (boardRef.current) {
      boardRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#F0E6E6" />
      </mesh>

      {/* Board grid */}
      {Array.from({ length: 9 }).map((_, x) =>
        Array.from({ length: 9 }).map((_, z) => (
          <BoardTile
            key={`${x}-${z}`}
            position={[x - 4, 0, z - 4]}
            tileX={x}
            tileZ={z}
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
        />
      )}

      {/* Player pieces */}
      <PlayerPiece
        position={new Vector3(gameState.players[0].x - 4, 0.5, gameState.players[0].z - 4)}
        color="#FFB6C1"
        isCurrentPlayer={gameState.currentPlayer === 0}
      />
      <PlayerPiece
        position={new Vector3(gameState.players[1].x - 4, 0.5, gameState.players[1].z - 4)}
        color="#ADD8E6"
        isCurrentPlayer={gameState.currentPlayer === 1}
      />

      {/* Wall counters - simplified */}
      <mesh position={[-5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[0].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 0 ? "#FFB6C1" : "#FFD6D6"} />
      </mesh>
      <mesh position={[5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[1].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 1 ? "#ADD8E6" : "#D6E6FF"} />
      </mesh>
    </group>
  )
}

