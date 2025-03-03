"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"

export default function PlayerPiece({ position, color, isCurrentPlayer }) {
  const ref = useRef()
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

  // Modelo estilo Clue/Cluedo para las fichas
  return (
    <group ref={ref} position={[position.x, position.y, position.z]} scale={isCurrentPlayer ? 1.2 : 1}>
      {/* Base de la ficha */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Cuerpo del personaje */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Cabeza */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
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

      {/* Indicador del jugador actual */}
      {isCurrentPlayer && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FDFD96" emissive="#FDFD96" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

