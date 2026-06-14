# Data Model: Mejoras UX/URL/Markdown en Notas

## Entity Extensions

### Note (campo nuevo)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `author` | `string` \| `null` | No | Autor configurado en Settings al momento de crear/editar la nota |

**Reglas**:
- `author` se asigna desde `AppSettings.app:author` al crear o actualizar una nota
- Si el autor está vacío en Settings, `author` se guarda como `null`
- No es retroactivo — notas existentes no reciben autor automáticamente

### AppSettings (nuevas claves)

| Clave | Valor | Descripción |
|---|---|---|
| `app:author` | `string` | Nombre del autor configurado en Perfil |

### NoteVersion

Sin cambios estructurales. Solo se agregan operaciones (eliminar versión, visor read-only).

## State Transitions

```
Open Note:
  activeNoteId = note.id
  URL: ?note=<uuid>&q=<searchQuery>

Close Note:
  activeNoteId = null
  URL: ?q=<searchQuery> (limpia note)

Search:
  searchQuery = text
  URL: ?q=<encoded-text>&note=<activeNoteId>

Delete Version:
  db.deleteVersion(versionId) → versión eliminada
  Panel de versiones se refresca

View Version:
  selectedVersionId = version.id
  Panel muestra contenido read-only con markdown renderizado

Create Note with Author:
  author = getSetting('app:author')
  note.author = author ?? null
```

### AppSettings (nuevas claves, cont.)

| Clave | Valor | Descripción |
|---|---|---|
| `app:locale` | `"es"` \| `"en"` | Idioma seleccionado por el usuario |
| `app:viewMode` | `"postit"` \| `"list"` | Modo de visualización de notas |

### Sample Notes Data

5 notas de ejemplo creadas al primer ingreso:

| Título | Contenido | Emoji | Color |
|---|---|---|---|
| Bienvenido a nots | Guía rápida de características con markdown | 👋 | `#FFE4B5` |
| Lista de tareas | Ejemplo de checklists `[ ]` y `[x]` | ✅ | `#FFD6E0` |
| Nota con formato | headings, bold, italic, code, blockquote, tabla | 📝 | `#D4F0C0` |
| Ideas creativas | Lista de ideas con bullet points y links | 💡 | `#C9E4FF` |
| Recordatorio | Nota simple con fecha y etiquetas | 📌 | `#FFE0B2` |

## IndexedDB Schema

No requiere cambio de versión. `Note.author` es campo opcional. `AppSettings.app:author` y `AppSettings.app:locale` son nuevos key-value.

## I18N Data Flow

```
App mount:
  → getSetting('app:locale') ?? detectBrowserLang()
  → set locale in localeStore

t(key):
  → localeStore.locale → 'es' | 'en'
  → return locales[locale][key] ?? key

UI render:
  → {t('app.title')} → "nots" en ambos idiomas
  → {t('note.delete')} → "Eliminar" | "Delete"
```
