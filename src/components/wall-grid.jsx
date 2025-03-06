"use client"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { useGameContext } from "../context/game-context"
import * as THREE from "three"
import { snapToWallPosition } from "../logic/quoridor-logic"

export default function WallGrid() {
  const { gameState, setHoveredWallPosition, isDarkMode } = useGameContext()
  const gridRef = useRef()
  const { camera, size } = useThree()
  const raycaster = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const intersection = new THREE.Vector3()
  const [isMobile, setIsMobile] = useState(false)

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

  // Handle wall placement
  const handleWallPlacement = (event, isClick = false) => {
    if (!gameState.wallMode || isMobile) return // Skip on mobile - use mobile controls instead
    event.stopPropagation()

    const x = (event.offsetX / size.width) * 2 - 1
    const y = -(event.offsetY / size.height) * 2 + 1

    console.group("Wall Placement Debug")
    console.log("Mouse coordinates:", { x, y })
    console.log("Screen size:", size)

    raycaster.setFromCamera({ x, y }, camera)

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      if (gridRef.current) {
        intersection.applyMatrix4(gridRef.current.matrixWorld.invert())
      }

      console.log("Intersection point:", {
        x: intersection.x,
        z: intersection.z,
      })

      const wallPos = snapToWallPosition(intersection)
      console.log("Snapped wall position:", wallPos)

      // Debug visualization of affected grid cells
      const affectedCells = getAffectedCells(wallPos)
      console.log("Affected cells:", affectedCells)

      if (isClick) {
        if (gameState.isValidWallPlacement(wallPos)) {
          console.log("Placing wall at:", wallPos)
          gameState.placeWall(wallPos.x, wallPos.z, wallPos.orientation)
        } else {
          console.log("Invalid wall placement")
        }
      } else {
        setHoveredWallPosition(wallPos)
      }
    }

    console.groupEnd()
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

      {/* Grid lines for wall placement - adjusted for better visibility */}
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
            <lineBasicMaterial color={isDarkMode ? "#94A3B8" : "#475569"} transparent opacity={0.6} />
          </line>
          {/* Horizontal lines */}
          <line>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([-4, 0.01, i - 3.5, 4, 0.01, i - 3.5]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={isDarkMode ? "#94A3B8" : "#475569"} transparent opacity={0.6} />
          </line>
        </group>
      ))}
    </group>
  )
}
