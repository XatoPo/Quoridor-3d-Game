"use client";

import { useState } from "react";
import { useGameContext } from "../context/game-context";
import { Button } from "./ui/button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  RotateCw,
} from "lucide-react";

export default function MobileControls() {
  const {
    gameState,
    makeMove,
    placeWall,
    hoveredWallPosition,
    setHoveredWallPosition,
    toggleWallMode,
    triggerSound,
  } = useGameContext();

  const [showControls, setShowControls] = useState(true);
  const [wallOrientation, setWallOrientation] = useState("horizontal");
  const [wallPosition, setWallPosition] = useState({ x: 4, z: 4 });

  // Get current player position
  const currentPlayer = gameState.players[gameState.currentPlayer];

  // Handle movement buttons
  const handleMove = (dx, dz) => {
    triggerSound();
    const newX = currentPlayer.x + dx;
    const newZ = currentPlayer.z + dz;

    // Check if the move is valid
    if (
      gameState.validMoves.some((move) => move.x === newX && move.z === newZ)
    ) {
      makeMove(newX, newZ);
    }
  };

  // Handle wall position adjustment
  const handleAdjustWall = (dx, dz) => {
    triggerSound();
    const newX = Math.max(0, Math.min(7, wallPosition.x + dx));
    const newZ = Math.max(0, Math.min(7, wallPosition.z + dz));

    setWallPosition({ x: newX, z: newZ });
    setHoveredWallPosition({
      x: newX,
      z: newZ,
      orientation: wallOrientation,
    });
  };

  // Toggle wall orientation
  const handleToggleOrientation = () => {
    triggerSound();
    const newOrientation =
      wallOrientation === "horizontal" ? "vertical" : "horizontal";
    setWallOrientation(newOrientation);
    setHoveredWallPosition({
      ...wallPosition,
      orientation: newOrientation,
    });
  };

  // Confirm wall placement
  const handleConfirmWall = () => {
    triggerSound();
    if (
      hoveredWallPosition &&
      gameState.isValidWallPlacement(hoveredWallPosition)
    ) {
      placeWall(
        hoveredWallPosition.x,
        hoveredWallPosition.z,
        hoveredWallPosition.orientation
      );
    }
  };

  // Toggle controls visibility
  const handleToggleControls = () => {
    triggerSound();
    setShowControls(!showControls);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
      <div className="flex flex-col items-center">
        {/* Toggle button */}
        <Button
          onClick={handleToggleControls}
          className="mb-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
        >
          {showControls ? <X size={24} /> : <ArrowUp size={24} />}
        </Button>

        {showControls && (
          <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            {/* Mode indicator */}
            <div className="text-center mb-4">
              <span className="font-bold">
                Modo: {gameState.wallMode ? "Colocar Muro" : "Mover Ficha"}
              </span>
              <Button
                onClick={toggleWallMode}
                className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                Cambiar
              </Button>
            </div>

            {/* Movement controls */}
            {!gameState.wallMode ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div></div>
                <Button
                  onClick={() => handleMove(0, -1)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <ArrowUp size={24} />
                </Button>
                <div></div>

                <Button
                  onClick={() => handleMove(-1, 0)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <ArrowLeft size={24} />
                </Button>
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                </div>
                <Button
                  onClick={() => handleMove(1, 0)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <ArrowRight size={24} />
                </Button>

                <div></div>
                <Button
                  onClick={() => handleMove(0, 1)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <ArrowDown size={24} />
                </Button>
                <div></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wall position controls */}
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <Button
                    onClick={() => handleAdjustWall(0, -1)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <ArrowUp size={24} />
                  </Button>
                  <div></div>

                  <Button
                    onClick={() => handleAdjustWall(-1, 0)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <ArrowLeft size={24} />
                  </Button>
                  <Button
                    onClick={handleToggleOrientation}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    <RotateCw size={24} />
                  </Button>
                  <Button
                    onClick={() => handleAdjustWall(1, 0)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <ArrowRight size={24} />
                  </Button>

                  <div></div>
                  <Button
                    onClick={() => handleAdjustWall(0, 1)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <ArrowDown size={24} />
                  </Button>
                  <div></div>
                </div>

                {/* Wall orientation indicator */}
                <div className="flex justify-center items-center gap-2">
                  <span>
                    Orientación:{" "}
                    {wallOrientation === "horizontal"
                      ? "Horizontal"
                      : "Vertical"}
                  </span>
                </div>

                {/* Confirm button */}
                <Button
                  onClick={handleConfirmWall}
                  className={`w-full ${
                    hoveredWallPosition &&
                    gameState.isValidWallPlacement(hoveredWallPosition)
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                  disabled={
                    !hoveredWallPosition ||
                    !gameState.isValidWallPlacement(hoveredWallPosition)
                  }
                >
                  <Check size={24} className="mr-2" />
                  Colocar Muro
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
