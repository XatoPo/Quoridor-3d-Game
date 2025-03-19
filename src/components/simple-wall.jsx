"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

const WALL_THICKNESS = 0.12
const WALL_HEIGHT = 0.4
const WALL_LENGTH = 1.8 // Slightly shorter than 2 to avoid overlap

export default function SimpleWall({
  position,
  orientation,
  isPlaced,
  isHovered = false,
  isValid = true,
  color,
  playerIndex = 0,
}) {
  const ref = useRef()
  const edgesRef = useRef()
  const { isDarkMode } = useGameContext()
  const initialY = position[1]

  // Mejorar animación para muros
  useFrame((state, delta) => {
    if (ref.current) {
      if (isHovered) {
        // Animación más sutil al pasar el cursor
        ref.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 2) * 0.05

        // Efecto de pulso de escala para colocaciones inválidas
        if (!isValid) {
          ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05
        }
      } else if (isPlaced) {
        // Pequeña animación de asentamiento para muros recién colocados
        const age = state.clock.elapsedTime % 1000 // Evitar que crezca demasiado
        const isNew = age < 0.5

        if (isNew) {
          // Efecto de rebote al asentarse
          const bounceHeight = Math.max(0, 0.1 * (1 - age * 2))
          ref.current.position.y = initialY + bounceHeight
        } else {
          // Volver a la normalidad
          ref.current.position.y = initialY
        }
      }

      // Animar bordes para dar más vida a los muros
      if (edgesRef.current) {
        if (isHovered) {
          edgesRef.current.material.opacity = 0.8
        } else if (isPlaced) {
          edgesRef.current.material.opacity = 0.7
        }
      }
    }
  })

  // Dimensiones del muro según orientación
  const dimensions =
    orientation === "horizontal"
      ? [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS]
      : [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH]

  const opacity = isPlaced ? 1 : isHovered ? 0.8 : 0.6

  // Determinar colores para efectos de brillo
  const wallBaseColor = isPlaced ? color : isValid ? "#66BB6A" : "#EF5350"
  const wallEdgeColor = isPlaced ? (playerIndex === 0 ? "#FF8A80" : "#80D8FF") : isValid ? "#A5D6A7" : "#FFCDD2"

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
          color={wallBaseColor}
          transparent
          opacity={opacity}
          roughness={0.5}
          metalness={0.3}
          emissive={wallBaseColor}
          emissiveIntensity={isDarkMode ? (isPlaced ? 0.25 : 0.15) : 0}
        />
      </mesh>

      {/* Bordes del muro para mejor definición */}
      <lineSegments ref={edgesRef} position={adjustedPosition}>
        <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
        <lineBasicMaterial color={wallEdgeColor} transparent opacity={0.7} linewidth={1.5} />
      </lineSegments>

      {/* Resaltar celdas afectadas al pasar el cursor - más sutil */}
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
            <meshBasicMaterial color={isValid ? "#66BB6A" : "#EF5350"} transparent opacity={0.25} toneMapped={false} />
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
            <meshBasicMaterial color={isValid ? "#66BB6A" : "#EF5350"} transparent opacity={0.25} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Luz sutil para muros colocados */}
      {isPlaced && (
        <pointLight
          position={[adjustedPosition[0], adjustedPosition[1], adjustedPosition[2]]}
          intensity={isDarkMode ? 0.4 : 0.2}
          distance={1.2}
          color={playerIndex === 0 ? "#FF5252" : "#448AFF"}
        />
      )}
    </group>
  )
}

