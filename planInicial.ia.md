# Plan Inicial de Desarrollo — App de Notas (Post-It Style)

Generado a partir de `planInicial.md`. Versión estructurada para agentes AI.

---

## 1. Diagnóstico de Herramientas

| Herramienta | Estado | Acción requerida |
|---|---|---|
| Node.js v25.2.1 | ✅ Disponible | Usar como runtime base |
| npm 11.6.2 | ✅ Disponible | Gestor de paquetes |
| **Bun** v1.3.14 | ✅ Instalado | Usar como runtime (`bun run dev`) |
| Git 2.54.0 | ✅ Disponible | Usar para control de versiones |
| Python 3.14.3 | ✅ Disponible | Necesario para Spec Kit (es Python-based) |
| uvx 0.11.8 | ✅ Disponible | Instalador de Spec Kit (`uvx --from git+https://github.com/github/spec-kit.git specify init`) |
| pip 26.0.1 | ✅ Disponible | Gestor de paquetes Python |
| Skills CLI (`npx skills`) 1.5.11 | ✅ Instalado | Usar para buscar/instalar skills de agente |
| Spec Kit v0.10.3 | ✅ Inicializado (opencode) | Usar comandos `/speckit.*` — falta llenar `constitution.md` |

### 1.1 Skills ya instaladas en el proyecto

| Skill | Descripción |
|---|---|
| `find-skills` | Buscar skills en el ecosistema de agentes |
| `web-design-guidelines` | Guías de diseño y accesibilidad web |

> `find-skills` se instaló con: `npx skills add https://github.com/vercel-labs/skills --skill find-skills`

### 1.2 Skills a instalar

```bash
# PWA development
npx skills add alinaqi/claude-bootstrap@pwa-development

# Markdown para Obsidian
npx skills add kepano/obsidian-skills@obsidian-markdown
```

> No se encontraron skills específicas para IndexedDB — se manejará con documentación directa.
> Las skills de drag & drop y accesibilidad se manejarán con librerías npm (@dnd-kit, aria).

### 1.3 Bun — Ya instalado

✅ Bun v1.3.14 instalado (`~/.bun/bin/bun.exe`)

Verificar:
```bash
bun --version
```

Usar como runtime para el proyecto: `bun run dev`, `bun add <paquete>`, etc.

### 1.4 Spec Kit — Ya inicializado

Spec Kit ya está configurado con opencase (`.specify/integration.json`).

**Pendiente**: llenar la `constitution.md` (`.specify/memory/constitution.md`) con los principios del proyecto.
Comandos disponibles via `/speckit.*`:
- `/speckit.specify` — definir especificaciones
- `/speckit.plan` — crear plan técnico
- `/speckit.tasks` — generar tareas
- `/speckit.implement` — implementar
- `/speckit.checklist` — checklist de calidad

---

## 2. Stack Tecnológico

| Capa | Tecnología | Licencia |
|---|---|---|
| Framework UI | React 19 | MIT |
| Build tool | Vite 6 | MIT |
| Lenguaje | TypeScript 5.x | Apache-2.0 |
| Estado global | Zustand o Jotai | MIT |
| IndexedDB | idb (wrapper promesas) | ISC |
| Markdown | react-markdown + remark-gfm | MIT |
| Drag & Drop | @dnd-kit/core | MIT |
| Emojis | emoji-mart o similar | MIT |
| Sintaxis MD | rehype-highlight o rehype-prism | MIT |
| Fechas | date-fns | MIT |
| Testing | Vitest + Testing Library | MIT |
| Lint/Format | ESLint + Prettier (Spec Kit) | MIT |
| PWA | vite-plugin-pwa | MIT |
| Routing | React Router (si es necesario) | MIT |

---

## 3. Arquitectura General

```
src/
├── frontend/                # React 19 + Vite app
│   ├── app/                 # Entry point
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Body grid
│   │   ├── note/            # NoteCard, NoteEditor, NotePreview
│   │   ├── sidebar/         # NoteList, SortControls, SearchBar
│   │   ├── trash/           # TrashBin, RestoreNote
│   │   ├── tags/            # TagManager, TagFilter
│   │   ├── settings/        # ThemeToggle, StorageIndicator
│   │   └── ui/              # Button, Modal, ColorPicker, EmojiPicker
│   ├── stores/              # Zustand stores (notes, ui, trash)
│   ├── db/                  # IndexedDB schema + operations (idb)
│   ├── utils/               # Markdown, dates, storage helpers
│   ├── types/               # TypeScript interfaces
│   └── hooks/               # Custom hooks (useDrag, useNotes, useSearch)
└── docker/                  # Docker config
    ├── Dockerfile
    └── nginx.conf
```

