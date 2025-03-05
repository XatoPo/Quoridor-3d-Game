"use client"

import { useEffect, useRef } from "react"
//import { useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { useGameContext } from "../context/game-context"

export default function CameraController() {
  //const { camera } = useThree()
  const { gameState } = useGameContext()
  const targetPosition = useRef(new Vector3(0, 10, 10))
  const targetLookAt = useRef(new Vector3(0, 0, 0))

  // Update camera target position and lookAt based on current player
  useEffect(() => {
    const player = gameState.players[gameState.currentPlayer]

    // Position camera behind current player
    if (gameState.currentPlayer === 0) {
      // Player 1 (red) - camera from bottom
      targetPosition.current.set(player.x - 4, 10, player.z - 4 + 8)
      targetLookAt.current.set(player.x - 4, 0, player.z - 4)
    } else {
      // Player 2 (blue) - camera from top
      targetPosition.current.set(player.x - 4, 10, player.z - 4 - 8)
      targetLookAt.current.set(player.x - 4, 0, player.z - 4)
    }
  }, [gameState.currentPlayer, gameState.players])

  // Remove smooth camera transition
  // useFrame(() => {
  //   camera.position.lerp(targetPosition.current, 0.05)
  //   camera.lookAt(targetLookAt.current)
  // })

  return null
}
