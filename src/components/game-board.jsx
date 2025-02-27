"use client"

import { useRef } from "react"
import { useGameContext } from "../context/game-context"
import BoardTile from "./board-tile"
import PlayerPiece from "./player-piece"
import SimpleWall from "./simple-wall"
import WallGrid from "./wall-grid"
import { Vector3 } from "three"

export default function GameBoard() {
  const boardRef = useRef()
  const { gameState, selectedTile, hoveredWallPosition } = useGameContext()

  // Remove infinite rotation
  // useFrame((state, delta) => {
  //   if (boardRef.current) {
  //     boardRef.current.rotation.y += delta * 0.05
  //   }
  // })

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#F0E6E6" />
      </mesh>

      {/* Board grid */}
      {Array.from({ length: 9 }).map((_, x) =>
        Array.from({ length: 9 }).map((_, z) => (
          <BoardTile
            key={`${x}-${z}`}
            position={[x - 4, 0, z - 4]}
            tileX={x}
            tileZ={z}
            isSelected={selectedTile?.x === x && selectedTile?.z === z}
            isValidMove={gameState.validMoves.some((move) => move.x === x && move.z === z)}
          />
        )),
      )}

      {/* Wall placement grid */}
      <WallGrid />

      {/* Placed walls */}
      {gameState.walls.map((wall, index) => (
        <SimpleWall
          key={`wall-${index}`}
          position={[wall.x - 4, 0.5, wall.z - 4]}
          orientation={wall.orientation}
          isPlaced={true}
        />
      ))}

      {/* Hovered wall preview */}
      {hoveredWallPosition && (
        <SimpleWall
          position={[hoveredWallPosition.x - 4, 0.5, hoveredWallPosition.z - 4]}
          orientation={hoveredWallPosition.orientation}
          isPlaced={false}
          isHovered={true}
          isValid={gameState.isValidWallPlacement(hoveredWallPosition)}
        />
      )}

      {/* Player pieces */}
      <PlayerPiece
        position={new Vector3(gameState.players[0].x - 4, 0.5, gameState.players[0].z - 4)}
        color="#FFB6C1"
        isCurrentPlayer={gameState.currentPlayer === 0}
      />
      <PlayerPiece
        position={new Vector3(gameState.players[1].x - 4, 0.5, gameState.players[1].z - 4)}
        color="#ADD8E6"
        isCurrentPlayer={gameState.currentPlayer === 1}
      />

      {/* Wall counters - simplified */}
      <mesh position={[-5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[0].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 0 ? "#FFB6C1" : "#FFD6D6"} />
      </mesh>
      <mesh position={[5, 0.5, 0]}>
        <boxGeometry args={[1, gameState.players[1].wallsLeft * 0.1 + 0.1, 1]} />
        <meshStandardMaterial color={gameState.currentPlayer === 1 ? "#ADD8E6" : "#D6E6FF"} />
      </mesh>
    </group>
  )
}



