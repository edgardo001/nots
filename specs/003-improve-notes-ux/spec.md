# Feature Specification: Mejoras UX/URL/Markdown en Notas

**Feature Directory**: `specs/003-improve-notes-ux/`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: mejoras integrales a la experiencia de usuario — UUID en URL, parámetro de búsqueda, soporte de task lists en markdown, drag & drop, ayuda markdown, estilo papelera, settings con perfil/author, historial navegable y eliminable.

## User Scenarios & Testing

### User Story 1 - UUID en URL (Priority: P1)

Como usuario, quiero que al abrir una nota su UUID aparezca en la URL para poder compartir/enlazar notas directamente.

**Independent Test**: Abrir una nota → URL debe contener `?note=<uuid>`. Cerrar la nota → URL debe limpiar el parámetro.

**Acceptance Scenarios**:
1. **Given** una nota cerrada, **When** hago clic para abrirla, **Then** la URL muestra `?note=<uuid>`
2. **Given** una nota abierta, **When** presiono Escape, **Then** la URL limpia el parámetro `note`
3. **Given** una nota abierta en Android, **When** presiono el botón "atrás", **Then** la nota se guarda y se cierra (no navega a otra página)

---

### User Story 2 - Búsqueda en URL (Priority: P1)

Como usuario, quiero que al buscar notas el término aparezca en la URL para poder compartir resultados o preservar el estado.

**Independent Test**: Escribir en el search bar → URL debe contener `?q=<término>`. Limpiar búsqueda → URL debe limpiar `q`.

**Acceptance Scenarios**:
1. **Given** el search bar vacío, **When** escribo "recetas", **Then** la URL muestra `?q=recetas`
2. **Given** una URL con `?q=recetas`, **When** cargo la página, **Then** el search bar muestra "recetas" y filtra notas

---

### User Story 3 - Task Lists en Markdown (Priority: P1)

Como usuario, quiero que las listas de tareas con `[ ]` y `[x]` se rendericen correctamente como checkboxes interactivos.

**Independent Test**: Escribir `- [ ] tarea pendiente` y `- [x] tarea hecha` → debe mostrar checkboxes no interactivos (solo preview).

**Acceptance Scenarios**:
1. **Given** contenido con `- [ ] pendiente`, **When** se renderiza, **Then** aparece un checkbox vacío
2. **Given** contenido con `- [x] hecha`, **When** se renderiza, **Then** aparece un checkbox checked

---

### User Story 4 - Mejora Drag & Drop (Priority: P2)

Como usuario, quiero que al hacer drag de una nota no quede superpuesta sobre otras durante el movimiento.

**Independent Test**: Arrastrar una nota sobre otra → durante el drag no debe haber solapamiento visual.

**Acceptance Scenarios**:
1. **Given** un grid de notas, **When** arrastro una nota, **Then** las demás notas se reordenan visualmente durante el arrastre
2. **Given** que suelto una nota, **Then** queda en la posición correcta sin superposición

---

### User Story 5 - Ayuda Markdown (Priority: P2)

Como usuario, quiero un botón "?" en el editor que muestre un cheat sheet de la sintaxis markdown soportada.

**Independent Test**: Click en "?" → modal con lista de sintaxis markdown soportada.

**Acceptance Scenarios**:
1. **Given** el editor abierto, **When** click en "?", **Then** se muestra un tooltip/modal con el cheat sheet
2. **Given** el cheat sheet abierto, **When** click fuera, **Then** se cierra

---

### User Story 6 - Papelera con estilo hoja arrugada (Priority: P2)

Como usuario, quiero que las notas en la papelera tengan un estilo visual de hoja arrugada para diferenciarlas.

**Independent Test**: Enviar nota a papelera → la nota se ve con textura/efecto de papel arrugado.

**Acceptance Scenarios**:
1. **Given** una nota en la papelera, **Then** su card tiene un filtro/efecto visual de papel arrugado
2. **Given** que restauro la nota, **Then** el efecto desaparece

---

### User Story 7 - Efecto hoja arrugada al eliminar (Priority: P2)

Como usuario, quiero una animación de hoja arrugada al enviar una nota a la papelera.

