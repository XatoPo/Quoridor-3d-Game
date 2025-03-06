"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { useGameContext } from "../context/game-context"

export default function PlayerPiece({ position, color, isCurrentPlayer }) {
  const ref = useRef()
  const targetPosition = useRef(new Vector3(position.x, position.y, position.z))
  const previousPosition = useRef(new Vector3(position.x, position.y, position.z))
  const { isDarkMode } = useGameContext()

  // Update target position when position prop changes
  useEffect(() => {
    previousPosition.current.copy(ref.current.position)
    targetPosition.current = new Vector3(position.x, position.y, position.z)
  }, [position])

  // Animate piece movement and hover effect
  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth movement to target position with more dynamic easing
      const t = Math.min(0.1 + delta * 2, 1)
      ref.current.position.lerp(targetPosition.current, t)

      // Determine if the piece is currently moving
      const isMoving = previousPosition.current.distanceTo(targetPosition.current) > 0.01

      // More dynamic hover animation for current player's piece
      if (isCurrentPlayer) {
        ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.15 + 0.1
        ref.current.rotation.y += delta * (isMoving ? 4 : 2)
      } else {
        // Subtle animation for non-current player
        ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.05 + 0.05
        ref.current.rotation.y += delta * 0.5
      }

      // If the piece is moving, add a little bounce at the end
      if (isMoving && ref.current.position.distanceTo(targetPosition.current) < 0.1) {
        ref.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.05
      }
    }
  })

  // Enhanced model for player pieces with lighting adjustments for dark mode
  return (
    <group ref={ref} position={[position.x, position.y, position.z]} scale={isCurrentPlayer ? 1.2 : 1}>
      {/* Base de la ficha */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
          emissive={color}
          emissiveIntensity={isDarkMode ? 0.2 : 0}
        />
      </mesh>

      {/* Cuerpo del personaje */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          emissive={color}
          emissiveIntensity={isDarkMode ? 0.15 : 0}
        />
      </mesh>

      {/* Cabeza */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          emissive={color}
          emissiveIntensity={isDarkMode ? 0.15 : 0}
        />
      </mesh>

      {/* Sombrero */}
      <group position={[0, 0.8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh castShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Indicador del jugador actual - mejorado con efecto de brillo */}
      {isCurrentPlayer && (
        <group>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#FDFD96" emissive="#FDFD96" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.1, 0]} intensity={0.8} distance={1.5} color="#FDFD96" />
        </group>
      )}
    </group>
  )
}
