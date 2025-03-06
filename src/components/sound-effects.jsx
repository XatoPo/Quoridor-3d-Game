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
          console.log("Music play prevented:", e)
        })
      }
    }
  }, [isMuted, soundsLoaded])

  // Play sounds based on lastAction
  useEffect(() => {
    if (isMuted || !soundsLoaded || !lastAction) return

    console.log("Playing sound for action:", lastAction)

    const playSound = (soundRef) => {
      if (!soundRef.current) return

      // Stop and reset the sound
      soundRef.current.pause()
      soundRef.current.currentTime = 0

      // Play the sound
      const playPromise = soundRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.log("Sound play error:", e)
        })
      }
    }

    if (lastAction === "movement") {
      playSound(moveSound)
    } else if (lastAction === "wall") {
      playSound(wallSound)
    } else if (lastAction === "click") {
      playSound(clickSound)
    }
  }, [lastAction, isMuted, soundsLoaded])

  // Play sounds based on soundTrigger
  useEffect(() => {
    if (isMuted || !soundsLoaded || soundTrigger === 0) return

    console.log("Sound trigger activated:", soundTrigger)

    if (clickSound.current) {
      clickSound.current.pause()
      clickSound.current.currentTime = 0
      clickSound.current.play().catch((e) => console.log("Click sound error:", e))
    }
  }, [soundTrigger, isMuted, soundsLoaded])

  // Play win sound
  useEffect(() => {
    if (gameState.winner === null || isMuted || !soundsLoaded) return

    console.log("Playing win sound")

    if (winSound.current) {
      winSound.current.play().catch((e) => console.log("Win sound error:", e))
    }
  }, [gameState.winner, isMuted, soundsLoaded])

  return null
}
