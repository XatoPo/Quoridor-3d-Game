# Quoridor 3D - Juego de Estrategia en la Web 🏆🎲

![Quoridor 3D](https://upload.wikimedia.org/wikipedia/commons/8/84/Quoridor_1.jpg)

**Versión web interactiva y visualmente atractiva de Quoridor, desarrollada con tecnologías modernas.**

---

## 📌 Descripción del Proyecto

**Quoridor 3D** es una implementación web del famoso juego de estrategia **Quoridor**, renderizado en 3D con gráficos inmersivos y una interfaz intuitiva. Este juego ofrece una experiencia de usuario fluida, integrando animaciones, efectos visuales y una lógica de juego precisa.

Los jugadores deben mover sus piezas a través del tablero mientras colocan muros estratégicamente para bloquear a su oponente y llegar al otro extremo primero.

---

## 🚀 Tecnologías Utilizadas

- **React** + **Vite** para el frontend
- **React Three Fiber** para gráficos en 3D
- **Tailwind CSS** para estilización moderna y responsiva
- **Context API** para la gestión del estado del juego
- **GSAP** para animaciones y transiciones suaves
- **ESLint** para mantener la calidad del código

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

## 🎮 Características Principales

✅ **Modo de Juego Estratégico**: Mueve tu pieza y coloca muros estratégicamente.

✅ **Gráficos en 3D**: Implementados con Three.js para una experiencia inmersiva.

✅ **Modo Oscuro**: Adaptación automática a la configuración del usuario.

✅ **Detección de Dispositivos Móviles**: Interfaz y controles optimizados para móviles.

✅ **Efectos de Sonido y Animaciones**: Uso de GSAP y React Three Fiber para transiciones suaves.

✅ **Gestión de Estado Global**: Implementado con Context API.

---

## 📂 Estructura del Proyecto

```
Quoridor-3d-Game/
│── public/            # Archivos estáticos
│── src/
│   ├── components/    # Componentes React
│   │   ├── game-board.jsx
│   │   ├── player-piece.jsx
│   │   ├── wall-grid.jsx
│   │   ├── game-ui.jsx
│   │   ├── mobile-controls.jsx
│   │   ├── sound-effects.jsx
│   │   ├── welcome-screen.jsx
│   ├── logic/         # Lógica del juego
│   │   ├── quoridor-logic.js
│   ├── context/       # Gestión del estado global
│   │   ├── game-context.jsx
│   ├── App.jsx        # Componente principal
│   ├── main.jsx       # Punto de entrada de la app
│── package.json       # Configuración del proyecto
│── vite.config.js     # Configuración de Vite
```

---

## 🔧 Instalación y Ejecución

1️⃣ **Clonar el repositorio:**
```sh
  git clone https://github.com/usuario/Quoridor-3d-Game.git
  cd Quoridor-3d-Game
```

2️⃣ **Instalar dependencias:**
```sh
  npm install
```

3️⃣ **Ejecutar el servidor de desarrollo:**
```sh
  npm run dev
```

4️⃣ **Abrir en el navegador:**
```
  http://localhost:5173
```

---

## 📌 Mejoras Implementadas

🔹 **Optimización de Lógica de Muros**: Evita colocar muros fuera de los límites y bloqueos ilegales.

🔹 **Detección Automática de Movimientos Válidos**: Resalta posibles movimientos para los jugadores.

🔹 **Sistema de Control Móvil Mejorado**: Controles adaptativos para pantallas táctiles.

🔹 **Gestión de Sonidos**: Efectos de audio mejorados para una mejor experiencia.

🔹 **Modo Oscuro Dinámico**: Sincronización con las preferencias del usuario.

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

Este proyecto está bajo la licencia MIT. Siéntete libre de contribuir y mejorar el código.

📩 **Contacto:** Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue o contactarme. 😊

📩 _Desarrollado con pasión por Flavio Villanueva Medina_