**Independent Test**: Click en eliminar → animación de crumpling antes de desaparecer.

**Acceptance Scenarios**:
1. **Given** una nota visible, **When** click en eliminar, **Then** se reproduce una animación de arrugado antes de ocultarse
2. **Given** la animación termina, **Then** la nota desaparece del grid

---

### User Story 8 - Settings con Perfil (Priority: P1)

Como usuario, quiero una sección de Settings con un modal (como Storage) donde pueda configurar mi "Autor".

**Independent Test**: Abrir Settings → modal con menú "Perfil" → ingresar "Autor" → guardar → el autor se muestra en las notas.

**Acceptance Scenarios**:
1. **Given** el modal de Settings, **When** click en "Perfil", **Then** se muestra campo para "Autor"
2. **Given** que ingreso "Juan" como autor, **When** creo una nota, **Then** la nota muestra "Por Juan"
3. **Given** que guardo el autor, **When** recargo la página, **Then** el autor persiste
4. **Given** que creo una nueva nota, **Then** su emoji es aleatorio (distinto de `📝` la mayoría de las veces)

---

### User Story 9 - Estado de búsqueda en URL (Priority: P1)

Como usuario, quiero que la URL refleje el estado actual de búsqueda para poder recargar y mantener el filtro.

**Acceptance Scenarios**:
1. **Given** que busco "ideas", **When** recargo la página, **Then** el search bar muestra "ideas" y los resultados filtrados
2. **Given** URL con `?q=ideas&note=abc`, **When** cargo, **Then** se abre la nota abc con búsqueda "ideas"

---

### User Story 10 - Eliminar historial específico (Priority: P2)

Como usuario, quiero poder eliminar una versión específica del historial sin afectar las demás.

**Independent Test**: En el panel de versiones, click en eliminar versión → la versión desaparece.

**Acceptance Scenarios**:
1. **Given** una nota con 3 versiones, **When** elimino la versión 2, **Then** la versión 2 ya no aparece
2. **Given** que elimino una versión, **Then** las versiones 1 y 3 permanecen intactas

---

### User Story 11 - Click en historial para ver contenido (Priority: P2)

Como usuario, quiero hacer clic en una versión del historial para ver su contenido completo en modo solo lectura.

**Independent Test**: Click en versión → modal/panel muestra el contenido de esa versión sin permitir edición.

**Acceptance Scenarios**:
1. **Given** el panel de versiones, **When** click en una versión, **Then** se abre un visor de solo lectura con el contenido
2. **Given** el visor abierto, **When** click en Restore/Fork, **Then** puedo restaurar o forkear desde esa vista

---

### Edge Cases

- **URL manual**: Si el usuario escribe `?note=uuid-invalido` en la URL, no debe romperse la app
- **Caracteres especiales en búsqueda**: `?q=hola+mundo` debe funcionar (URL encoding/decoding)
- **Versión eliminada accidentalmente**: Se podría considerar confirmación antes de eliminar
- **Autor vacío**: Si no hay autor configurado, no se muestra la etiqueta
- **Primer ingreso**: Si ya hay notas en la DB, no se agregan las de ejemplo
- **Borrar Todo**: La doble confirmación debe usar texto diferente en cada paso para evitar confirmación accidental

---

### User Story 12 - Notas de ejemplo en primer ingreso (Priority: P1)

Como usuario nuevo, quiero que al abrir la app por primera vez aparezcan 5 notas de ejemplo para entender cómo funciona.

**Independent Test**: Limpiar IndexedDB → recargar → deben aparecer 5 notas con contenido variado (markdown, checklist, imágenes, etc.).

**Acceptance Scenarios**:
1. **Given** la app sin notas, **When** carga por primera vez, **Then** se crean 5 notas de ejemplo automáticamente
2. **Given** que ya hay notas, **When** recargo, **Then** no se agregan más notas de ejemplo

---

### User Story 13 - Borrar Todo con efecto de fuego (Priority: P1)

Como usuario, quiero un botón "Borrar Todo" que destruya permanentemente todas las notas con una animación de fuego, previa doble confirmación.

**Independent Test**: Click "Borrar Todo" → primera confirmación "¿Estás seguro?" → segunda confirmación "¿Realmente? Esto es irreversible" → animación de fuego → todas las notas desaparecen.

