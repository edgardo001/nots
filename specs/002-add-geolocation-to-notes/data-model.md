# Data Model: Geolocalización en Notas

## Entity Extensions

### Note (campos nuevos)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `createdLat` | `number` \| `null` | No | Latitud donde se creó la nota |
| `createdLng` | `number` \| `null` | No | Longitud donde se creó la nota |
| `updatedLat` | `number` \| `null` | No | Latitud de la última modificación |
| `updatedLng` | `number` \| `null` | No | Longitud de la última modificación |

**Reglas**:
- Todos los campos son opcionales (`null` por defecto) para backward compat con notas existentes
- `createdLat`/`createdLng` se asignan una sola vez al crear la nota
- `updatedLat`/`updatedLng` se actualizan en cada modificación de título o contenido

### NoteVersion (campos nuevos)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `lat` | `number` \| `null` | No | Latitud donde se guardó esta versión |
| `lng` | `number` \| `null` | No | Longitud donde se guardó esta versión |

**Reglas**:
- Campos opcionales para backward compat
- Se capturan al momento de guardar la versión (auto-save o manual)

## State Transitions

```
Create Note:
  Si hay permiso → createdLat/Lng = posición actual
  Si no hay permiso → createdLat/Lng = null
  updatedLat/Lng = createdLat/Lng

Update Note:
  Si hay permiso → updatedLat/Lng = posición actual
  Si no hay permiso → updatedLat/Lng = null

Save Version:
  Si hay permiso → version.lat/lng = posición actual
  Si no hay permiso → version.lat/lng = null

Fork Version:
  Nueva nota → createdLat/Lng = posición actual (como create normal)
```

## IndexedDB Schema

No requiere cambio de versión. Los nuevos campos son propiedades opcionales en objetos existentes. IndexedDB con `idb` maneja campos adicionales sin migración.