### 3.1 Flujo de datos
```
User Input → React Component → Zustand Action → idb (IndexedDB)
                                                     ↓
                                              State Update → Re-render
```

---

## 4. Modelo de Datos (IndexedDB)

### Object Store: notes
```typescript
interface Note {
  id: string;                    // crypto.randomUUID()
  title: string;
  content: string;               // Markdown body
  frontmatter: {
    tags: string[];
    color: string;               // hex color
    emoji: string;
    folder?: string;
    project?: string;
  };
  createdAt: string;             // ISO 8601 UTC
  updatedAt: string;             // ISO 8601 UTC
  deletedAt: string | null;      // ISO 8601 UTC, null = activa
  position: number;              // for ordering
  viewMode: "edit" | "preview";
}
```

### Object Store: versions (historial)
```typescript
interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  title: string;
  savedAt: string;               // ISO 8601 UTC
  versionNumber: number;
}
```

### Object Store: attachments
```typescript
interface Attachment {
  id: string;
  noteId: string;
  fileName: string;
  mimeType: string;
  data: ArrayBuffer;             // blob almacenado en IndexedDB
  size: number;
  createdAt: string;
}
```

### Object Store: settings
```typescript
interface AppSettings {
  key: string;
  value: any;                    // theme, viewMode, sorting, etc.
}
```

---

## 5. Fases de Desarrollo

### Fase 0 — Preparación del Entorno
- [x] ~~Instalar Bun~~ ✅ v1.3.14
- [ ] Inicializar proyecto Vite + React 19 + TypeScript en `src/frontend/`
- [ ] Crear estructura `src/docker/` (Dockerfile, nginx.conf)
- [ ] Configurar ESLint, Prettier
- [x] ~~Llenar `constitution.md`~~ ✅
- [x] ~~Ejecutar `/speckit.specify`~~ ✅ spec creado
- [x] ~~Crear `AGENTS.md`~~ ✅ actualizado con ruta al plan
- [x] ~~Generar `.gitignore`~~ ✅ creado
- [ ] Configurar `opencode.json` para skills/permissions
- [ ] Crear `README.md` con descripción del proyecto

### Fase 1 — UI Base y Layout
- [ ] Componente App shell (Header, Sidebar, Body)
- [ ] Sidebar con lista de notas y ordenamiento
- [ ] Body con grid de notas estilo Post-It
- [ ] Toggle vista Post-It / Lista
- [ ] Drag & Drop en sidebar y body (@dnd-kit)
- [ ] Tema oscuro/claro/sistema (CSS variables)
- [ ] Diseño UI/UX atractivo (frontend-design skill)

### Fase 2 — CRUD de Notas
- [ ] Crear nota (nueva en blanco)
- [ ] Editar nota (título + contenido Markdown)
- [ ] Vista previa Markdown renderizada
- [ ] Toggle edición / preview por nota
- [ ] Borrar nota → papelero
- [ ] Cambiar color de nota
- [ ] Seleccionar emoji para nota
- [ ] Agregar/quitar tags
- [ ] Guardado automático al escribir

### Fase 3 — IndexedDB y Persistencia
- [ ] Schema de IndexedDB (notes, versions, attachments, settings)
- [ ] Operaciones CRUD con `idb`
- [ ] Sincronización con Zustand
- [ ] Manejo de errores y límite de storage
- [ ] Indicador de uso de storage

### Fase 4 — Papelero y Restauración
- [ ] Vista de papelero (notas eliminadas)
- [ ] Restaurar nota desde papelero
- [ ] Eliminación permanente después de 7 días
- [ ] Fecha de eliminación en UTC

### Fase 5 — Historial de Versiones
- [ ] Guardar versión al editar
- [ ] Límite máximo de versiones por nota
- [ ] Interfaz para ver historial
- [ ] Restaurar versión anterior
- [ ] Indicador de storage usado por versiones

### Fase 6 — Búsqueda y Filtros
- [ ] Barra de búsqueda en Header
- [ ] Búsqueda por título y contenido
- [ ] Filtros avanzados: tag, color, rango de fechas, adjuntos
- [ ] Búsqueda con debounce

