"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"

export default function BoardTile({ position, tileX, tileZ, color, isSelected, isValidMove }) {
  const ref = useRef()
  const { setSelectedTile, makeMove, isDarkMode, triggerSound, lastAction, setLastAction } = useGameContext()

  // Enhanced tile animations
  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        // Pulsing effect for selected tile
        ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.2
        // Subtle rotation effect
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.03
      } else if (isValidMove) {
        // Gentle breathing effect for valid moves
        ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.05
        // No rotation for valid moves, just subtle height change
      } else {
        // Gradual return to normal
        ref.current.scale.y = ref.current.scale.y * 0.9 + 1 * 0.1
        ref.current.rotation.y = ref.current.rotation.y * 0.9
      }
    }
  })

  // Determine tile color based on state with more vibrant highlights
  const getTileColor = () => {
    if (isSelected) return isDarkMode ? "#991B1B" : "#FCA5A5" // Red for selected
    if (isValidMove) return isDarkMode ? "#065F46" : "#86EFAC" // Green for valid moves
    return color // Use provided color (including goal row colors)
  }

  // Update the handleClick to trigger movement sound for board tiles
  const handleClick = () => {
    if (isValidMove) {
      makeMove(tileX, tileZ)
      triggerSound() // Trigger movement sound
    } else {
      setSelectedTile({ x: tileX, z: tileZ })
      triggerSound() // Trigger regular click sound
    }
  }

  return (
    <mesh position={position} receiveShadow ref={ref} onClick={handleClick}>
      <boxGeometry args={[0.9, 0.1, 0.9]} />
      <meshStandardMaterial
        color={getTileColor()}
        roughness={0.7}
        metalness={0.1}
        emissive={isValidMove || isSelected ? getTileColor() : undefined}
        emissiveIntensity={isDarkMode ? (isValidMove || isSelected ? 0.3 : 0) : 0}
      />

      {/* Add subtle highlight effect for valid moves */}
      {isValidMove && (
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.9, 0.01, 0.9]} />
          <meshBasicMaterial
            color={isDarkMode ? "#10B981" : "#D1FAE5"}
            transparent
            opacity={0.6 + Math.sin(Date.now() * 0.003) * 0.2}
          />
        </mesh>
      )}
    </mesh>
  )
}
