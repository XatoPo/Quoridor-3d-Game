"use client"

import { useState, useEffect } from "react"
import { useGameContext } from "../context/game-context"
import { Button } from "./ui/button"
import { Card, CardTitle, CardDescription } from "./ui/card"
import {
  RotateCcw,
  HelpCircle,
  X,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Home,
  Smartphone,
  Brain,
  Loader2,
  AlertTriangle,
} from "lucide-react"

// Color palette matching the game board
const COLORS = {
  ui: {
    background: "bg-white/90 dark:bg-gray-800/90",
    text: "text-gray-800 dark:text-gray-100",
    border: "border-gray-200 dark:border-gray-700",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-700",
  },
  players: {
    p1: {
      bg: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      light: "bg-red-100 dark:bg-red-900",
    },
    p2: {
      bg: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      light: "bg-blue-100 dark:bg-blue-900",
    },
  },
  actions: {
    primary: "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200",
    outline: "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700",
  },
}

export default function GameUI() {
  const {
    gameState,
    resetGame,
    toggleWallMode,
    isMuted,
    toggleMuted,
    isDarkMode,
    toggleDarkMode,
    returnToMenu,
    triggerSound,
    gameStarted,
    isAIMode,
    aiDifficulty,
    isAIThinking,
    aiError,
  } = useGameContext()
  const [showRules, setShowRules] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [showWinner, setShowWinner] = useState(false)
  const [showMobileHelp, setShowMobileHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSoundNotification, setShowSoundNotification] = useState(false)
  const [showAIError, setShowAIError] = useState(false)

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

  // Animation for winner announcement
  useEffect(() => {
    if (gameState.winner !== null) {
      setShowWinner(true)
    } else {
      setShowWinner(false)
    }
  }, [gameState.winner])

  // Show mobile help on first visit on mobile
  useEffect(() => {
    if (isMobile && gameStarted) {
      const hasSeenMobileHelp = localStorage.getItem("hasSeenMobileHelp")
      if (!hasSeenMobileHelp) {
        setShowMobileHelp(true)
        localStorage.setItem("hasSeenMobileHelp", "true")
      }
    }
  }, [isMobile, gameStarted])

  // Add timer to auto-hide sound notification after 10 seconds
  useEffect(() => {
    if (isMuted && gameStarted) {
      setShowSoundNotification(true)
      const timer = setTimeout(() => {
        setShowSoundNotification(false)
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      setShowSoundNotification(false)
    }
  }, [isMuted, gameStarted])

  // Mostrar notificación de error de la IA
  useEffect(() => {
    if (aiError) {
      setShowAIError(true)
      const timer = setTimeout(() => {
        setShowAIError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [aiError])

  const currentPlayer = gameState.currentPlayer === 0 ? "Rojo" : "Azul"
  const wallsLeft = gameState.currentPlayer === 0 ? gameState.players[0].wallsLeft : gameState.players[1].wallsLeft
  const playerColors = gameState.currentPlayer === 0 ? COLORS.players.p1 : COLORS.players.p2

  const handleToggleInfo = () => {
    triggerSound() // Add click sound
    setShowInfo(!showInfo)
  }

  const handleShowRules = () => {
    triggerSound() // Add click sound
    setShowRules(true)
  }

  const handleCloseRules = () => {
    triggerSound() // Add click sound
    setShowRules(false)
  }

  const handleToggleWallMode = () => {
    triggerSound() // Add click sound
    toggleWallMode()
  }

  const handleShowResetConfirm = () => {
    triggerSound()
    setShowResetConfirm(true)
  }

  const handleConfirmReset = () => {
    triggerSound()
    resetGame()
    setShowResetConfirm(false)
  }

  const handleCancelReset = () => {
    triggerSound()
    setShowResetConfirm(false)
  }

  const handleResetGame = () => {
    triggerSound() // Add click sound
    handleShowResetConfirm()
  }

  const handleToggleMuted = () => {
    triggerSound() // Add click sound
    toggleMuted()
  }

  const handleToggleDarkMode = () => {
    triggerSound() // Add click sound
    toggleDarkMode()
  }

  const handleReturnToMenu = () => {
    triggerSound() // Add click sound
    returnToMenu()
  }

  const handleCloseMobileHelp = () => {
    triggerSound() // Add click sound
    setShowMobileHelp(false)
  }

  const handleDismissSoundNotification = () => {
    setShowSoundNotification(false)
  }

  const handleDismissAIError = () => {
    setShowAIError(false)
  }

  // Obtener el texto de dificultad de la IA
  const getAIDifficultyText = () => {
    switch (aiDifficulty) {
      case "easy":
        return "Fácil"
      case "medium":
        return "Medio"
      case "hard":
        return "Difícil"
      default:
        return "Medio"
    }
  }

  // Obtener el color de dificultad de la IA
  const getAIDifficultyColor = () => {
    switch (aiDifficulty) {
      case "easy":
        return "text-green-500 dark:text-green-400"
      case "medium":
        return "text-yellow-500 dark:text-yellow-400"
      case "hard":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-yellow-500 dark:text-yellow-400"
    }
  }

  return (
    <>
      {/* Game info panel */}
      <div className="absolute top-4 left-4 z-10">
        <Card
          className={`p-4 ${COLORS.ui.background} shadow-lg transition-all duration-300 backdrop-blur ${showInfo ? "w-64" : "w-16"}`}
        >
          <div className="flex justify-between items-center">
            <h2 className={`font-bold text-lg ${COLORS.ui.text} ${!showInfo && "hidden"}`}>Quoridor 3D</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleInfo}
              className={`${COLORS.ui.text} ${COLORS.ui.hover}`}
            >
              {showInfo ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>

          {showInfo && (
            <div className="mt-2 space-y-2">
              <div className={`flex justify-between items-center p-2 rounded ${playerColors.light}`}>
                <span className={`${COLORS.ui.text}`}>Turno:</span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${playerColors.text}`}>Jugador {currentPlayer}</span>
                  {isAIMode && gameState.currentPlayer === 1 && (
                    <Brain className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  )}
                </div>
              </div>

              {isAIMode && (
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className={`${COLORS.ui.text}`}>IA:</span>
                  <span className={`font-bold ${getAIDifficultyColor()}`}>
                    {getAIDifficultyText()}
                    {isAIThinking && <Loader2 className="h-4 w-4 inline ml-1 animate-spin" />}
                  </span>
                </div>
              )}

              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className={`${COLORS.ui.text}`}>Muros restantes:</span>
                <span className="font-bold">{wallsLeft}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className={`${COLORS.ui.text}`}>Modo:</span>
                <span className="font-bold">{gameState.wallMode ? "Colocar muro" : "Mover ficha"}</span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  size="sm"
                  variant={gameState.wallMode ? "default" : "outline"}
                  className={`flex-1 ${gameState.wallMode ? COLORS.actions.primary : COLORS.actions.outline}`}
                  onClick={handleToggleWallMode}
                  disabled={isAIMode && (gameState.currentPlayer === 1 || isAIThinking)}
                >
                  {gameState.wallMode ? "Mover" : "Muro"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 ${COLORS.actions.outline}`}
                    onClick={handleShowResetConfirm}
                    disabled={isAIMode && (gameState.currentPlayer === 1 || isAIThinking)}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" /> Reiniciar
                  </Button>
                  <Button variant="outline" size="icon" className={COLORS.actions.outline} onClick={handleToggleMuted}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={COLORS.actions.outline}
                    onClick={handleToggleDarkMode}
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Top right buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className={`${COLORS.ui.background} ${COLORS.ui.text} ${COLORS.ui.border} ${COLORS.ui.hover}`}
          onClick={handleReturnToMenu}
        >
          <Home />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`${COLORS.ui.background} ${COLORS.ui.text} ${COLORS.ui.border} ${COLORS.ui.hover}`}
          onClick={handleShowRules}
        >
          <HelpCircle />
        </Button>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <Card
            className={`max-w-lg w-full ${COLORS.ui.background} p-6 relative max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-300`}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 ${COLORS.ui.text} ${COLORS.ui.hover}`}
              onClick={handleCloseRules}
            >
              <X />
            </Button>

            <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Reglas de Quoridor</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-red-500 dark:text-red-400">Objetivo</h3>
                <p className={COLORS.ui.text}>Ser el primer jugador en llegar a la línea base opuesta del tablero.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400">Movimientos</h3>
                <ul className={`list-disc pl-5 space-y-1 ${COLORS.ui.text}`}>
                  <li>En tu turno, puedes mover tu ficha o colocar un muro.</li>
                  <li>Las fichas se mueven un espacio en horizontal o vertical (no en diagonal).</li>
                  <li>No puedes atravesar muros ni ocupar la misma casilla que otro jugador.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-500 dark:text-purple-400">Muros</h3>
                <ul className={`list-disc pl-5 space-y-1 ${COLORS.ui.text}`}>
                  <li>Cada jugador comienza con 10 muros.</li>
                  <li>Los muros bloquean el paso pero no pueden cerrar completamente el camino a la meta.</li>
                  <li>Los muros se colocan entre las casillas y ocupan dos espacios.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Controles</h3>
                <ul className={`list-disc pl-5 space-y-1 ${COLORS.ui.text}`}>
                  <li>Haz clic en una casilla para mover tu ficha.</li>
                  <li>Cambia al modo "Muro" para colocar muros.</li>
                  <li>Arrastra el ratón para rotar la cámara y ver mejor el tablero.</li>
                  {isMobile && (
                    <li className="font-semibold text-purple-600 dark:text-purple-400">
                      En dispositivos móviles, usa los controles táctiles en la parte inferior de la pantalla.
                    </li>
                  )}
                </ul>
              </div>

              {isAIMode && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-500 dark:text-emerald-400">Modo IA</h3>
                  <ul className={`list-disc pl-5 space-y-1 ${COLORS.ui.text}`}>
                    <li>
                      Estás jugando contra una IA de nivel{" "}
                      <span className={getAIDifficultyColor()}>{getAIDifficultyText()}</span>.
                    </li>
                    <li>La IA controlará al jugador Azul y tú al jugador Rojo.</li>
                    <li>Cada nivel de IA tiene diferentes estrategias y habilidades.</li>
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Créditos</h3>
                <p className={`${COLORS.ui.text} text-sm`}>
                  Juego desarrollado por <span className="font-semibold">Flavio Villanueva Medina</span>
                </p>
                <p className={`${COLORS.ui.text} text-sm`}>
                  Basado en el juego de mesa Quoridor creado por Mirko Marchesi.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile help modal */}
      {showMobileHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
          <Card
            className={`max-w-md w-full ${COLORS.ui.background} p-6 relative animate-in fade-in zoom-in duration-300`}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 ${COLORS.ui.text} ${COLORS.ui.hover}`}
              onClick={handleCloseMobileHelp}
            >
              <X />
            </Button>

            <div className="text-center mb-4">
              <Smartphone className="w-16 h-16 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Controles Móviles</h2>
            </div>

            <div className="space-y-4">
              <p className={COLORS.ui.text}>
                Hemos detectado que estás usando un dispositivo móvil. Para mejorar tu experiencia:
              </p>

              <ul className={`list-disc pl-5 space-y-2 ${COLORS.ui.text}`}>
                <li>
                  Usa los <strong>controles táctiles</strong> en la parte inferior de la pantalla para mover tu ficha y
                  colocar muros.
                </li>
                <li>
                  Puedes <strong>pellizcar para hacer zoom</strong> y <strong>deslizar para rotar</strong> la cámara.
                </li>
                <li>En modo muro, usa el botón de rotación para cambiar la orientación del muro.</li>
                <li>
                  Presiona el botón <strong>Colocar Muro</strong> para confirmar la colocación.
                </li>
              </ul>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                onClick={handleCloseMobileHelp}
              >
                Entendido
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Game over message with enhanced animation */}
      {showWinner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className={`p-8 ${COLORS.ui.background} max-w-md w-full animate-in zoom-in duration-300`}>
            <div className="text-center">
              <div
                className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${gameState.winner === 0 ? "bg-red-500" : "bg-blue-500"}`}
              >
                <div className="text-4xl animate-bounce">🏆</div>
              </div>

              <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ¡Victoria!
              </h2>

              <p
                className={`text-xl font-medium mb-6 ${gameState.winner === 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}
              >
                {isAIMode && gameState.winner === 1 ? (
                  <span className="flex items-center justify-center gap-2">
                    La IA <Brain className="h-5 w-5" /> ha ganado
                  </span>
                ) : isAIMode && gameState.winner === 0 ? (
                  "¡Has ganado a la IA!"
                ) : (
                  `El Jugador ${gameState.winner === 0 ? "Rojo" : "Azul"} ha ganado`
                )}
              </p>

              <div className="space-y-3">
                <Button className={`w-full ${COLORS.actions.primary} py-6 text-lg font-bold`} onClick={handleResetGame}>
                  Jugar de nuevo
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 dark:border-gray-700 py-4"
                  onClick={handleReturnToMenu}
                >
                  Volver al menú principal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 backdrop-blur-sm">
          <Card className={`max-w-sm w-full ${COLORS.ui.background} p-5 animate-in fade-in zoom-in duration-300`}>
            <CardTitle className="text-xl mb-4">¿Reiniciar juego?</CardTitle>
            <CardDescription className="mb-6">
              ¿Estás seguro de que quieres reiniciar la partida? Perderás todo el progreso actual.
            </CardDescription>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelReset}>
                Cancelar
              </Button>
              <Button className={COLORS.actions.primary} onClick={handleConfirmReset}>
                Reiniciar
              </Button>
            </div>
          </Card>
        </div>
      )}
      {showSoundNotification && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bg-yellow-500/80 dark:bg-yellow-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg z-[100] flex items-center gap-2 bottom-20 animate-in fade-in slide-in-from-bottom duration-300">
          <Volume2 className="h-5 w-5" />
          <span>Activa el sonido para una mejor experiencia</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismissSoundNotification}
            className="ml-2 hover:bg-yellow-600/80 dark:hover:bg-yellow-700/80 rounded-full h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>
      )}

      {/* AI thinking indicator */}
      {isAIMode && isAIThinking && gameState.currentPlayer === 1 && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bg-blue-500/80 dark:bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg z-[100] flex items-center gap-2 top-20 animate-in fade-in slide-in-from-top duration-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>La IA está pensando...</span>
        </div>
      )}

      {/* AI error notification */}
      {showAIError && aiError && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bg-red-500/80 dark:bg-red-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg z-[100] flex items-center gap-2 top-20 animate-in fade-in slide-in-from-top duration-300">
          <AlertTriangle className="h-5 w-5" />
          <span>{aiError}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismissAIError}
            className="ml-2 hover:bg-red-600/80 dark:hover:bg-red-700/80 rounded-full h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>
      )}
    </>
  )
}
