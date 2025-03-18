"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"

// Mejorar el efecto de confeti para la victoria
export default function ConfettiEffect() {
  const { gameState } = useGameContext()
  const confettiRef = useRef()
  const particlesRef = useRef([])

  // Colores más vibrantes para el confeti
  const confettiColors =
    gameState.winner === 0
      ? [0xff3333, 0xff6666, 0xff9999, 0xffcccc, 0xff0000] // Rojo más vibrante
      : [0x3366ff, 0x6699ff, 0x99ccff, 0xccddff, 0x0033cc] // Azul más vibrante

  // Inicializar partículas de confeti
  useEffect(() => {
    if (gameState.winner !== null && confettiRef.current) {
      particlesRef.current = []

      // Crear 150 partículas de confeti (más partículas)
      for (let i = 0; i < 150; i++) {
        // Formas variadas para el confeti
        let geometry
        const shapeType = Math.floor(Math.random() * 3)

        if (shapeType === 0) {
          // Rectángulos
          geometry = new THREE.PlaneGeometry(0.1, 0.1)
        } else if (shapeType === 1) {
          // Círculos
          geometry = new THREE.CircleGeometry(0.05, 8)
        } else {
          // Estrellas
          geometry = new THREE.CircleGeometry(0.05, 5)
        }

        const material = new THREE.MeshBasicMaterial({
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          side: THREE.DoubleSide,
        })

        const particle = new THREE.Mesh(geometry, material)

        // Posición inicial aleatoria sobre el tablero
        particle.position.set(Math.random() * 12 - 6, 10 + Math.random() * 5, Math.random() * 12 - 6)

        // Velocidad y rotación aleatorias
        particle.userData = {
          velocity: new THREE.Vector3(
            Math.random() * 0.1 - 0.05,
            -0.05 - Math.random() * 0.1,
            Math.random() * 0.1 - 0.05,
          ),
          rotation: new THREE.Vector3(Math.random() * 0 * 0.1 - 0.05),
          rotation: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1),
          spin: Math.random() * 0.02 - 0.01,
        }

        confettiRef.current.add(particle)
        particlesRef.current.push(particle)
      }
    }
  }, [gameState.winner, confettiColors])

  // Animar confeti con movimientos más realistas
  useFrame((state) => {
    if (gameState.winner !== null && confettiRef.current) {
      particlesRef.current.forEach((particle) => {
        // Actualizar posición
        particle.position.add(particle.userData.velocity)

        // Añadir efecto de gravedad
        particle.userData.velocity.y += -0.005

        // Añadir efecto de resistencia del aire
        particle.userData.velocity.x *= 0.99
        particle.userData.velocity.z *= 0.99

        // Actualizar rotación
        particle.rotation.x += particle.userData.rotation.x
        particle.rotation.y += particle.userData.rotation.y
        particle.rotation.z += particle.userData.rotation.z

        // Añadir efecto de giro
        particle.rotation.z += particle.userData.spin

        // Reiniciar partícula si cae debajo del tablero
        if (particle.position.y < -5) {
          particle.position.y = 10 + Math.random() * 5
          particle.position.x = Math.random() * 12 - 6
          particle.position.z = Math.random() * 12 - 6

          // Reiniciar velocidad para variedad
          particle.userData.velocity.y = -0.05 - Math.random() * 0.1
        }
      })
    }
  })

  return (
    <group ref={confettiRef} renderOrder={2000} position={[0, 0, 10]}>
      {/* Añadir luces para que el confeti sea más visible */}
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 5]} intensity={1} distance={20} />
      <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={0.5} castShadow />
    </group>
  )
}
