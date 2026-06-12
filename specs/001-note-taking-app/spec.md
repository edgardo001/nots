# Feature Specification: Note-Taking App

**Feature Directory**: `specs/001-note-taking-app/`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Aplicacion de notas estilo Post-It con React 19, almacenamiento en IndexedDB, Markdown, drag & drop, papelero, historial de versiones, PWA"

## User Scenarios & Testing

### User Story 1 - Crear y editar notas con Markdown (Priority: P1)

Como usuario, quiero crear una nota con un título y contenido en Markdown, poder alternar entre edición y vista previa, y que se guarde automáticamente en el navegador.

**Why this priority**: Es la funcionalidad central de la aplicación. Sin crear y editar notas, no hay producto viable.

**Independent Test**: Puede probarse completamente abriendo la app, escribiendo en Markdown, viendo la previsualización, y recargando la página para verificar persistencia.

**Acceptance Scenarios**:

1. **Given** que la app está cargada, **When** hago clic en "Nueva nota", **Then** se crea una nota vacía con el editor abierto
2. **Given** que estoy editando una nota, **When** escribo texto con formato Markdown (**negrita**, # título, - lista), **Then** al cambiar a vista previa veo el contenido renderizado
3. **Given** que tengo notas guardadas, **When** recargo la página, **Then** todas las notas persisten exactamente como estaban

---

### User Story 2 - Organizar notas con Post-It y vista lista (Priority: P1)

Como usuario, quiero ver mis notas como Post-It en un grid o como lista en el sidebar, y poder cambiar entre ambas vistas.

**Why this priority**: La metáfora visual Post-It es la identidad del producto y la lista permite organización rápida.

**Independent Test**: Crear varias notas, alternar entre vista Post-It y lista, verificar que todas las notas se muestran correctamente en ambos modos.

**Acceptance Scenarios**:

1. **Given** que tengo 3+ notas, **When** selecciono vista Post-It, **Then** las notas se muestran como tarjetas en un grid
2. **Given** que estoy en vista Post-It, **When** selecciono vista Lista, **Then** las notas se muestran en una lista vertical en el body
3. **Given** cualquier vista, **When** reordeno notas con drag & drop, **Then** la nueva posición se guarda y persiste al recargar

---

### User Story 3 - Buscar y filtrar notas (Priority: P2)

Como usuario, quiero buscar notas por texto y filtrarlas por tag, color o fecha para encontrar rápidamente lo que necesito.

**Why this priority**: Mejora significativamente la usabilidad sin ser crítica para el MVP.

**Independent Test**: Crear notas con distintos tags, colores y fechas, usar el buscador y filtros para encontrar notas específicas.

**Acceptance Scenarios**:

1. **Given** que tengo 10+ notas, **When** escribo en la barra de búsqueda, **Then** las notas se filtran en tiempo real mostrando solo las que coinciden
2. **Given** que busco por un tag, **When** selecciono el tag en el filtro, **Then** solo se muestran notas con ese tag
3. **Given** que busco por rango de fechas, **When** selecciono "últimos 7 días", **Then** solo se muestran notas creadas/modificadas en ese período

---

### User Story 4 - Papelero y restauración (Priority: P2)

Como usuario, quiero poder eliminar notas y que vayan a un papelero, desde donde pueda restaurarlas dentro de 7 días antes de que se eliminen permanentemente.

**Why this priority**: Funcionalidad de seguridad crítica para evitar pérdida accidental de datos.

**Independent Test**: Eliminar una nota, verificar que aparece en el papelero, restaurarla, y confirmar que vuelve a la vista activa.

**Acceptance Scenarios**:

1. **Given** que tengo una nota activa, **When** la elimino, **Then** desaparece de la vista activa y aparece en el papelero
2. **Given** que estoy en el papelero, **When** restauro una nota, **Then** vuelve a la vista activa con todo su contenido
3. **Given** que una nota tiene más de 7 días en el papelero, **When** se evalúa la limpieza, **Then** se elimina permanentemente

---

### User Story 5 - Personalizar notas con color y emoji (Priority: P3)

Como usuario, quiero cambiar el color de fondo de mis notas y asignarles un emoji para identificarlas visualmente.

**Why this priority**: Diferenciación visual valiosa pero no bloqueante.

**Independent Test**: Crear notas, asignar distintos colores y emojis, verificar que se muestran correctamente y persisten.

**Acceptance Scenarios**:

1. **Given** que tengo una nota abierta, **When** selecciono un color de la paleta, **Then** el fondo de la nota cambia a ese color
2. **Given** que tengo una nota, **When** selecciono un emoji, **Then** el emoji se muestra junto al título
3. **Given** que personalicé color y emoji, **When** recargo la página, **Then** los cambios persisten

---

### Edge Cases

- ¿Qué pasa cuando el almacenamiento de IndexedDB está lleno? Debe mostrar un indicador de uso y advertir al usuario.
- ¿Cómo maneja el sistema la edición simultánea en múltiples pestañas? Debe sincronizar cambios vía evento `storage` o BroadcastChannel.
- ¿Qué sucede si el usuario adjunta una imagen muy grande? Debe validar tamaño máximo (ej. 10MB) y mostrar error.
- ¿Qué ocurre si se elimina una nota con historial de versiones? El historial también debe eliminarse o marcarse.

## Requirements

### Functional Requirements

- **FR-001**: Sistema MUST permitir crear notas con título y contenido Markdown
- **FR-002**: Sistema MUST persistir notas en IndexedDB usando la librería `idb`
- **FR-003**: Sistema MUST mostrar notas en vista Post-It (grid) y vista Lista
- **FR-004**: Usuarios MUST poder cambiar entre vista Post-It y Lista
- **FR-005**: Sistema MUST permitir reordenar notas con drag & drop (@dnd-kit)
- **FR-006**: Sistema MUST mostrar barra de búsqueda en la parte superior
- **FR-007**: Sistema MUST filtrar notas en tiempo real mientras se escribe en la búsqueda
- **FR-008**: Sistema MUST permitir cambiar el color de fondo de cada nota
- **FR-009**: Sistema MUST permitir seleccionar un emoji por nota
- **FR-010**: Sistema MUST soportar Markdown completo con toggle edición/vista previa
- **FR-011**: Sistema MUST almacenar fecha de creación y modificación en UTC
- **FR-012**: Sistema MUST implementar papelero con eliminación después de 7 días
- **FR-013**: Usuarios MUST poder restaurar notas desde el papelero
- **FR-014**: Sistema MUST mantener historial de versiones por nota
- **FR-015**: Usuarios MUST poder volver a versiones anteriores de una nota
- **FR-016**: Sistema MUST permitir adjuntar imágenes a las notas
- **FR-017**: Sistema MUST soportar tags por nota
- **FR-018**: Sistema MUST agrupar notas por tag, carpeta o proyecto
- **FR-019**: Sistema MUST exportar notas como archivos .md con frontmatter YAML
- **FR-020**: Sistema MUST importar notas desde archivos .md
- **FR-021**: Sistema MUST exportar todas las notas como ZIP
- **FR-022**: Sistema MUST funcionar como PWA (offline, manifest.json, service worker)
- **FR-023**: Sistema MUST soportar tema oscuro, claro y seguir preferencia del sistema
- **FR-024**: Sistema MUST tener atajos de teclado (Ctrl+N, Ctrl+F, Ctrl+E, Ctrl+Z, Delete)
- **FR-025**: Sistema MUST cumplir estándares WCAG AA (ARIA labels, navegación teclado, contraste)
- **FR-026**: Sistema MUST mostrar indicador de uso de almacenamiento
- **FR-027**: Sistema MUST usar exclusivamente dependencias con licencia MIT, Apache-2.0, BSD, ISC o CC0-1.0
- **FR-028**: Sistema MUST guardar notas como Markdown con frontmatter YAML pensando en futura sincronización

### Key Entities

- **Note**: Entidad principal. Contiene título, contenido Markdown, metadatos (tags, color, emoji, carpeta), timestamps UTC, y posición para ordenamiento.
- **NoteVersion**: Historial de cambios de una nota. Almacena contenido, título, número de versión y timestamp.
- **Attachment**: Archivo adjunto (imagen) vinculado a una nota. Almacena nombre, tipo MIME, datos binarios en IndexedDB.
- **TrashItem**: Nota eliminada con fecha de eliminación. Se autoelimina después de 7 días.
- **AppSettings**: Preferencias del usuario (tema, vista por defecto, ordenamiento, etc.).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuarios pueden crear una nota en menos de 2 clics desde cualquier vista
- **SC-002**: La aplicación carga y es funcional en menos de 3 segundos en conexión promedio
- **SC-003**: La app funciona completamente offline sin errores después de la carga inicial
- **SC-004**: Usuarios pueden encontrar una nota específica entre 100 notas en menos de 5 segundos usando búsqueda
- **SC-005**: 100% de las funcionalidades críticas (crear, editar, eliminar, buscar) tienen tests automatizados
- **SC-006**: La app mantiene puntuación de 90+ en Lighthouse para PWA y accesibilidad

## Assumptions

- Usuarios tienen un navegador moderno (Chrome, Edge, Firefox, Safari actual) con soporte para IndexedDB y Service Workers
- Mobile support está fuera de alcance para v1 (responsive pero no mobile-first)
- No se requiere autenticación de usuarios ni sincronización cloud en v1
- El límite de almacenamiento de IndexedDB (~50% del disco disponible) es suficiente para el caso de uso típico
- Tamaño máximo por adjunto: 10MB
- Máximo de versiones por nota: 50 versiones
- Las imágenes adjuntas se almacenan como ArrayBuffer en IndexedDB, no como referencias URL
