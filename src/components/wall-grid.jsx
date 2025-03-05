"use client"

import { useRef } from "react"
import { useThree } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"
import { snapToWallPosition } from "../logic/quoridor-logic"

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

      // Debug visualization of affected grid cells
      const affectedCells = getAffectedCells(wallPos)

      if (isClick) {
        if (gameState.isValidWallPlacement(wallPos)) {
          gameState.placeWall(wallPos.x, wallPos.z, wallPos.orientation)
        } else {
          console.log("Invalid wall placement")
        }
      } else {
        setHoveredWallPosition(wallPos)
      }
    }
  }

  // Helper function to get affected grid cells for visualization
  const getAffectedCells = (wallPos) => {
    if (wallPos.orientation === "horizontal") {
      return [
        { x: wallPos.x, z: wallPos.z - 1 },
        { x: wallPos.x + 1, z: wallPos.z - 1 },
        { x: wallPos.x, z: wallPos.z },
        { x: wallPos.x + 1, z: wallPos.z },
      ]
    } else {
      return [
        { x: wallPos.x - 1, z: wallPos.z },
        { x: wallPos.x - 1, z: wallPos.z + 1 },
        { x: wallPos.x, z: wallPos.z },
        { x: wallPos.x, z: wallPos.z + 1 },
      ]
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

      {/* Grid lines for wall placement - adjusted to show exact placement positions */}
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
