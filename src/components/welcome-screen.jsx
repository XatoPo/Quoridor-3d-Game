"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Github, Linkedin, Volume2, VolumeX, Moon, Sun, Brain, AlertTriangle } from "lucide-react"
import { useGameContext } from "../context/game-context"

export default function WelcomeScreen() {
  const { startGame, isMuted, toggleMuted, isDarkMode, toggleDarkMode, triggerSound } = useGameContext()
  const [showCredits, setShowCredits] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [isVisible, setIsVisible] = useState(true)
  // Añadir estado para el modal de modo online
  const [showOnlineModal, setShowOnlineModal] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleStart = () => {
    triggerSound()
    setIsVisible(false)
    setTimeout(() => {
      startGame(false)
    }, 500)
  }

  const handleToggleCredits = () => {
    triggerSound()
    setShowCredits(!showCredits)
  }

  const handleShowAIModal = () => {
    triggerSound()
    setShowAIModal(true)
  }

  const handleCloseAIModal = () => {
    triggerSound()
    setShowAIModal(false)
  }

  const handleToggleMuted = () => {
    triggerSound()
    toggleMuted()
  }

  const handleToggleDarkMode = () => {
    triggerSound()
    toggleDarkMode()
  }

  const handleStartAIGame = () => {
    triggerSound()
    setIsVisible(false)
    setTimeout(() => {
      startGame(true, selectedDifficulty)
    }, 500)
    setShowAIModal(false)
  }

  const handleSelectDifficulty = (difficulty) => {
    triggerSound()
    setSelectedDifficulty(difficulty)
  }

  // Añadir funciones para manejar el modal de modo online
  const handleShowOnlineModal = () => {
    triggerSound()
    setShowOnlineModal(true)
  }

  const handleCloseOnlineModal = () => {
    triggerSound()
    setShowOnlineModal(false)
  }

  // Modificar la pantalla de bienvenida para mejorar la experiencia móvil y añadir modo online
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 dark:from-gray-900 dark:to-purple-950 z-50
    transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleDarkMode}
          className="bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleMuted}
          className="bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="max-w-md w-full mx-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-xl border-none transition-all duration-300 transform">
        <CardHeader className="text-center pb-2">
          <div className="w-32 h-32 mx-auto mb-2">
            <div className="relative w-full h-full">
              <div className="absolute w-12 h-12 bg-red-500 rounded-full top-4 left-4 shadow-md" />
              <div className="absolute w-12 h-12 bg-blue-500 rounded-full bottom-4 right-4 shadow-md" />
              <div className="absolute w-full h-2 bg-purple-700 rotate-45 top-1/2 left-0 transform -translate-y-1/2" />
              <div className="absolute w-full h-2 bg-purple-700 -rotate-45 top-1/2 left-0 transform -translate-y-1/2" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-purple-700 dark:text-purple-400">Quoridor 3D</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            El clásico juego de estrategia en un entorno 3D
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {!showCredits ? (
            <p className="text-gray-700 dark:text-gray-200">
              Encuentra tu camino hacia la victoria bloqueando el camino de tu oponente con muros estratégicos. ¡Sé el
              primero en llegar al otro lado!
            </p>
          ) : (
            <div className="text-left space-y-3 py-2">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400">Créditos</h3>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Diseñado y desarrollado por: <span className="font-semibold">Flavio Villanueva Medina</span>
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Linkedin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <a
                  href="https://www.linkedin.com/in/flavio-sebastian-villanueva-medina-072343210/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  @FlavioVillanuevaMedina
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Github className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <a
                  href="https://github.com/XatoPo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  @XatoPo
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Basado en el juego de mesa Quoridor creado por Mirko Marchesi.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Agradecimientos a el amor de mi vida Romina Soerly Elescano Lazaro.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {!showCredits ? (
            <>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={handleStart}>
                Jugar 2 Jugadores (Local)
              </Button>
              <Button
                variant="default"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleShowAIModal}
              >
                VS IA (Alpha)
              </Button>
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={handleShowOnlineModal}
              >
                Jugar Online
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleToggleCredits}
              >
                Créditos
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleToggleCredits}
            >
              Volver
            </Button>
          )}
        </CardFooter>
      </Card>

      {isMuted && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse z-[100] flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <span>Activa el sonido para una mejor experiencia</span>
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="max-w-md w-full mx-4 bg-white/90 dark:bg-gray-800/90 p-6 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Brain className="w-16 h-16 text-purple-500 absolute inset-0 m-auto" />
                <div className="w-full h-full rounded-full border-4 border-dashed border-purple-500 animate-spin-slow absolute inset-0"></div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Jugar contra la IA</h2>

              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg mb-4 text-left">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Versión Alpha
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                  Esta es una versión preliminar del modo IA. Puede contener errores o comportamientos inesperados
                  debido a que la lógica del juego aún está en desarrollo.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Selecciona el nivel de dificultad de la IA:</p>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    className={`${
                      selectedDifficulty === "easy"
                        ? "bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-green-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => handleSelectDifficulty("easy")}
                  >
                    Fácil
                  </Button>
                  <Button
                    className={`${
                      selectedDifficulty === "medium"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white font-bold border-2 border-yellow-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => handleSelectDifficulty("medium")}
                  >
                    Medio
                  </Button>
                  <Button
                    className={`${
                      selectedDifficulty === "hard"
                        ? "bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-red-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => handleSelectDifficulty("hard")}
                  >
                    Difícil
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    {selectedDifficulty === "easy" && "Nivel Fácil"}
                    {selectedDifficulty === "medium" && "Nivel Medio"}
                    {selectedDifficulty === "hard" && "Nivel Difícil"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedDifficulty === "easy" &&
                      "La IA se enfoca en avanzar hacia su meta y coloca muros de forma ocasional. Ideal para principiantes."}
                    {selectedDifficulty === "medium" &&
                      "La IA alterna entre avanzar y defender, usando muros de forma más estratégica. Un desafío equilibrado."}
                    {selectedDifficulty === "hard" &&
                      "La IA planifica varios turnos adelante y coloca muros en lugares estratégicos. Un reto para jugadores experimentados."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-700"
                  onClick={handleCloseAIModal}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleStartAIGame}>
                  Comenzar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {showOnlineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="max-w-md w-full mx-4 bg-white/90 dark:bg-gray-800/90 p-6 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full rounded-full border-4 border-dashed border-blue-500 animate-spin-slow absolute inset-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Modo Online</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Estamos trabajando en el modo multijugador online. ¡Pronto podrás jugar con amigos en todo el mundo!
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "5%" }}></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">5% completado</p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCloseOnlineModal}>
                Entendido
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
