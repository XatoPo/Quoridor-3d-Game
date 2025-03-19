"use client"

import { useRef, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

export default function BoardTile({ position, tileX, tileZ, color, isSelected, isValidMove }) {
  const ref = useRef()
  const { setSelectedTile, makeMove, isDarkMode, triggerSound, isAIMode, isAIThinking, gameState } = useGameContext()

  // Enhanced tile animations - more subtle
  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        // Pulsing effect for selected tile - reduced
        ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.1
      } else if (isValidMove) {
        // Gentle breathing effect for valid moves - reduced
        ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03 + 0.03
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
  const handleClick = useCallback(() => {
    // Deshabilitar clicks durante el turno de la IA o cuando está pensando
    if (isAIMode && (gameState.currentPlayer === 1 || isAIThinking)) {
      return
    }

    if (isValidMove) {
      makeMove(tileX, tileZ)
      triggerSound() // Trigger movement sound
    } else {
      setSelectedTile({ x: tileX, z: tileZ })
      triggerSound() // Trigger regular click sound
    }
  }, [isValidMove, makeMove, setSelectedTile, triggerSound, tileX, tileZ, isAIMode, isAIThinking, gameState])

  return (
    <group position={position}>
      <mesh receiveShadow ref={ref} onClick={handleClick}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial
          color={getTileColor()}
          roughness={0.7}
          metalness={0.1}
          emissive={isValidMove || isSelected ? getTileColor() : undefined}
          emissiveIntensity={isDarkMode ? (isValidMove || isSelected ? 0.2 : 0) : 0}
        />
      </mesh>

      {/* Separate mesh for the border to avoid affecting click behavior */}
      <lineSegments renderOrder={1} position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.9, 0.1, 0.9)]} />
        <lineBasicMaterial color={isDarkMode ? "#94A3B8" : "#475569"} transparent opacity={0.5} />
      </lineSegments>

      {/* Add subtle highlight effect for valid moves */}
      {isValidMove && (
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.9, 0.01, 0.9]} />
          <meshBasicMaterial
            color={isDarkMode ? "#10B981" : "#D1FAE5"}
            transparent
            opacity={0.3 + Math.sin(Date.now() * 0.002) * 0.1}
          />
        </mesh>
      )}

      {/* Add subtle light for valid moves in dark mode only */}
      {isValidMove && isDarkMode && (
        <pointLight position={[0, 0.2, 0]} intensity={0.3} distance={0.8} color={"#10B981"} />
      )}
    </group>
  )
}
