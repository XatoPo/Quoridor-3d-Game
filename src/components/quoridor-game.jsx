"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import GameBoard from "./game-board"
import GameUI from "./game-ui"
import CameraController from "./camera-controller"
import WelcomeScreen from "./welcome-screen"
import SoundEffects from "./sound-effects"
import MobileControls from "./mobile-controls" // Import the new mobile controls
import { GameProvider, useGameContext } from "../context/game-context"

function Game() {
  const { gameStarted, isDarkMode } = useGameContext()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Prevent hydration errors by only rendering the Canvas on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading Quoridor 3D...</div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`w-full h-screen relative ${isDarkMode ? "dark" : ""}`}
        data-theme={isDarkMode ? "dark" : "light"}
      >
        <Canvas
          shadows
          camera={{ position: [0, 10, 10], fov: 45 }}
          className={`${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
          dpr={[1, 2]} // Limitar la relación de píxeles para un mejor rendimiento
        >
          {/* Iluminación ajustada para mejores visuales y soporte de modo oscuro */}
          <ambientLight intensity={isDarkMode ? 0.5 : 0.7} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={isDarkMode ? 1 : 1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Añadir luz puntual para iluminación más dramática */}
          <pointLight
            position={[0, 8, 0]}
            intensity={isDarkMode ? 1 : 0.5}
            distance={20}
            color={isDarkMode ? "#a78bfa" : "#f0f9ff"}
          />

          {/* Añadir luz de relleno para mejor visibilidad en modo oscuro */}
          {isDarkMode && <pointLight position={[0, 5, -8]} intensity={0.3} distance={15} color="#94A3B8" />}

          {/* Añadir fondo de estrellas en modo oscuro */}
          {isDarkMode && <Stars radius={100} depth={50} count={1000} factor={4} fade speed={1} />}

          <GameBoard />
          <CameraController />
          <OrbitControls
            enablePan={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={8}
            maxDistance={20}
            enableDamping={true}
            dampingFactor={0.05}
            // Ajustar controles táctiles para móviles
            rotateSpeed={isMobile ? 0.7 : 1}
            zoomSpeed={isMobile ? 0.7 : 1}
            panSpeed={isMobile ? 0.7 : 1}
            touchAction="none"
          />
        </Canvas>

        {/* Sound effects */}
        <SoundEffects />

        {/* UI elements */}
        <GameUI />

        {/* Mobile controls - only shown on mobile devices when game has started */}
        {gameStarted && isMobile && <MobileControls />}

        {/* Welcome screen */}
        {!gameStarted && <WelcomeScreen />}
      </div>
    </>
  )
}

export default function QuoridorGame() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