/*

Descripción del Problema:

Actualmente, el juego presenta los siguientes errores:

Peones que atraviesan los muros: La lógica de colisión y validación de movimiento no está impidiendo que los personajes se muevan a través de los muros. Colocación de muros en posiciones incorrectas: Los muros se colocan sobre los bloques en lugar de en la ranura entre ellos, lo que rompe la coherencia visual y física. Bloqueo total del camino: Se permite colocar muros de forma que bloquean completamente el camino de alguno de los jugadores, lo cual es ilegal según las reglas de Quoridor. Superposición de muros en la misma línea: Aunque se corrigió que no se crucen en forma de “X”, aún es posible colocar muros en posiciones laterales que se superponen en la misma línea, lo que no está permitido. Referencia de las reglas (adaptado de Wikipedia):

El tablero es de 9x9 casillas. Cada muro se coloca en la ranura entre casillas, ocupando el espacio equivalente a dos casillas adyacentes (horizontal o vertical). No está permitido encerrar totalmente al adversario; siempre debe existir al menos un camino hacia la meta. Si dos peones están enfrentados, se permiten saltos (incluyendo el salto diagonal cuando sea posible), pero nunca se debe permitir atravesar un muro. Un muro ya colocado en una línea impide la colocación de otro muro en esa misma línea que se superponga, aun si parece haber “espacio” libre. Instrucciones para la Corrección:

Validación de Movimiento y Colisión de Peones:

Implementar detección de colisiones: Revisa la lógica de movimiento de los peones para que, antes de avanzar a una casilla, se verifique la existencia de un muro en la ranura que separa la casilla actual de la casilla destino. Bloqueo físico: Asegúrate de que la función de validación de movimiento impida el paso a través de muros, usando las coordenadas exactas de la ranura donde se ubica cada muro. Posicionamiento de Muros en las Ranuras Correctas:

Cálculo de la ranura: Asegúrate de que la función snapToWallPosition (u otra similar) mapee correctamente la posición del cursor a la ranura exacta entre dos casillas, en lugar de sobre los bloques. Ajuste con la cuadrícula: Verifica que los cálculos de posición tengan en cuenta la estructura del tablero (9x9) y que se apliquen las transformaciones necesarias para ubicar el muro en la intersección correcta. Validación de Bloqueo de Caminos (Path Finding):

Algoritmo BFS (u otro): Antes de confirmar la colocación de un muro, ejecuta un algoritmo de búsqueda (BFS) para verificar que, al agregar el nuevo muro, ambos jugadores conserven al menos un camino válido hacia sus respectivas metas. Retroalimentación inmediata: Si la colocación de un muro bloquea completamente el camino de alguno de los jugadores, la acción debe ser rechazada y debe mostrarse un mensaje o cambio visual (por ejemplo, colorear la previsualización en rojo). Prevención de Superposición de Muros en la Misma Línea:

Restricción de posiciones: Añade una validación que impida colocar un muro en una línea si ya existe otro muro en esa misma línea que cubre parte de la misma ranura. Esto se debe hacer comparando las coordenadas y la orientación del muro a colocar con los ya existentes. Verificación de espacio: Aunque pueda parecer que hay “espacio” libre lateralmente, la lógica debe impedir cualquier superposición que rompa la integridad de la línea de muros. Documentación y Testing:

Documenta cada función o bloque de código modificado para que se entienda cómo se está realizando la validación y posicionamiento. Escribe pruebas unitarias o de integración que verifiquen que: Los peones no puedan moverse a través de un muro. Los muros se coloquen únicamente en las ranuras correctas. No se pueda colocar un muro que bloquee totalmente el camino. No se permita la superposición de muros en la misma línea. Resumen: Corrige la lógica de validación para que:

Los peones respeten las barreras físicas (no atraviesen los muros). Los muros se posicionen únicamente en la ranura entre casillas. La colocación de un muro se verifique con un algoritmo (como BFS) para asegurar que siempre quede un camino libre. No se permita la superposición de muros en la misma línea. Por favor, implementa estos cambios y asegúrate de documentar cada paso para facilitar futuras revisiones. ¡Gracias!

El tablero del Quoridor, a diferencia del utilizado en el Ajedrez, consta de una cuadrícula de 9x9 (es decir, 81 casilleros en total). Cada jugador, como se dijo, controla un peón, que debe comenzar en alguno de los bordes del tablero. Los peones deben ubicarse en el centro de la fila y enfrentados el uno del otro. Antes de comenzar, se dividen los 20 bloques en partes iguales (así, cada jugador tiene 10 si se juega de a 2, y 5 si se hace de a cuatro). Los bloques deben ubicarse en la ranura ubicada entre cada casillero. Por su ancho, cada bloque corta el camino de dos filas o columnas (según si se ubica en horizontal o vertical).

No está permitido encerrar totalmente al adversario.

En cada turno, el jugador puede optar por mover su peón (que avanza un solo casillero por turno y no puede moverse en diagonal) o colocar una nueva pared, siempre que no haya utilizado todas. Cuando dos peones quedan enfrentados (como es el caso de la foto que ilustra este artículo) pueden saltar al otro, avanzando excepcionalmente dos casilleros, o evadirlo moviéndose diagonalmente un casillero hacia adelante. Las reglas oficiales no contemplan cómo proceder si dos peones se ven encerrados entre dos paredes y el borde del tablero.

Observa la implementación actual del juego Quoridor 3D y corrige los siguientes problemas relacionados con la colocación y validación de muros:

Longitud y Posicionamiento de los Muros

Cada muro en Quoridor debe abarcar solo la ranura entre dos casillas (2 espacios) en orientación horizontal o vertical. Impide la creación de barreras continuas: si ya hay un muro en una línea, el siguiente no puede extenderlo ni superponerse en la misma ranura. Verificación de Superposición en la Misma Línea

Antes de confirmar la colocación de un nuevo muro, revisa si se solapa parcial o totalmente con otro muro en la misma fila o columna. Rechaza la acción si el nuevo muro quedaría contiguo sin respetar la separación necesaria o si duplicaría parte del espacio ya ocupado. Algoritmo de Path Finding (BFS/DFS)

Al previsualizar o intentar colocar un muro, recalcula la matriz de colisiones para reflejar esa barrera adicional. Aplica un algoritmo BFS/DFS desde la posición de cada jugador hacia su fila meta. Si alguno no puede llegar, rechaza la colocación. Muestra retroalimentación (por ejemplo, muro en rojo) si la acción bloquea completamente el camino. Respeto a las Reglas de No Encerrar Completamente

Asegúrate de que siempre quede, como mínimo, un camino libre para ambos jugadores. No permitas encerrar totalmente a ningún jugador; el BFS/DFS debe detectar bloqueos totales o parciales que impidan alcanzar la meta. Actualización y Documentación

Documenta el manejo de coordenadas, la forma en que se marcan las celdas/bordes como bloqueados y cómo se ejecuta el BFS/DFS. Verifica en tiempo real que la colocación del muro no produzca muros excesivamente largos ni solapamientos en la misma línea. El objetivo es garantizar que cada muro se limite a 2 casillas, no se superponga con muros existentes en la misma línea y no bloquee totalmente el camino de los jugadores. Implementa y documenta estos cambios para cumplir fielmente las reglas de Quoridor.

*/