# nots ⬛

> **"not es otra app de notas"**
> Porque realmente no necesitas otra app de notas. La anti-app minimalista y rebelde para los que solo quieren escribir, sin fricciones, configuraciones eternas ni sobrecarga de funciones.

---

## 🖤 La Filosofía de nots

**nots** nace como una declaración de intenciones en un mercado sobresaturado de herramientas de productividad ultra complejas. Aquí, el foco es el texto, la velocidad y la ausencia de distracciones.

*   **El Minimalista Rebelde:** Sin bordes innecesarios, sin adornos superficiales. Estética brutalista pura, alto contraste y bordes duros.
*   **Velocidad Sin Concesiones:** Acceso directo a tus ideas. Solo escribe.
*   **Privacidad Absoluta:** Tus notas son tuyas. Se persisten de manera local y privada.

---

## 🚀 Características Clave

*   **Diseño Brutalista de Alta Densidad:** Tipografía técnica y legible (*Space Grotesk*), bordes sin redondear (`border-radius: 0`), y un vibrante color de acento rojo eléctrico (`#ff0044`) para los focos principales.
*   **Pestaña Flotante Colapsable (Sidebar Tab):** Una elegante pestaña física acoplada al borde derecho de la barra lateral, que se desliza de forma sincrónica con el panel lateral para un control de espacio intuitivo y fluido.
*   **Responsive y Adaptativa:** Barra de navegación responsiva que se colapsa automáticamente en pantallas móviles, ocultando elementos secundarios para mantener el foco en la escritura.
*   **Alta Densidad en Lista:** El sidebar compacto muestra emojis y títulos limpios sin ruido visual superfluo, optimizando la exploración rápida de decenas de notas.
*   **Gestión de Versiones (Version Control):** Guarda automáticamente estados históricos por nota con capacidad de restaurar o hacer *fork* en notas nuevas de forma local.
*   **Drag & Drop Nativo:** Organiza visualmente tus notas arrastrándolas tanto en vista de lista compacta como en cuadrícula de post-its.
*   **Almacenamiento Local (IndexedDB):** Acceso rápido, persistente y privado utilizando base de datos transaccional directamente en tu navegador.

---

## 🛠️ Stack Tecnológico

*   **Frontend Core:** React 19 + TypeScript + Vite 6
*   **Gestión de Estado:** Zustand (para velocidad de procesamiento y sincronización instantánea)
*   **Persistencia Local:** IndexedDB nativa (a través del cliente ligero `idb`)
*   **Organización Espacial:** `@dnd-kit` (para un drag-and-drop interactivo y sin fricciones)
*   **Estilos:** CSS Brutalista Modular con variables nativas optimizadas para temas Claro y Oscuro

---

## 💻 Desarrollo Local

### Requisitos Previos

Para levantar el entorno local:
*   [Node.js](https://nodejs.org/) v20+ o superior.
*   Administrador de paquetes de tu preferencia (`npm`, `pnpm` o `yarn`).

### 1. Iniciar Servidor de Desarrollo

```bash
# Navegar al directorio frontend
cd src/frontend

# Instalar dependencias
bun install

# Levantar el servidor local
bun run dev
```

El servidor estará disponible en `http://localhost:5173`.

### 2. Generar Build de Producción

Para compilar la aplicación con **Bun** optimizada para producción:

```bash
# Navegar al directorio de la aplicación
cd src/frontend

# Compilar el proyecto
bun run build
```

#### ¿Qué ocurre durante la compilación?
1. **Comprobación de tipos (`tsc -b`):** El compilador de TypeScript valida rigurosamente todo el tipado del proyecto para asegurar que no haya fallos de código.
2. **Minificación y empaquetado (`vite build`):** Vite agrupa, comprime y optimiza el código JSX/TSX y los estilos CSS en archivos estáticos ultraligeros.

El resultado final se almacena en la carpeta **`src/frontend/dist`**, que contiene el `index.html`, los recursos compilados (JS, CSS) y el Service Worker para la PWA. Al ser archivos puramente estáticos, puedes desplegarlos instantáneamente en cualquier servidor web o plataforma estática (Netlify, Vercel, GitHub Pages, etc.).

#### Probar el Build de Producción Localmente
Si deseas auditar o previsualizar el build final localmente usando Bun:

```bash
bun run preview
```

---

## ☁️ Despliegue en Cloudflare Pages

### Configuración

Para desplegar **nots** en Cloudflare Pages, utiliza la siguiente configuración:

*   **Comando de compilación:** `bun run build`
*   **Comando de implementación:** `npx wrangler deploy dist`
*   **Directorio raíz:** `src/frontend`
*   **Comando de implementación de rama no de producción (Opcional):** `npx wrangler versions upload`

---

## ⬛ nots — Deja de configurar tu espacio de trabajo. Solo escribe.
