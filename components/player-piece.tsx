"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3, Group } from "three"
import * as THREE from "three"

interface PlayerPieceProps {
  position: Vector3
  color: string
  isCurrentPlayer: boolean
}

export default function PlayerPiece({ position, color, isCurrentPlayer }: PlayerPieceProps) {
  const ref = useRef<THREE.Group>(null)
  const targetPosition = useRef(new Vector3(position.x, position.y, position.z))

  // Update target position when position prop changes
  useEffect(() => {
    targetPosition.current = new Vector3(position.x, position.y, position.z)
  }, [position])

  // Animate piece movement and hover effect
  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth movement to target position
      ref.current.position.lerp(targetPosition.current, 0.1)

      // Hover animation for current player's piece
      if (isCurrentPlayer) {
        ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.1
        ref.current.rotation.y += delta * 2
      } else {
        ref.current.rotation.y += delta * 0.5
      }
    }
  })

  return (
    <group ref={ref} position={[position.x, position.y, position.z]} scale={isCurrentPlayer ? 1.2 : 1}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {isCurrentPlayer && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FDFD96" emissive="#FDFD96" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

