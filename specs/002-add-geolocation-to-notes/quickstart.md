# Quickstart — Geolocalización en Notas

## Prerequisites

- Feature `001-note-taking-app` fully implemented
- Navegador con soporte Geolocation API
- Permiso de ubicación concedido (o graceful fallback)

## Setup

Sin cambios en setup — feature 100% aditiva sobre el código existente.

## Validation Scenarios

### Scenario 1: Capturar ubicación al crear nota
1. Abrir la app y conceder permiso de ubicación
2. Crear una nota nueva (Ctrl+N o botón +)
3. ✅ La nota debe almacenar `createdLat` y `createdLng`
4. Abrir DevTools → Application → IndexedDB → notas-app → notes
5. ✅ Verificar que los campos de geolocalización tienen valores

### Scenario 2: Actualizar ubicación al modificar
1. Abrir una nota existente
2. Modificar el título o contenido
3. ✅ `updatedLat` y `updatedLng` deben actualizarse
4. Verificar en IndexedDB que los valores cambiaron

### Scenario 3: Geolocalización en versiones
1. Editar una nota varias veces provocando auto-saves
2. Abrir el historial de versiones en el editor
3. ✅ Cada versión debe mostrar sus coordenadas

### Scenario 4: Fork con geolocalización
1. En el historial de versiones, hacer fork de una versión
2. ✅ La nueva nota debe tener `createdLat`/`createdLng` de la ubicación del fork

### Scenario 5: Denegar permiso
1. Abrir la app y **denegar** permiso de ubicación
2. Crear y editar notas normalmente
3. ✅ No debe haber errores ni bloqueos
4. ✅ Los campos de geolocalización deben ser `null`

## Commands Reference

```bash
bun run dev        # Desarrollo
bun run test       # Tests
bun run build      # Build producción
```
