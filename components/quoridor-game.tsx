"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import GameBoard from "./game-board"
import GameUI from "./game-ui"
import { GameProvider } from "@/context/game-context"

export default function QuoridorGame() {
  const [isMounted, setIsMounted] = useState(false)

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
    <GameProvider>
      <div className="w-full h-screen relative">
        <Canvas
          shadows
          camera={{ position: [0, 10, 10], fov: 45 }}
          className="bg-gradient-to-b from-blue-100 to-purple-100"
          dpr={[1, 2]} // Limit pixel ratio for better performance
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
          <GameBoard />
          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={8}
            maxDistance={20}
          />
        </Canvas>
        <GameUI />
      </div>
    </GameProvider>
  )
}