**Acceptance Scenarios**:
1. **Given** notas existentes, **When** click en "Borrar Todo", **Then** aparece primer diálogo de confirmación
2. **Given** primera confirmación aceptada, **When** segunda confirmación aceptada, **Then** se reproduce animación de fuego (quemando) en todas las cards visibles
3. **Given** animación terminada, **Then** todas las notas se eliminan permanentemente de IndexedDB (no van a papelera)
4. **Given** primera confirmación, **When** cancelo la segunda, **Then** no pasa nada

---

### User Story 14 - Persistir modo de vista (Priority: P1)

Como usuario, quiero que al cambiar a vista de lista o post-it, la elección se recuerde al recargar la página.

**Independent Test**: Cambiar a vista lista → recargar → debe mantenerse en lista.

**Acceptance Scenarios**:
1. **Given** vista post-it, **When** cambio a lista, **Then** `viewMode` se persiste en IndexedDB
2. **Given** vista lista persistida, **When** recargo la página, **Then** se carga en modo lista
3. **Given** primera vez sin persistencia, **When** abro la app, **Then** se usa post-it por defecto

---

### User Story 15 - Favicon (Priority: P2)

Como usuario, quiero que la app tenga un favicon personalizado en lugar del default de Vite.

**Independent Test**: Verificar pestaña del navegador → debe mostrar el favicon de la app.

**Acceptance Scenarios**:
1. **Given** la app cargada, **Then** la pestaña del navegador muestra el favicon
2. **Given** el favicon, **Then** debe ser un SVG inline o PNG que represente una nota/post-it

---

### User Story 15 - Internacionalización (I18N) (Priority: P1)

Como usuario, quiero poder cambiar el idioma de la interfaz entre Español e Inglés.

**Independent Test**: Cambiar idioma a English → toda la UI cambia a inglés. Cambiar a Español → toda la UI vuelve a español.

**Acceptance Scenarios**:
1. **Given** la app en español, **When** selecciono "English" en Settings, **Then** toda la UI se muestra en inglés
2. **Given** la app en inglés, **When** selecciono "Español", **Then** toda la UI se muestra en español
3. **Given** que cambio idioma, **When** recargo la página, **Then** el idioma persiste
4. **Given** el idioma por defecto, **When** es primera vez, **Then** se detecta `navigator.language` y se usa español si comienza con "es", inglés si comienza con "en"

---

### User Story 16 - Botón Guardar en lugar de Cerrar (Priority: P1)

Como usuario, quiero que el botón de cerrar el editor sea un botón "Guardar" que persista los cambios antes de cerrar.

**Independent Test**: Modificar título y contenido → click en guardar → la nota se guarda y el editor se cierra.

**Acceptance Scenarios**:
1. **Given** una nota abierta con cambios, **When** click en guardar, **Then** el contenido se persiste en IndexedDB y se cierra el editor
2. **Given** el botón guardar, **Then** usa icono de disquete (floppy disk) con fondo verde

---

### User Story 17 - Input de etiquetas funcional en móvil (Priority: P2)

Como usuario en móvil, quiero que al escribir una etiqueta el teclado muestre "Enter" / "Hecho" en lugar de "Siguiente".

**Independent Test**: En móvil,聚焦 en input de etiquetas → teclado debe mostrar botón "Hecho" o "Enter".

**Acceptance Scenarios**:
1. **Given** el input de etiquetas en móvil, **Then** `enterKeyHint="done"` está configurado
2. **Given** que escribo una etiqueta y presiono "Hecho", **Then** la etiqueta se agrega correctamente
3. **Given** teclado físico, **When** presiono Enter, **Then** también agrega la etiqueta

---

### Edge Cases

### Functional Requirements

