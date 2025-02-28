"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

const WALL_THICKNESS = 0.1
const WALL_HEIGHT = 0.4
const WALL_LENGTH = 1.8 // Slightly shorter than 2 to avoid overlap

export default function SimpleWall({ position, orientation, isPlaced, isHovered = false, isValid = true, color }) {
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

  const opacity = isPlaced ? 1 : isHovered ? 0.8 : 0.5

  // Adjust position to align with the gaps between tiles
  const adjustedPosition = [
    position[0] + (orientation === "horizontal" ? 0.45 : 0),
    position[1],
    position[2] + (orientation === "vertical" ? 0.45 : 0),
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
              position[0] + (orientation === "vertical" ? -0.45 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? -0.45 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#86EFAC" : "#FCA5A5"} transparent opacity={0.3} />
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
            <meshBasicMaterial color={isValid ? "#86EFAC" : "#FCA5A5"} transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}

