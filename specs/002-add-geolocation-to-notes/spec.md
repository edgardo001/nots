# Feature Specification: Geolocalización en Notas

**Feature Directory**: `specs/002-add-geolocation-to-notes/`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "agrega geolocalizacion a las notas, donde se crearon, donde se modificaron, con historial de geo localizacion, en el caso de los fork, tambien tomara la geolocalizacion de ese evento"

## User Scenarios & Testing

### User Story 1 - Capturar geolocalización al crear nota (Priority: P1)

Como usuario, quiero que al crear una nota se capture automáticamente la ubicación donde fue creada, para saber dónde estaba cuando escribí esa nota.

**Why this priority**: Es la funcionalidad base de geolocalización. Sin captura no hay datos que mostrar.

**Independent Test**: Crear una nota nueva — debe almacenar lat/lng. Verificar en IndexedDB que los campos de geolocalización tienen valores.

**Acceptance Scenarios**:

1. **Given** que el usuario permite geolocalización, **When** crea una nota nueva, **Then** la nota guarda `createdLat` y `createdLng`
2. **Given** que el usuario deniega geolocalización, **When** crea una nota, **Then** la nota se crea sin geolocalización (graceful fallback)

---

### User Story 2 - Actualizar ubicación al modificar nota (Priority: P1)

Como usuario, quiero que cada vez que modifico una nota se actualice la ubicación de última modificación.

**Why this priority**: Complementa la captura inicial, permite trackear dónde se hicieron cambios.

**Independent Test**: Editar una nota existente — `updatedLat`/`updatedLng` deben reflejar la ubicación actual.

**Acceptance Scenarios**:

1. **Given** una nota existente, **When** modifico su contenido, **Then** `updatedLat` y `updatedLng` se actualizan
2. **Given** una nota creada sin geolocalización, **When** la modifico con permiso, **Then** se asigna geolocalización

---

### User Story 3 - Geolocalización en historial de versiones (Priority: P2)

Como usuario, quiero que cada versión guardada incluya la ubicación desde donde se guardó.

**Why this priority**: El historial de versiones es el registro de cambios; la ubicación en cada versión permite reconstruir el contexto de cada edición.

**Independent Test**: Guardar versiones múltiples desde ubicaciones diferentes — cada versión debe tener su propia geolocalización.

**Acceptance Scenarios**:

1. **Given** una nota con versiones, **When** reviso el historial, **Then** cada versión muestra su lat/lng
2. **Given** que hago fork de una versión, **When** se crea la nueva nota, **Then** captura la ubicación del fork

---

### Edge Cases

- ¿Qué pasa si el usuario deniega el permiso de geolocalización? La nota se crea sin coordenadas (graceful degradation).
- ¿Qué ocurre si la geolocalización expira o no está disponible (sin GPS, sin WiFi)? Se omite la geolocalización para esa operación.
- ¿Cómo se maneja el cache de posición? Se usa la posición actual en el momento exacto de crear/guardar, no una posición cacheada.
- ¿Qué pasa con notas existentes? Los campos nuevos son opcionales, notas viejas simplemente no tienen geolocalización.
- ¿Privacidad? Las coordenadas son solo locales (IndexedDB), no se envían a ningún servidor.

## Requirements

### Functional Requirements

- **FR-001**: Sistema MUST capturar lat/lng al crear una nota (usando Geolocation API)
- **FR-002**: Sistema MUST actualizar lat/lng al modificar contenido o título
- **FR-003**: Sistema MUST almacenar geolocalización en cada versión guardada
- **FR-004**: Sistema MUST capturar geolocalización al hacer fork de una versión
- **FR-005**: Sistema MUST funcionar gracefulmente si el usuario deniega o no hay geolocalización
- **FR-006**: Sistema MUST mostrar indicador visual de ubicación en la nota
- **FR-007**: Sistema MUST mostrar coordenadas en el visor de versiones

### Key Entities

- **Note**: Se extiende con `createdLat`, `createdLng`, `updatedLat`, `updatedLng`
- **NoteVersion**: Se extiende con `lat`, `lng`

## Success Criteria

### Measurable Outcomes

- **SC-001**: Notas nuevas capturan geolocalización en <1s cuando hay permiso
- **SC-002**: Notas sin permiso se crean sin errores ni bloqueos
- **SC-003**: Versiones históricas muestran coordenadas correctas

## Assumptions

- Usuarios pueden denegar permiso de geolocalización sin afectar funcionalidad
- Las coordenadas se almacenan solo localmente en IndexedDB (privacidad)
- Notas existentes migran sin perder datos (campos opcionales)
- Se usa la Geolocation API del navegador (no librerías externas)