### Fase 7 — Adjuntos
- [ ] Subir imágenes a IndexedDB
- [ ] Límite de tamaño por adjunto
- [ ] Visualizar en vista preview
- [ ] Eliminar adjuntos

### Fase 8 — Agrupación
- [ ] Agrupar notas por tag
- [ ] Agrupar por carpeta/proyecto
- [ ] Sidebar con árbol de grupos

### Fase 9 — PWA (Progressive Web App)
- [ ] manifest.json
- [ ] Service worker básico
- [ ] Iconos y splash screen
- [ ] Funcionamiento offline

### Fase 10 — Exportación e Importación
- [ ] Exportar una/varias notas como .md
- [ ] Exportar todo como ZIP de archivos .md
- [ ] Importar notas desde ZIP
- [ ] Formato YAML frontmatter en cada .md

### Fase 11 — Accesibilidad y Atajos
- [ ] ARIA labels en componentes clave
- [ ] Navegación por teclado completa
- [ ] Contraste WCAG AA
- [ ] Atajos de teclado:
  - `Ctrl+N` → nueva nota
  - `Ctrl+F` → buscar
  - `Ctrl+E` → toggle edición/preview
  - `Ctrl+Z` → deshacer
  - `Delete` → borrar nota seleccionada

### Fase 12 — Testing y QA
- [ ] Tests unitarios con Vitest
- [ ] Tests de componentes con Testing Library
- [ ] Tests de integración IndexedDB
- [ ] Tests de accesibilidad
- [ ] QA de seguridad (XSS en Markdown, sanitización)

### Fase 13 — Documentación Final
- [ ] README.md completo
- [ ] AGENTS.md actualizado
- [ ] Comentarios de Spec Kit actualizados

---

## 6. Roles y Agentes para Discusión

Cada decisión importante debe pasar por consenso de estos roles:

| Rol | Responsabilidad |
|---|---|
| **Arquitecto** | Decide estructura, flujo de datos, trade-offs técnicos |
| **Product Owner** | Prioriza features, valida que cumple requisitos de negocio |
| **Developer** | Implementa, sugiere mejoras técnicas viables |
| **UI/UX** | Diseña interacción, asegura experiencia de usuario coherente |
| **Tester QA** | Valida calidad, propone casos de prueba, verifica edge cases |
| **Seguridad** | Revisa XSS, sanitización, almacenamiento seguro, privacidad |

### Dinámica
1. **Propuesta**: El agente activo presenta una decisión con opciones
2. **Discusión**: Cada rol da su perspectiva (máximo 2-3 líneas cada uno)
3. **Consenso**: Se vota o se decide por mayoría/owner
4. **Registro**: Se documenta la decisión en `ADRs/` (Architecture Decision Records)

---

## 7. Convenios de Desarrollo

### Commits
- Formato: `tipo(alcance): descripción`
- Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Ejemplo: `feat(notes): add markdown preview toggle`

### Ramas (cuando haya git)
- `main` — producción
- `develop` — integración
- `feat/*` — features
- `fix/*` — bugs

### Código
- TypeScript estricto (strict: true)
- Componentes funcionales con hooks
- CSS Modules o Tailwind (decidir en Fase 1 con UI/UX)
- Sin comentarios inline (código auto-documentado)
- Nombres en inglés (código) / español (docs)

---

## 8. Checklist de Licencias

Verificar que TODAS las dependencias tengan licencia:
- MIT ✅
- Apache-2.0 ✅
- BSD ✅
- ISC ✅
- CC0-1.0 ✅

**NO USAR**: GPL, AGPL, SSPL, licencias comerciales.

---

## 9. Próximos Pasos Inmediatos

1. Revisar y aprobar este `planInicial.ia.md`
2. ~~Instalar Bun~~ ✅ Ya instalado v1.3.14
3. Verificar diagnóstico completo:
   ```bash
   node --version && npm --version && git --version && python --version
   ```
4. Llenar `constitution.md` de Spec Kit (`.specify/memory/constitution.md`)
5. Instalar skills AI adicionales:
   ```bash
   npx skills add alinaqi/claude-bootstrap@pwa-development
   npx skills add kepano/obsidian-skills@obsidian-markdown
   ```
6. Iniciar **Fase 0** → crear proyecto Vite + React 19 + TypeScript en `src/frontend/`
7. Iniciar **Fase 1** → diseñar layout con frontend-design skill
