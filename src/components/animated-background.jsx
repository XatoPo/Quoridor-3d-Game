"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"

export default function AnimatedBackground() {
  const { isDarkMode } = useGameContext()
  const particlesRef = useRef()
  const particleCount = 50
  const positions = useRef(new Float32Array(particleCount * 3))
  const speeds = useRef(new Float32Array(particleCount))

  // Initialize particles if not already done
  if (!particlesRef.current) {
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a larger area around the board
      positions.current[i * 3] = (Math.random() - 0.5) * 30 // x
      positions.current[i * 3 + 1] = Math.random() * 20 - 5 // y
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 30 // z

      // Random upward speed
      speeds.current[i] = 0.01 + Math.random() * 0.03
    }
  }

  // Animate particles
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array

      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        // Move particles upward
        positions[i * 3 + 1] += speeds.current[i]

        // Reset particles that move too high
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
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color={isDarkMode ? 0x5b21ca : 0xd8b4fe}
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  )
}
