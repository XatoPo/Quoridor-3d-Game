"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"

export default function BoardTile({ position, tileX, tileZ, color, isSelected, isValidMove }) {
  const ref = useRef()
  const { setSelectedTile, makeMove } = useGameContext()

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
    if (isSelected) return "#FCA5A5" // Light red for selected
    if (isValidMove) return "#86EFAC" // Light green for valid moves
    return color // Use provided color (including goal row colors)
  }

  const handleClick = () => {
    if (isValidMove) {
      makeMove(tileX, tileZ)
    } else {
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