- **FR-001**: Sistema MUST sincronizar `activeNoteId` con `?note=` en URL
- **FR-002**: Sistema MUST sincronizar `searchQuery` con `?q=` en URL
- **FR-003**: Sistema MUST restaurar estado desde URL al cargar la página
- **FR-004**: Sistema MUST renderizar task lists `[ ]`/`[x]` en preview markdown
- **FR-005**: Sistema MUST mejorar estrategia de drag & drop para evitar superposición
- **FR-006**: Sistema MUST mostrar botón "?" con cheat sheet markdown en el editor
- **FR-007**: Sistema MUST aplicar estilo "hoja arrugada" a notas en papelera
- **FR-008**: Sistema MUST reproducir animación crumple al enviar a papelera
- **FR-009**: Sistema MUST tener modal Settings con sección "Perfil" y campo "Autor"
- **FR-010**: Sistema MUST permitir eliminar una versión específica del historial
- **FR-011**: Sistema MUST mostrar contenido de versión al hacer clic en ella (solo lectura)
- **FR-012**: Sistema MUST crear 5 notas de ejemplo automáticamente si la DB está vacía al cargar
- **FR-013**: Sistema MUST tener botón "Borrar Todo" con doble confirmación y animación de fuego
- **FR-014**: Sistema MUST eliminar permanentemente todas las notas (no a papelera) al confirmar Borrar Todo
- **FR-015**: Sistema MUST tener favicon personalizado (post-it o documento)
- **FR-016**: Sistema MUST soportar i18n Español/Inglés con persistencia y detección de navegador
- **FR-017**: Sistema MUST tener todas las cadenas de UI en archivo de traducciones ES/EN
- **FR-018**: Sistema MUST usar `history.pushState` + `popstate` para manejar botón "atrás" Android cerrando y guardando la nota
- **FR-019**: Sistema MUST usar icono de guardar (disquete) en lugar de X para cerrar editor, llamando a `save()` antes de `setActiveNote(null)`
- **FR-020**: Sistema MUST asignar emoji aleatorio al crear nota nueva (de un conjunto de 20+ emojis)
- **FR-021**: Sistema MUST configurar `enterKeyHint="done"` e `inputMode="search"` en input de etiquetas para móvil

### Key Entities

- **AppSettings**: Nuevas claves `app:author` para almacenar el autor
- **Note**: Nuevo campo opcional `author` para etiquetar notas con el autor actual
- **NoteVersion**: Sin cambios estructurales

## Success Criteria

### Measurable Outcomes

- **SC-001**: URL refleja correctamente note UUID y query de búsqueda (verificación manual y test)
- **SC-002**: Task lists se renderizan correctamente en preview (verificación visual)
- **SC-003**: Drag & drop sin superposición durante el arrastre (verificación visual)
- **SC-004**: Animación crumple <500ms, no bloquea UI
- **SC-005**: Autor persiste en IndexedDB y se muestra en notas nuevas
- **SC-006**: Versiones se pueden eliminar individualmente sin afectar otras
- **SC-007**: 5 notas de ejemplo aparecen en primera carga y son funcionales (markdown, checklists)
- **SC-008**: Borrar Todo destruye todas las notas permanentemente en <1s
- **SC-009**: Animación de fuego se reproduce por <800ms antes de borrar
- **SC-010**: 100% de las cadenas UI están traducidas ES/EN (verificación por grep)

## I18N Strategy

### Archivo de traducciones
- Crear `src/frontend/src/i18n/es.ts` y `src/frontend/src/i18n/en.ts` con objetos clave → valor
- Crear `src/frontend/src/i18n/index.ts` con hook `useT()` que retorna función `t(key)` según locale activo
- Store: `localeStore.ts` (Zustand) con `locale: 'es' | 'en'`, persiste en `AppSettings.app:locale`

### Cobertura de traducción
Todas las cadenas visibles en UI deben pasar por `t()`:
- Header: logo, botones, tooltips
- Sidebar: sort labels, filter labels, trash, groups
- NoteEditor: placeholders, buttons, version panel, markdown help
- NoteCard: timestamps, delete, restore
- Settings: títulos, etiquetas, botones
- Modals: confirmaciones, storage, trash
- SearchBar: placeholder

- Usuarios tienen navegador moderno con soporte `URLSearchParams` e `history.replaceState`
- `@dnd-kit` puede configurarse con layout rectifying para evitar overlap
- `remark-gfm` ya soporta task lists, solo falta configurar el renderer
- El autor se asigna al crear/editar nota, no es retroactivo
