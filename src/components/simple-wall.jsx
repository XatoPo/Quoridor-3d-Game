"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

const WALL_THICKNESS = 0.1
const WALL_HEIGHT = 0.4
const WALL_LENGTH = 2

export default function SimpleWall({ position, orientation, isPlaced, isHovered = false, isValid = true }) {
  const ref = useRef()

  // Animate wall on hover
  useFrame((state) => {
    if (ref.current && isHovered) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05
    }
  })

  // Wall dimensions based on orientation
  const dimensions =
    orientation === "horizontal"
      ? [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS]
      : [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH]

  // Wall color based on state
  const color = isPlaced
    ? "#B19CD9" // Placed wall - pastel purple
    : isHovered
      ? isValid
        ? "#A8E6CF"
        : "#FFB7B2" // Valid: pastel green, Invalid: pastel red
      : "#F56565" // Default

  const opacity = isPlaced ? 1 : isHovered ? 0.8 : 0.5

  // Adjust position to align perfectly with grid
  const adjustedPosition = [
    position[0] + (orientation === "horizontal" ? 0 : 0),
    position[1],
    position[2] + (orientation === "vertical" ? 0 : 0),
  ]

  return (
    <group>
      {/* Main wall */}
      <mesh ref={ref} position={adjustedPosition} castShadow receiveShadow>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Highlight affected grid cells when hovering */}
      {isHovered && (
        <group>
          {/* First affected cell */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? -0.5 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? -0.5 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#A8E6CF" : "#FFB7B2"} transparent opacity={0.3} />
          </mesh>

          {/* Second affected cell */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? 0.5 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? 0.5 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#A8E6CF" : "#FFB7B2"} transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}
