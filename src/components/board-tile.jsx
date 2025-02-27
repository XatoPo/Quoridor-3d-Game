"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"

export default function BoardTile({ position, tileX, tileZ, isSelected, isValidMove }) {
  const ref = useRef()
  const { setSelectedTile, gameState, makeMove } = useGameContext()

  // Animate tile on hover or selection
  useFrame(() => {
    if (ref.current) {
      if (isSelected) {
        ref.current.scale.y = 1.2
      } else if (isValidMove) {
        ref.current.scale.y = 1.1
      } else {
        ref.current.scale.y = 1
      }
    }
  })

  // Determine tile color based on state
  const getTileColor = () => {
    if (isSelected) return "#FFD3B6" // Pastel orange for selected
    if (isValidMove) return "#A8E6CF" // Pastel green for valid moves
    return (tileX + tileZ) % 2 === 0 ? "#FDFFCD" : "#D4F0F0" // Pastel checkerboard pattern
  }

  const handleClick = () => {
    // If it's a valid move, make the move
    if (isValidMove) {
      makeMove(tileX, tileZ)
    } else {
      // Otherwise just select the tile
      setSelectedTile({ x: tileX, z: tileZ })
    }
  }

  return (
    <mesh position={position} receiveShadow ref={ref} onClick={handleClick}>
      <boxGeometry args={[0.9, 0.1, 0.9]} />
      <meshStandardMaterial color={getTileColor()} />
    </mesh>
  )
}

