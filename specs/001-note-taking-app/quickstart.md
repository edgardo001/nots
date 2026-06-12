# Quickstart — Note-Taking App

## Prerequisites

- Bun 1.3.14+ (verificar con `bun --version`)
- Navegador moderno (Chrome/Edge/Firefox/Safari actual)

## Setup

```bash
# Crear directorios
mkdir -p src/frontend src/docker

# Inicializar proyecto Vite + React + TypeScript dentro de src/frontend
cd src/frontend
bun create vite . --template react-ts

# Instalar dependencias
bun add zustand idb react-markdown remark-gfm rehype-highlight @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities date-fns emoji-mart
bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/react @types/react-dom vite-plugin-pwa

# Iniciar desarrollo (desde raíz del proyecto)
cd ../..
bun run --cwd src/frontend dev
```

## Validation Scenarios

### Scenario 1: Crear y persistir nota
1. Abrir `http://localhost:5173`
2. Hacer clic en "Nueva nota" o presionar `Ctrl+N`
3. Escribir título: "Mi primera nota"
4. Escribir contenido: `# Hola\nEsto es **markdown**`
5. Cambiar a vista previa (toggle)
6. ✅ Debe verse el título y el Markdown renderizado correctamente
7. Recargar la página (`F5`)
8. ✅ La nota debe seguir apareciendo

### Scenario 2: Vista Post-It y Lista
1. Crear 3 notas con contenido variado
2. ✅ Deben verse como tarjetas Post-It en un grid
3. Hacer clic en el toggle de vista
4. ✅ Deben mostrarse como lista vertical
5. Volver a vista Post-It
6. ✅ Las notas deben seguir visibles

### Scenario 3: Drag & drop
1. En vista Post-It, arrastrar una nota a otra posición
2. ✅ La nota debe moverse visualmente
3. Recargar la página
4. ✅ El orden debe mantenerse

### Scenario 4: Búsqueda
1. Crear notas con títulos variados ("Compras", "Ideas", "Tareas")
2. Escribir "compr" en la barra de búsqueda
3. ✅ Solo debe mostrarse la nota "Compras"
4. Borrar el texto de búsqueda
5. ✅ Deben mostrarse todas las notas

### Scenario 5: Papelero
1. Eliminar una nota
2. ✅ Debe desaparecer de la vista activa
3. Ir al papelero
4. ✅ La nota debe estar allí
5. Restaurar la nota
6. ✅ Debe volver a la vista activa

### Scenario 6: Offline (PWA)
1. Cargar la app con conexión
2. Desconectar internet (DevTools → Network → Offline)
3. ✅ La app debe seguir funcionando sin errores
4. Crear una nota sin conexión
5. Reconectar
6. ✅ La nota debe persistir

## Expected Test Output

```bash
bun run test        # Vitest: unit + component tests
bun run build       # Build producción (incluye PWA)
```

## Commands Reference

| Comando | Descripción |
|---|---|
| `bun run dev` | Iniciar servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run test` | Ejecutar tests |
| `bun run preview` | Vista previa del build |
| `bun add <pkg>` | Agregar dependencia |
