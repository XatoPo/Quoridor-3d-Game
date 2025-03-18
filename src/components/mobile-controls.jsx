"use client"

import { useState } from "react"
import { useGameContext } from "../context/game-context"
import { Button } from "./ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, X, RotateCw, Layers } from "lucide-react"

export default function MobileControls() {
  const {
    gameState,
    makeMove,
    placeWall,
    hoveredWallPosition,
    setHoveredWallPosition,
    toggleWallMode,
    triggerSound,
    isDarkMode,
    isAIMode,
    isAIThinking,
  } = useGameContext()

  const [showControls, setShowControls] = useState(true)
  const [wallOrientation, setWallOrientation] = useState("horizontal")
  const [wallPosition, setWallPosition] = useState({ x: 4, z: 4 })

  const currentPlayer = gameState.players[gameState.currentPlayer]
  const isPlayerOne = gameState.currentPlayer === 0

  // Determinar tema de color del jugador con gradientes más atractivos
  const playerColorClass = isPlayerOne
    ? "from-red-500 to-red-600 dark:from-red-600 dark:to-red-800"
    : "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800"

  // Colores neutros para botones no específicos del jugador
  const neutralColorClass = "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
  const accentColorClass = "from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800"
  const rotateColorClass = "from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-700"

  // Colores de éxito/error
  const successColorClass = "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800"
  const errorColorClass = "from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-800"

  // Actualizar los manejadores para deshabilitar durante el turno de la IA
  const handleMove = (dx, dz) => {
    // Verificar si es el turno de la IA
    if (isAIMode && (gameState.currentPlayer === 1 || isAIThinking)) {
      return
    }

    triggerSound()
    const newX = currentPlayer.x + dx
    const newZ = currentPlayer.z + dz

    if (gameState.validMoves.some((move) => move.x === newX && move.z === newZ)) {
      makeMove(newX, newZ)
    }
  }

  const handleAdjustWall = (dx, dz) => {
    // Verificar si es el turno de la IA
    if (isAIMode && (gameState.currentPlayer === 1 || isAIThinking)) {
      return
    }

    triggerSound()
    const newX = Math.max(0, Math.min(7, wallPosition.x + dx))
    const newZ = Math.max(0, Math.min(7, wallPosition.z + dz))

    setWallPosition({ x: newX, z: newZ })
    setHoveredWallPosition({
      x: newX,
      z: newZ,
      orientation: wallOrientation,
    })
  }

  const handleToggleOrientation = () => {
    // Verificar si es el turno de la IA
    if (isAIMode && (gameState.currentPlayer === 1 || isAIThinking)) {
      return
    }

    triggerSound()
    const newOrientation = wallOrientation === "horizontal" ? "vertical" : "horizontal"
    setWallOrientation(newOrientation)
    setHoveredWallPosition({
      ...wallPosition,
      orientation: newOrientation,
    })
  }

  const handleConfirmWall = () => {
    // Verificar si es el turno de la IA
    if (isAIMode && (gameState.currentPlayer === 1 || isAIThinking)) {
      return
    }

    triggerSound()
    if (hoveredWallPosition && gameState.isValidWallPlacement(hoveredWallPosition)) {
      placeWall(hoveredWallPosition.x, hoveredWallPosition.z, hoveredWallPosition.orientation)
    }
  }

  const handleToggleControls = () => {
    triggerSound()
    setShowControls(!showControls)
  }

  const handleToggleMobileWallMode = () => {
    triggerSound()
    toggleWallMode()
  }

  const isValidWallPlacement = hoveredWallPosition && gameState.isValidWallPlacement(hoveredWallPosition)

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="flex flex-col items-center">
        {/* Botón de alternancia con color del jugador y efecto de pulso */}
        <Button
          onClick={handleToggleControls}
          className={`mb-2 bg-gradient-to-br ${accentColorClass} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-0 ${!showControls && "animate-pulse"}`}
        >
          {showControls ? <X size={24} /> : <ArrowUp size={24} />}
        </Button>

        {showControls && (
          <div className="bg-white/95 dark:bg-gray-800/95 p-4 rounded-lg shadow-lg backdrop-blur-md border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom duration-300 relative mx-2 max-w-[95vw]">
            {/* Indicador de modo con acento de color del jugador */}
            <div className="text-center mb-4 flex items-center justify-between">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${playerColorClass}`}></div>
              <span className="font-medium text-gray-700 dark:text-gray-300 mx-2">
                {gameState.wallMode ? "Colocar Muro" : "Mover Ficha"}
              </span>
              <Button
                onClick={handleToggleMobileWallMode}
                className={`bg-gradient-to-br ${accentColorClass} text-white border-0 shadow-md`}
                size="sm"
              >
                <Layers className="h-4 w-4 mr-1" />
                Cambiar
              </Button>
            </div>

            {!gameState.wallMode ? (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div></div>
                <Button
                  onClick={() => handleMove(0, -1)}
                  className={`bg-gradient-to-br ${playerColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all`}
                >
                  <ArrowUp size={24} />
                </Button>
                <div></div>

                <Button
                  onClick={() => handleMove(-1, 0)}
                  className={`bg-gradient-to-br ${playerColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all`}
                >
                  <ArrowLeft size={24} />
                </Button>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${playerColorClass} animate-pulse`}></div>
                </div>
                <Button
                  onClick={() => handleMove(1, 0)}
                  className={`bg-gradient-to-br ${playerColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all`}
                >
                  <ArrowRight size={24} />
                </Button>

                <div></div>
                <Button
                  onClick={() => handleMove(0, 1)}
                  className={`bg-gradient-to-br ${playerColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all`}
                >
                  <ArrowDown size={24} />
                </Button>
                <div></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <Button
                    onClick={() => handleAdjustWall(0, -1)}
                    className={`bg-gradient-to-br ${neutralColorClass} text-gray-700 dark:text-white border-0 shadow-md hover:shadow-lg transition-all`}
                  >
                    <ArrowUp size={24} />
                  </Button>
                  <div></div>

                  <Button
                    onClick={() => handleAdjustWall(-1, 0)}
                    className={`bg-gradient-to-br ${neutralColorClass} text-gray-700 dark:text-white border-0 shadow-md hover:shadow-lg transition-all`}
                  >
                    <ArrowLeft size={24} />
                  </Button>
                  <Button
                    onClick={handleToggleOrientation}
                    className={`bg-gradient-to-br ${rotateColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all`}
                  >
                    <RotateCw size={24} />
                  </Button>
                  <Button
                    onClick={() => handleAdjustWall(1, 0)}
                    className={`bg-gradient-to-br ${neutralColorClass} text-gray-700 dark:text-white border-0 shadow-md hover:shadow-lg transition-all`}
                  >
                    <ArrowRight size={24} />
                  </Button>

                  <div></div>
                  <Button
                    onClick={() => handleAdjustWall(0, 1)}
                    className={`bg-gradient-to-br ${neutralColorClass} text-gray-700 dark:text-white border-0 shadow-md hover:shadow-lg transition-all`}
                  >
                    <ArrowDown size={24} />
                  </Button>
                  <div></div>
                </div>

                <div className="text-center text-sm text-gray-700 dark:text-gray-300 py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-700 font-medium">
                  <span>Orientación: {wallOrientation === "horizontal" ? "Horizontal" : "Vertical"}</span>
                </div>

                <Button
                  onClick={handleConfirmWall}
                  className={`w-full bg-gradient-to-br ${isValidWallPlacement ? successColorClass : errorColorClass} text-white border-0 shadow-md hover:shadow-lg transition-all ${isValidWallPlacement && "animate-pulse"}`}
                  disabled={!isValidWallPlacement}
                >
                  <Check size={20} className="mr-2" />
                  Colocar Muro
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
