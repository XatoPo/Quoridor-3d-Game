"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Github, Linkedin, Volume2, VolumeX, Moon, Sun, Construction } from "lucide-react"
import { useGameContext } from "../context/game-context"

export default function WelcomeScreen() {
  const { startGame, isMuted, toggleMuted, isDarkMode, toggleDarkMode, triggerSound } = useGameContext()
  const [showCredits, setShowCredits] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

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
      startGame()
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

      <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-xl border-none transition-all duration-300 transform">
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
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={handleStart}>
            Jugar ahora
          </Button>
          <Button
            variant="default"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={handleShowAIModal}
          >
            VS IA
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleToggleCredits}
          >
            {showCredits ? "Volver" : "Créditos"}
          </Button>
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
          <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Construction className="w-16 h-16 text-yellow-500 absolute inset-0 m-auto animate-bounce" />
                <div className="w-full h-full rounded-full border-4 border-dashed border-yellow-500 animate-spin-slow absolute inset-0"></div>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Modo IA en Desarrollo</h2>

              <div className="space-y-4 mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Estamos trabajando en una inteligencia artificial que te desafiará en Quoridor.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progreso: 75% completado</p>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCloseAIModal}>
                Volver al menú
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
