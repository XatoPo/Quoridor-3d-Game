"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

const WALL_THICKNESS = 0.1
const WALL_HEIGHT = 0.4
const WALL_LENGTH = 1.8 // Slightly shorter than 2 to avoid overlap

export default function SimpleWall({ position, orientation, isPlaced, isHovered = false, isValid = true, color }) {
  const ref = useRef()
  const { isDarkMode } = useGameContext()
  const initialY = position[1]

  // Enhanced animation for walls
  useFrame((state) => {
    if (ref.current) {
      if (isHovered) {
        // More dynamic hover animation
        ref.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 3) * 0.08

        // Slight rotation effect for hover
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.03

        // Scale pulse effect for invalid placements
        if (!isValid) {
          ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1
        }
      } else if (isPlaced) {
        // Small settling animation for newly placed walls
        const age = state.clock.elapsedTime % 1000 // Avoid growing too large
        const isNew = age < 0.5

        if (isNew) {
          // Settling bounce effect
          const bounceHeight = Math.max(0, 0.2 * (1 - age * 2))
          ref.current.position.y = initialY + bounceHeight

          // Slight scale effect
          const scaleEffect = 1 + Math.max(0, 0.2 * (1 - age * 2))
          ref.current.scale.x = orientation === "horizontal" ? scaleEffect : 1
          ref.current.scale.z = orientation === "vertical" ? scaleEffect : 1
        } else {
          // Reset to normal
          ref.current.position.y = initialY
          ref.current.scale.x = 1
          ref.current.scale.z = 1
        }
      }
    }
  })

  // Wall dimensions based on orientation
  const dimensions =
    orientation === "horizontal"
      ? [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS]
      : [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH]

  const opacity = isPlaced ? 1 : isHovered ? 0.8 : 0.5

  // Adjust position to align with the gaps between tiles
  const adjustedPosition = [
    position[0] + (orientation === "horizontal" ? 0.45 : 0),
    position[1],
    position[2] + (orientation === "vertical" ? 0.45 : 0),
  ]

  return (
    <group>
      {/* Main wall with enhanced material */}
      <mesh ref={ref} position={adjustedPosition} castShadow receiveShadow>
        <boxGeometry args={[dimensions[0], dimensions[1], dimensions[2]]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.6}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
          <lineBasicMaterial color={isDarkMode ? "#94A3B8" : "#475569"} transparent opacity={0.8} />
        </lineSegments>
      </mesh>

      {/* Add subtle glowing effect for placed walls in dark mode */}
      {isPlaced && isDarkMode && (
        <mesh position={adjustedPosition}>
          <boxGeometry args={dimensions.map((d) => d * 1.05)} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Highlight affected grid cells when hovering */}
      {isHovered && (
        <group>
          {/* First affected cell */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? -0.45 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? -0.45 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#86EFAC" : "#FCA5A5"} transparent opacity={0.4} toneMapped={false} />
          </mesh>

          {/* Second affected cell */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? 0.45 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? 0.45 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#86EFAC" : "#FCA5A5"} transparent opacity={0.4} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}
