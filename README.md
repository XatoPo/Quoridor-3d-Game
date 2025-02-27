# Quoridor 3D - Juego de Estrategia en la Web 🏆🎲

![Quoridor 3D](https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Quoridor_2J.JPG/250px-Quoridor_2J.JPG)  
**Versión web interactiva y visualmente atractiva de Quoridor, desarrollada con tecnologías modernas.**

---

## 📌 Descripción del Proyecto

**Quoridor 3D** es una implementación web del famoso juego de estrategia **Quoridor**, renderizado en 3D con gráficos inmersivos y una interfaz intuitiva. Este juego se enfoca en una experiencia de usuario fluida, integrando animaciones, efectos visuales y una lógica de juego precisa.

---

## 🚀 Tecnologías Utilizadas

- **React** + **Vercel v0** para el frontend
- **React Three Fiber** para gráficos en 3D
- **Tailwind CSS** para estilización moderna y responsiva
- **Context API** para la gestión del estado del juego
- **GSAP** para animaciones y transiciones suaves
- **Vite** para una carga rápida y optimizada

---

## 🎨 Inspiración y Diseño

El proyecto se inspiró en la versión física del juego Quoridor, con un enfoque en mantener la estética minimalista pero visualmente atractiva. Se optó por una paleta de colores **pastel** para dar un aspecto más amigable y limpio, mejorando la experiencia visual.

---

## 📋 Especificaciones Técnicas

- **Tablero**: 9x9 con separación de ranuras para colocación de muros
- **Movimientos**: Validación de posiciones según reglas oficiales
- **Muros**: Restricción de colocación válida y bloqueo de caminos
- **Cámara**: Rotación automática según el turno del jugador
- **Indicadores**: Señalización de movimientos válidos y muros restantes
- **Interfaz Adaptable**: Compatible con diferentes dispositivos y tamaños de pantalla

---

## 📖 Manual de Uso 🕹️

1. **Inicio del Juego**
   - Elige quién inicia.
   - Cada jugador tiene **10 muros** disponibles.

2. **Movimientos**
   - Click en las casillas resaltadas para mover tu ficha.
   - Si hay un jugador en la casilla adyacente, puedes saltarlo.

3. **Colocación de Muros**
   - Activa el modo **"Colocar Muro"**.
   - Selecciona una ranura válida para colocar el muro.
   - No puedes bloquear completamente el camino del oponente.

4. **Ganar el Juego**
   - Gana el jugador que llegue primero al lado opuesto del tablero.

---

## 🎮 Manual del Juego

**Objetivo**: Ser el primer jugador en alcanzar la fila opuesta del tablero.

### 🔹 Reglas Básicas
- Cada turno, un jugador puede **mover su ficha** o **colocar un muro**.
- Un muro debe colocarse en una ranura válida y no puede dividir el tablero completamente.
- Se permite saltar sobre el otro jugador si está adyacente.

### 🔸 Estrategia
- Usa los muros para desviar el camino de tu oponente.
- Planea tus movimientos con anticipación para no quedar atrapado.
- Aprovecha los saltos para avanzar más rápido.

---

## 📥 Instalación y Ejecución

1. Clona el repositorio:
   ```bash
   git clone git@github.com:XatoPo/Quoridor-3d-Game.git
   cd Quoridor-3d-Game
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Accede en el navegador a `http://localhost:5173`

---

## 📢 Contribuciones

¡Este proyecto es de código abierto! Si deseas contribuir:
- Haz un **fork** del repositorio
- Crea una **rama** con tu mejora (`git checkout -b mejora-nueva`)
- Realiza un **commit** (`git commit -m 'Agregada nueva funcionalidad'`)
- Haz un **push** a la rama (`git push origin mejora-nueva`)
- Abre un **pull request** 🚀

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.

📩 _Desarrollado con pasión por Flavio Villanueva Medina_

