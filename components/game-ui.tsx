"use client"

import { useState } from "react"
import { useGameContext } from "@/context/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCcw, HelpCircle, X, ChevronUp, ChevronDown } from "lucide-react"

export default function GameUI() {
  const { gameState, resetGame, toggleWallMode } = useGameContext()
  const [showRules, setShowRules] = useState(false)
  const [showInfo, setShowInfo] = useState(true)

  const currentPlayer = gameState.currentPlayer === 0 ? "Rojo" : "Azul"
  const wallsLeft = gameState.currentPlayer === 0 ? gameState.players[0].wallsLeft : gameState.players[1].wallsLeft

  return (
    <>
      {/* Game info panel */}
      <div className="absolute top-4 left-4 z-10">
        <Card
          className={`p-4 bg-white/80 text-gray-800 shadow-lg transition-all duration-300 ${showInfo ? "w-64" : "w-12"}`}
        >
          <div className="flex justify-between items-center">
            <h2 className={`font-bold text-lg ${!showInfo && "hidden"}`}>Quoridor 3D</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-800 hover:bg-gray-200/50"
            >
              {showInfo ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>

          {showInfo && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span>Turno:</span>
                <span className={`font-bold ${gameState.currentPlayer === 0 ? "text-pink-400" : "text-blue-300"}`}>
                  Jugador {currentPlayer}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Muros restantes:</span>
                <span className="font-bold">{wallsLeft}</span>
              </div>
              <div className="flex justify-between">
                <span>Modo:</span>
                <span className="font-bold">{gameState.wallMode ? "Colocar muro" : "Mover ficha"}</span>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant={gameState.wallMode ? "default" : "outline"}
                  className={`flex-1 ${gameState.wallMode ? "bg-purple-200 text-purple-800 hover:bg-purple-300" : "text-gray-800 border-gray-300 hover:bg-gray-100"}`}
                  onClick={toggleWallMode}
                >
                  {gameState.wallMode ? "Mover" : "Muro"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-gray-800 border-gray-300 hover:bg-gray-100"
                  onClick={resetGame}
                >
                  <RotateCcw className="mr-1 h-4 w-4" /> Reiniciar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Rules button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-white/80 text-gray-800 border-gray-300 hover:bg-gray-100"
        onClick={() => setShowRules(true)}
      >
        <HelpCircle />
      </Button>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
          <Card className="max-w-lg w-full bg-white/90 text-gray-800 p-6 relative max-h-[80vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-800 hover:bg-gray-200/50"
              onClick={() => setShowRules(false)}
            >
              <X />
            </Button>

            <h2 className="text-2xl font-bold mb-4 text-purple-400">Reglas de Quoridor</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-pink-400">Objetivo</h3>
                <p>Ser el primer jugador en llegar a la línea base opuesta del tablero.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-400">Movimientos</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>En tu turno, puedes mover tu ficha o colocar un muro.</li>
                  <li>Las fichas se mueven un espacio en horizontal o vertical (no en diagonal).</li>
                  <li>No puedes atravesar muros ni ocupar la misma casilla que otro jugador.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-400">Muros</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cada jugador comienza con 10 muros.</li>
                  <li>Los muros bloquean el paso pero no pueden cerrar completamente el camino a la meta.</li>
                  <li>Los muros se colocan entre las casillas y ocupan dos espacios.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-pink-400">Controles</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Haz clic en una casilla para mover tu ficha.</li>
                  <li>Cambia al modo "Muro" para colocar muros.</li>
                  <li>Arrastra el ratón para rotar la cámara y ver mejor el tablero.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Game over message */}
      {gameState.winner !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <Card className="p-6 bg-white/90 text-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-center">
              ¡Jugador {gameState.winner === 0 ? "Rojo" : "Azul"} ha ganado!
            </h2>
            <Button className="w-full bg-purple-200 text-purple-800 hover:bg-purple-300" onClick={resetGame}>
              Jugar de nuevo
            </Button>
          </Card>
        </div>
      )}
    </>
  )
}

