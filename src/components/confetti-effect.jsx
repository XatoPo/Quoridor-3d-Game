"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

export default function ConfettiEffect() {
  const { gameState } = useGameContext()
  const confettiRef = useRef()
  const particlesRef = useRef([])
  const confettiColors =
    gameState.winner === 0
      ? [0xef4444, 0xfca5a5, 0xff7171, 0xfecaca] // Red confetti
      : [0x3b82f6, 0x93c5fd, 0x60a5fa, 0xbfdbfe] // Blue confetti

  // Initialize confetti particles
  useEffect(() => {
    if (gameState.winner !== null && confettiRef.current) {
      particlesRef.current = []

      // Create 100 confetti particles
      for (let i = 0; i < 100; i++) {
        const geometry = new THREE.PlaneGeometry(0.1, 0.1)
        const material = new THREE.MeshBasicMaterial({
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          side: THREE.DoubleSide,
        })

        const particle = new THREE.Mesh(geometry, material)

        // Random starting position above the board
        particle.position.set(Math.random() * 10 - 5, 10, Math.random() * 10 - 5)

        // Random velocity
        particle.userData = {
          velocity: new THREE.Vector3(
            Math.random() * 0.05 - 0.025,
            -0.05 - Math.random() * 0.05,
            Math.random() * 0.05 - 0.025,
          ),
          rotation: new THREE.Vector3(Math.random() * 0.05, Math.random() * 0.05, Math.random() * 0.05),
        }

        confettiRef.current.add(particle)
        particlesRef.current.push(particle)
      }
    }
  }, [gameState.winner, confettiColors])

  // Animate confetti
  useFrame(() => {
    if (gameState.winner !== null && confettiRef.current) {
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.position.add(particle.userData.velocity)

        // Update rotation
        particle.rotation.x += particle.userData.rotation.x
        particle.rotation.y += particle.userData.rotation.y
        particle.rotation.z += particle.userData.rotation.z

        // Reset particle if it falls below the board
        if (particle.position.y < -5) {
          particle.position.y = 10
          particle.position.x = Math.random() * 10 - 5
          particle.position.z = Math.random() * 10 - 5
        }
      })
    }
  })

  return (
    <group ref={confettiRef} renderOrder={2000} position={[0, 0, 10]}>
      {/* Añadir una luz para que el confetti sea más visible */}
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 5]} intensity={1} distance={20} />
    </group>
  )
}
