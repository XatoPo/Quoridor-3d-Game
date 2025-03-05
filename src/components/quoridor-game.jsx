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
          className={`${isDarkMode ? "bg-gradient-to-b from-gray-900 to-purple-950" : "bg-gradient-to-b from-blue-100 to-purple-100"}`}
          dpr={[1, 2]} // Limit pixel ratio for better performance
        >
          {/* Adjusted lighting for better visuals and dark mode support */}
          <ambientLight intensity={isDarkMode ? 0.4 : 0.7} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={isDarkMode ? 0.8 : 1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Add point light for more dramatic lighting */}
          <pointLight
            position={[0, 8, 0]}
            intensity={isDarkMode ? 0.8 : 0.5}
            distance={20}
            color={isDarkMode ? "#a78bfa" : "#f0f9ff"}
          />

          {/* Add stars background in dark mode */}
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
            // Adjust touch controls for mobile
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

        {/* Mobile controls - only shown on mobile devices */}
        {gameStarted && <MobileControls />}

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
