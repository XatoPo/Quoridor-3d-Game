"use client"

import { useRef } from "react"
import { useThree } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"
import { snapToWallPosition, isWithinBoard } from "../utils/wall-placement"
import { validateWallPlacement } from "../utils/path-finding"

export default function WallGrid() {
  const { gameState, setHoveredWallPosition } = useGameContext()
  const gridRef = useRef()
  const { camera, size } = useThree()
  const raycaster = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const intersection = new THREE.Vector3()

  // Handle wall placement
  const handleWallPlacement = (event, isClick = false) => {
    if (!gameState.wallMode) return
    event.stopPropagation()

    const x = (event.offsetX / size.width) * 2 - 1
    const y = -(event.offsetY / size.height) * 2 + 1

    raycaster.setFromCamera({ x, y }, camera)

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      if (gridRef.current) {
        intersection.applyMatrix4(gridRef.current.matrixWorld.invert())
      }

      const wallPos = snapToWallPosition(intersection)

      if (!isWithinBoard(wallPos)) {
        if (!isClick) setHoveredWallPosition(null)
        return
      }

      const isValid = validateWallPlacement(wallPos, [gameState.players[0], gameState.players[1]], gameState.walls, 9)

      if (isClick) {
        if (isValid) {
          gameState.placeWall(wallPos.x, wallPos.z, wallPos.orientation)
        }
      } else {
        setHoveredWallPosition(wallPos)
      }
    }
  }

  return (
    <group ref={gridRef}>
      {/* Invisible wall placement grid */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handleWallPlacement}
        onClick={(e) => handleWallPlacement(e, true)}
      >
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Grid lines for wall placement positions */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          {/* Vertical lines */}
          <line>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([i - 3.5, 0.01, -4, i - 3.5, 0.01, 4]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00000015" />
          </line>
          {/* Horizontal lines */}
          <line>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([-4, 0.01, i - 3.5, 4, 0.01, i - 3.5]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00000015" />
          </line>
        </group>
      ))}
    </group>
  )
}

