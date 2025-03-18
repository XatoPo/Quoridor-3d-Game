"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"

export default function AnimatedBackground() {
  const { isDarkMode } = useGameContext()
  const particlesRef = useRef()
  const particleCount = 70 // Aumentar el número de partículas
  const positions = useRef(new Float32Array(particleCount * 3))
  const speeds = useRef(new Float32Array(particleCount))
  const colors = useRef(new Float32Array(particleCount * 3))

  // Inicializar partículas si aún no se ha hecho
  if (!particlesRef.current) {
    for (let i = 0; i < particleCount; i++) {
      // Posiciones aleatorias en un área más grande alrededor del tablero
      positions.current[i * 3] = (Math.random() - 0.5) * 30 // x
      positions.current[i * 3 + 1] = Math.random() * 20 - 5 // y
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 30 // z

      // Velocidad ascendente aleatoria
      speeds.current[i] = 0.01 + Math.random() * 0.03

      // Colores aleatorios para las partículas
      if (isDarkMode) {
        // Colores para modo oscuro (tonos púrpura y azul)
        colors.current[i * 3] = 0.3 + Math.random() * 0.2 // R
        colors.current[i * 3 + 1] = 0.1 + Math.random() * 0.2 // G
        colors.current[i * 3 + 2] = 0.5 + Math.random() * 0.5 // B
      } else {
        // Colores para modo claro (tonos azul claro y púrpura claro)
        colors.current[i * 3] = 0.7 + Math.random() * 0.3 // R
        colors.current[i * 3 + 1] = 0.7 + Math.random() * 0.3 // G
        colors.current[i * 3 + 2] = 0.9 + Math.random() * 0.1 // B
      }
    }
  }

  // Animar partículas
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array

      // Actualizar posiciones de partículas
      for (let i = 0; i < particleCount; i++) {
        // Mover partículas hacia arriba
        positions[i * 3 + 1] += speeds.current[i]

        // Reiniciar partículas que suben demasiado
        if (positions[i * 3 + 1] > 15) {
          positions[i * 3] = (Math.random() - 0.5) * 30
          positions[i * 3 + 1] = -5
          positions[i * 3 + 2] = (Math.random() - 0.5) * 30
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions.current} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors.current} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors transparent opacity={0.7} sizeAttenuation={true} />
    </points>
  )
}
