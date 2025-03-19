"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

export default function PlayerPiece({ position, color, isCurrentPlayer }) {
  const ref = useRef()
  const ringRef = useRef()
  const glowRef = useRef()
  const targetPosition = useRef(new Vector3(position.x, position.y, position.z))
  const previousPosition = useRef(new Vector3(position.x, position.y, position.z))
  const { isDarkMode } = useGameContext()

  // Update target position when position prop changes
  useEffect(() => {
    previousPosition.current.copy(ref.current.position)
    targetPosition.current = new Vector3(position.x, position.y, position.z)
  }, [position])

  // Animate piece movement with subtle hover effect
  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth movement to target position
      const t = Math.min(0.05 + delta * 1.5, 1)
      ref.current.position.lerp(targetPosition.current, t)

      // Determine if the piece is currently moving
      const isMoving = previousPosition.current.distanceTo(targetPosition.current) > 0.01

      // Hover animation for current player - slightly more noticeable
      if (isCurrentPlayer) {
        ref.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.07 + 0.12

        // Animate ring for current player
        if (ringRef.current) {
          ringRef.current.material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        }

        // Animate glow effect
        if (glowRef.current) {
          glowRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
        }
      } else {
        // Very subtle animation for inactive player
        ref.current.position.y = position.y + 0.05
      }

      // If the piece is moving, add a little bounce at the end
      if (isMoving && ref.current.position.distanceTo(targetPosition.current) < 0.1) {
        ref.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.03
      }
    }
  })

  // Determine colors based on player
  const isRedPlayer = color.includes("red") || color === "#EF5350" || color === "#ef5350"
  const baseColor = isRedPlayer ? "#EF5350" : "#42A5F5"
  const darkColor = isRedPlayer ? "#C62828" : "#1565C0"
  const glowColor = isRedPlayer ? "#FFCDD2" : "#BBDEFB"

  return (
    <group ref={ref} position={[position.x, position.y, position.z]}>
      {/* Glow effect for current player */}
      {isCurrentPlayer && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Base of the piece */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 32]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.3}
          roughness={0.6}
          emissive={baseColor}
          emissiveIntensity={isDarkMode ? (isCurrentPlayer ? 0.3 : 0.1) : 0}
        />
      </mesh>

      {/* Middle section */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 32]} />
        <meshStandardMaterial
          color={darkColor}
          metalness={0.3}
          roughness={0.6}
          emissive={darkColor}
          emissiveIntensity={isDarkMode ? (isCurrentPlayer ? 0.3 : 0.1) : 0}
        />
      </mesh>

      {/* Top section */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.3}
          roughness={0.6}
          emissive={baseColor}
          emissiveIntensity={isDarkMode ? (isCurrentPlayer ? 0.3 : 0.1) : 0}
        />
      </mesh>

      {/* Small top sphere */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={darkColor}
          metalness={0.3}
          roughness={0.6}
          emissive={darkColor}
          emissiveIntensity={isDarkMode ? (isCurrentPlayer ? 0.3 : 0.1) : 0}
        />
      </mesh>

      {/* Indicator ring for current player - more visible */}
      {isCurrentPlayer && (
        <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.5, 32]} />
          <meshBasicMaterial color={baseColor} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Light for current player - slightly brighter */}
      {isCurrentPlayer && <pointLight position={[0, 0.3, 0]} intensity={0.7} distance={1.8} color={baseColor} />}
    </group>
  )
}

