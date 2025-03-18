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

  // Mejorar animación para muros
  useFrame((state) => {
    if (ref.current) {
      if (isHovered) {
        // Animación más dinámica al pasar el cursor
        ref.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 3) * 0.08

        // Efecto de rotación sutil al pasar el cursor
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.03

        // Efecto de pulso de escala para colocaciones inválidas
        if (!isValid) {
          ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1
        }
      } else if (isPlaced) {
        // Pequeña animación de asentamiento para muros recién colocados
        const age = state.clock.elapsedTime % 1000 // Evitar que crezca demasiado
        const isNew = age < 0.5

        if (isNew) {
          // Efecto de rebote al asentarse
          const bounceHeight = Math.max(0, 0.2 * (1 - age * 2))
          ref.current.position.y = initialY + bounceHeight

          // Efecto de escala sutil
          const scaleEffect = 1 + Math.max(0, 0.2 * (1 - age * 2))
          ref.current.scale.x = orientation === "horizontal" ? scaleEffect : 1
          ref.current.scale.z = orientation === "vertical" ? scaleEffect : 1
        } else {
          // Volver a la normalidad
          ref.current.position.y = initialY
          ref.current.scale.x = 1
          ref.current.scale.z = 1
        }
      }
    }
  })

  // Dimensiones del muro según orientación
  const dimensions =
    orientation === "horizontal"
      ? [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS]
      : [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH]

  const opacity = isPlaced ? 1 : isHovered ? 0.8 : 0.5

  // Ajustar posición para alinear con los espacios entre casillas
  const adjustedPosition = [
    position[0] + (orientation === "horizontal" ? 0.45 : 0),
    position[1],
    position[2] + (orientation === "vertical" ? 0.45 : 0),
  ]

  return (
    <group>
      {/* Muro principal con material mejorado */}
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
          <lineBasicMaterial color={isDarkMode ? "#88C0D0" : "#5E81AC"} transparent opacity={0.8} />
        </lineSegments>
      </mesh>

      {/* Añadir efecto de brillo sutil para muros colocados en modo oscuro */}
      {isPlaced && isDarkMode && (
        <mesh position={adjustedPosition}>
          <boxGeometry args={dimensions.map((d) => d * 1.05)} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Resaltar celdas afectadas al pasar el cursor */}
      {isHovered && (
        <group>
          {/* Primera celda afectada */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? -0.45 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? -0.45 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#66BB6A" : "#EF5350"} transparent opacity={0.4} toneMapped={false} />
          </mesh>

          {/* Segunda celda afectada */}
          <mesh
            position={[
              position[0] + (orientation === "vertical" ? 0.45 : 0),
              0.01,
              position[2] + (orientation === "horizontal" ? 0.45 : 0),
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={isValid ? "#66BB6A" : "#EF5350"} transparent opacity={0.4} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}
