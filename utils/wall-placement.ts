import type * as THREE from "three"

// Tipos para el sistema de coordenadas del tablero
export interface GridPosition {
  x: number
  z: number
}

export interface WallPosition extends GridPosition {
  orientation: "horizontal" | "vertical"
}

// Constantes para el sistema de coordenadas
export const BOARD_SIZE = 9
export const CELL_SIZE = 1
export const WALL_THICKNESS = 0.1
export const WALL_HEIGHT = 0.4
export const WALL_LENGTH = 2

// Función para convertir coordenadas del mundo a coordenadas de la cuadrícula
export function worldToGrid(point: THREE.Vector3): GridPosition {
  return {
    x: Math.round(point.x + 4),
    z: Math.round(point.z + 4),
  }
}

// Función para determinar la posición exacta del muro en la cuadrícula
export function snapToWallPosition(point: THREE.Vector3): WallPosition {
  const gridX = point.x + 4
  const gridZ = point.z + 4

  // Determinar si estamos más cerca de una línea vertical u horizontal
  const fracX = gridX - Math.floor(gridX)
  const fracZ = gridZ - Math.floor(gridZ)

  // Si estamos más cerca de una línea vertical
  if (Math.abs(fracX - 0.5) < Math.abs(fracZ - 0.5)) {
    return {
      x: Math.round(gridX),
      z: Math.floor(gridZ),
      orientation: "vertical",
    }
  }

  // Si estamos más cerca de una línea horizontal
  return {
    x: Math.floor(gridX),
    z: Math.round(gridZ),
    orientation: "horizontal",
  }
}

// Función para verificar si dos muros se intersectan
export function checkWallIntersection(wall1: WallPosition, wall2: WallPosition): boolean {
  if (wall1.orientation === wall2.orientation) {
    return wall1.x === wall2.x && wall1.z === wall2.z
  }

  if (wall1.orientation === "horizontal") {
    return wall1.x === wall2.x && wall1.z === wall2.z
  } else {
    return wall1.x === wall2.x && wall1.z === wall2.z
  }
}

// Función para verificar si una posición está dentro del tablero
export function isWithinBoard(pos: WallPosition): boolean {
  if (pos.orientation === "horizontal") {
    return pos.x >= 0 && pos.x < BOARD_SIZE - 1 && pos.z > 0 && pos.z < BOARD_SIZE
  } else {
    return pos.x > 0 && pos.x < BOARD_SIZE && pos.z >= 0 && pos.z < BOARD_SIZE - 1
  }
}

// Función para obtener las casillas afectadas por un muro
export function getAffectedCells(wall: WallPosition): GridPosition[] {
  if (wall.orientation === "horizontal") {
    return [
      { x: wall.x, z: wall.z - 1 },
      { x: wall.x + 1, z: wall.z - 1 },
      { x: wall.x, z: wall.z },
      { x: wall.x + 1, z: wall.z },
    ]
  } else {
    return [
      { x: wall.x - 1, z: wall.z },
      { x: wall.x - 1, z: wall.z + 1 },
      { x: wall.x, z: wall.z },
      { x: wall.x, z: wall.z + 1 },
    ]
  }
}

