import { describe, it, expect } from "vitest"
import {
  createInitialGameState,
  isMovementBlocked,
  getValidMoves,
  isValidWallPlacement,
  placeWall,
  makeMove,
} from "../logic/quoridor-logic"

const cloneState = (overrides = {}) => ({
  ...createInitialGameState(),
  ...overrides,
})

describe("isMovementBlocked", () => {
  // Verifica que un muro vertical impida avanzar lateralmente entre dos casillas adyacentes
  it("detecta muros verticales que bloquean movimientos horizontales", () => {
    const walls = [{ x: 4, z: 0, orientation: "vertical" }]
    expect(isMovementBlocked(4, 0, 5, 0, walls)).toBe(true)
  })
})

describe("getValidMoves", () => {
  // Comprueba que se permita un salto recto cuando el rival está adyacente y no existen muros bloqueando
  it("incluye saltos directos cuando el oponente está adyacente y el espacio está libre", () => {
    const state = cloneState({
      players: [
        { x: 4, z: 4, wallsLeft: 10 },
        { x: 4, z: 5, wallsLeft: 10 },
      ],
    })

    const moves = getValidMoves(0, state)
    expect(moves).toEqual(expect.arrayContaining([{ x: 4, z: 6 }]))
  })

  // Garantiza que, si un muro impide el salto recto, se habiliten saltos diagonales legales
  it("recurre a saltos diagonales cuando un muro bloquea el salto recto", () => {
    const state = cloneState({
      players: [
        { x: 4, z: 4, wallsLeft: 10 },
        { x: 4, z: 5, wallsLeft: 10 },
      ],
      walls: [{ x: 3, z: 5, orientation: "horizontal" }],
    })

    const moves = getValidMoves(0, state)
    expect(moves).toEqual(expect.arrayContaining([{ x: 5, z: 5 }]))
  })
})

describe("isValidWallPlacement", () => {
  // Asegura que no se permitan muros que se solapen con otros ya colocados
  it("rechaza muros que se superponen con los existentes", () => {
    const state = cloneState({
      walls: [{ x: 2, z: 2, orientation: "horizontal" }],
    })

    const valid = isValidWallPlacement({ x: 2, z: 2, orientation: "horizontal" }, state)
    expect(valid).toBe(false)
  })
})

describe("placeWall", () => {
  // Comprueba que colocar un muro válido descuente inventario, guarde el muro y cambie el turno
  it("consume un muro, lo registra y cambia el turno cuando la colocación es válida", () => {
    const startingState = cloneState({ wallMode: true })

    const result = placeWall(1, 1, "horizontal", startingState)

    expect(result.walls).toHaveLength(1)
    expect(result.walls[0]).toMatchObject({ x: 1, z: 1, orientation: "horizontal" })
    expect(result.players[0].wallsLeft).toBe(startingState.players[0].wallsLeft - 1)
    expect(result.currentPlayer).toBe(1)
    expect(result.validMoves.length).toBeGreaterThan(0)
  })
})

describe("makeMove", () => {
  // Verifica que un movimiento ganador actualice posición, declare victoria y detenga movimientos futuros
  it("mueve al jugador, alterna el turno y marca al ganador al alcanzar la fila objetivo", () => {
    const state = cloneState({
      players: [
        { x: 4, z: 7, wallsLeft: 10 },
        { x: 0, z: 0, wallsLeft: 10 },
      ],
    })

    const result = makeMove(4, 8, state)

    expect(result.players[0].z).toBe(8)
    expect(result.winner).toBe(0)
    expect(result.currentPlayer).toBe(1)
    expect(result.validMoves).toHaveLength(0)
  })
})
