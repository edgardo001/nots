# Data Model: Note-Taking App

## Entity: Note

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | `string` (UUID) | Sí | Identificador único, generado con `crypto.randomUUID()` |
| `title` | `string` | Sí | Título de la nota |
| `content` | `string` | Sí | Contenido en formato Markdown |
| `frontmatter.tags` | `string[]` | No | Lista de tags (máximo 10) |
| `frontmatter.color` | `string` (hex) | Sí | Color de fondo de la nota (#FFE4B5 por defecto) |
| `frontmatter.emoji` | `string` | No | Emoji identificador de la nota |
| `frontmatter.folder` | `string` | No | Carpeta/proyecto de agrupación |
| `createdAt` | `string` (ISO 8601) | Sí | Fecha de creación en UTC |
| `updatedAt` | `string` (ISO 8601) | Sí | Fecha de última modificación en UTC |
| `deletedAt` | `string` (ISO 8601) \| `null` | Sí | null = activa, fecha = eliminada |
| `position` | `number` | Sí | Posición para ordenamiento en UI |

**Validation Rules**:
- `title`: 1-200 caracteres
- `tags`: máximo 10 tags, cada tag 1-50 caracteres, sin espacios
- `color`: hex válido (# seguido de 6 dígitos hex)
- `emoji`: un solo emoji válido
- Las fechas siempre en ISO 8601 UTC

**State Transition**:
```
Activa ──[delete]──→ Papelero (deletedAt = now)
Papelero ──[restore]──→ Activa (deletedAt = null)
Papelero ──[7 days]──→ Eliminación permanente
```

## Entity: NoteVersion

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | `string` (UUID) | Sí | Identificador único |
| `noteId` | `string` (UUID) | Sí | FK hacia Note.id |
| `title` | `string` | Sí | Título en esa versión |
| `content` | `string` | Sí | Contenido Markdown en esa versión |
| `savedAt` | `string` (ISO 8601) | Sí | Cuándo se guardó esta versión |
| `versionNumber` | `number` | Sí | Número secuencial de versión |

**Rules**:
- Máximo 50 versiones por nota (CUANDO se excede, eliminar la más antigua)
- Se crea una versión cuando el usuario deja de escribir (debounce 2s) O al cambiar toggle edición/preview
- versionNumber se incrementa automáticamente por nota

## Entity: Attachment

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | `string` (UUID) | Sí | Identificador único |
| `noteId` | `string` (UUID) | Sí | FK hacia Note.id |
| `fileName` | `string` | Sí | Nombre original del archivo |
| `mimeType` | `string` | Sí | Tipo MIME (ej. image/png, image/jpeg) |
| `data` | `ArrayBuffer` | Sí | Datos binarios del archivo |
| `size` | `number` (bytes) | Sí | Tamaño del archivo |
| `createdAt` | `string` (ISO 8601) | Sí | Fecha de subida |

**Rules**:
- Tamaño máximo: 10MB por adjunto
- Solo imágenes (image/*) permitidas en v1
- Se eliminan en cascada cuando se elimina la nota

## Entity: AppSettings

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `key` | `string` | Sí | Clave de configuración |
| `value` | `any` | Sí | Valor (tipado según la clave) |

**Settings Keys**:
| key | value type | default | description |
|---|---|---|---|
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Tema de la aplicación |
| `viewMode` | `"postit" \| "list"` | `"postit"` | Vista por defecto |
| `sortBy` | `"updatedAt" \| "createdAt" \| "title" \| "position"` | `"updatedAt"` | Criterio de ordenamiento |
| `sortOrder` | `"asc" \| "desc"` | `"desc"` | Dirección de ordenamiento |

## IndexedDB Schema (version 1)

```
DB Name: "notas-app"
Version: 1

Object Stores:
├── notes
│   ├── keyPath: "id"
│   ├── indexes:
│   │   ├── "deletedAt" → notes.deletedAt
│   │   └── "updatedAt" → notes.updatedAt
│   └── autoIncrement: false
├── versions
│   ├── keyPath: "id"
│   ├── indexes:
│   │   └── "noteId" → versions.noteId
│   └── autoIncrement: false
├── attachments
│   ├── keyPath: "id"
│   ├── indexes:
│   │   └── "noteId" → attachments.noteId
│   └── autoIncrement: false
└── settings
    ├── keyPath: "key"
    └── autoIncrement: false
```
