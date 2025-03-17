"use client"

import { useEffect, useRef, useState } from "react"
import { useGameContext } from "../context/game-context"

// Sound file URLs relative to the public folder
const SOUNDS = {
  movement: "/sounds/move.mp3",
  wall: "/sounds/wall.mp3",
  win: "/sounds/win.mp3",
  click: "/sounds/click.mp3",
  music: "/sounds/background.mp3",
}

export default function SoundEffects() {
  const { gameState, lastAction, isMuted, soundTrigger } = useGameContext()
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const soundQueueRef = useRef([])
  const isPlayingRef = useRef(false)

  // Audio refs
  const moveSound = useRef(null)
  const wallSound = useRef(null)
  const winSound = useRef(null)
  const clickSound = useRef(null)
  const musicSound = useRef(null)

  // Initialize audio elements
  useEffect(() => {
    // Create new Audio objects
    moveSound.current = new Audio(SOUNDS.movement)
    wallSound.current = new Audio(SOUNDS.wall)
    winSound.current = new Audio(SOUNDS.win)
    clickSound.current = new Audio(SOUNDS.click)
    musicSound.current = new Audio(SOUNDS.music)

    // Set up background music
    if (musicSound.current) {
      musicSound.current.volume = 0.3
      musicSound.current.loop = true
    }

    // Mark sounds as loaded
    setSoundsLoaded(true)

    return () => {
      // Cleanup
      const allSounds = [moveSound, wallSound, winSound, clickSound, musicSound]
      allSounds.forEach((sound) => {
        if (sound.current) {
          sound.current.pause()
          sound.current.src = ""
        }
      })
    }
  }, [])

  // Update mute state
  useEffect(() => {
    if (!soundsLoaded) return

    const allSounds = [moveSound, wallSound, winSound, clickSound, musicSound]

    allSounds.forEach((sound) => {
      if (sound.current) {
        sound.current.muted = isMuted
      }
    })

    if (!isMuted && musicSound.current) {
      // Try to play music when unmuted
      const playPromise = musicSound.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          // Ignore AbortError as it's expected when changing mute state
          if (e.name !== "AbortError") {
            console.log("Music play prevented:", e)
          }
        })
      }
    }
  }, [isMuted, soundsLoaded])

  // Función para reproducir sonidos de forma segura
  const playSoundSafely = async (soundRef) => {
    if (!soundRef.current || isMuted) return

    try {
      // Resetear el sonido
      soundRef.current.pause()
      soundRef.current.currentTime = 0

      // Reproducir el sonido
      await soundRef.current.play()
    } catch (error) {
      // Ignorar errores de AbortError ya que son esperados cuando se cambia rápidamente entre sonidos
      if (error.name !== "AbortError") {
        console.log("Sound play error:", error)
      }
    }
  }

  // Sistema de cola para reproducir sonidos en secuencia
  const processQueue = async () => {
    if (isPlayingRef.current || soundQueueRef.current.length === 0 || isMuted) return

    isPlayingRef.current = true
    const nextSound = soundQueueRef.current.shift()

    try {
      await playSoundSafely(nextSound)
      // Pequeña pausa entre sonidos
      setTimeout(() => {
        isPlayingRef.current = false
        processQueue()
      }, 50)
    } catch (error) {
      isPlayingRef.current = false
      processQueue()
    }
  }

  // Añadir sonido a la cola
  const queueSound = (soundRef) => {
    if (!soundRef.current || isMuted) return

    soundQueueRef.current.push(soundRef)
    if (!isPlayingRef.current) {
      processQueue()
    }
  }

  // Play sounds based on lastAction
  useEffect(() => {
    if (isMuted || !soundsLoaded || !lastAction) return

    if (lastAction === "movement") {
      queueSound(moveSound)
    } else if (lastAction === "wall") {
      queueSound(wallSound)
    } else if (lastAction === "click") {
      queueSound(clickSound)
    }
  }, [lastAction, isMuted, soundsLoaded])

  // Play sounds based on soundTrigger
  useEffect(() => {
    if (isMuted || !soundsLoaded || soundTrigger === 0) return

    queueSound(clickSound)
  }, [soundTrigger, isMuted, soundsLoaded])

  // Play win sound
  useEffect(() => {
    if (gameState.winner === null || isMuted || !soundsLoaded) return

    queueSound(winSound)
  }, [gameState.winner, isMuted, soundsLoaded])

  return null
}
