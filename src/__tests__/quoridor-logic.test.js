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
  it("detects vertical walls that block horizontal moves", () => {
    const walls = [{ x: 4, z: 0, orientation: "vertical" }]
    expect(isMovementBlocked(4, 0, 5, 0, walls)).toBe(true)
  })
})

describe("getValidMoves", () => {
  it("includes direct jumps when the opponent is adjacent and space is open", () => {
    const state = cloneState({
      players: [
        { x: 4, z: 4, wallsLeft: 10 },
        { x: 4, z: 5, wallsLeft: 10 },
      ],
    })

    const moves = getValidMoves(0, state)
    expect(moves).toEqual(expect.arrayContaining([{ x: 4, z: 6 }]))
  })

  it("falls back to diagonal jumps when a wall blocks the straight jump", () => {
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
  it("rejects walls that overlap existing ones", () => {
    const state = cloneState({
      walls: [{ x: 2, z: 2, orientation: "horizontal" }],
    })

    const valid = isValidWallPlacement({ x: 2, z: 2, orientation: "horizontal" }, state)
    expect(valid).toBe(false)
  })
})

describe("placeWall", () => {
  it("consumes a wall, stores it on the board, and switches turns when placement is valid", () => {
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
  it("moves the player, toggles the turn, and flags the winner when the goal row is reached", () => {
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
