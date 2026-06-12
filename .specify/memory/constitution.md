# App de Notas (Post-It Style) Constitution

## Core Principles

### I. Client-Side First
Toda la lógica de la aplicación debe ejecutarse exclusivamente en el navegador del usuario. No se requiere servidor backend ni base de datos remota. La persistencia se maneja completamente mediante IndexedDB en el navegador. Sincronización futura con servicios cloud (Google Drive, etc.) debe implementarse como capa opcional sin alterar la arquitectura cliente.

### II. Privacidad y Datos Locales
Los datos del usuario son exclusivamente locales. No se debe enviar información de las notas a ningún servidor externo sin consentimiento explícito del usuario. La exportación/importación debe ser controlada por el usuario. El almacenamiento en IndexedDB debe informar su uso y respetar límites del navegador.

### III. TypeScript Estricto
Todo el código debe escribirse en TypeScript con modo estricto (`strict: true`). No se permiten tipos `any` implícitos. Interfaces y tipos deben definirse explícitamente para todas las entidades de datos (Note, Attachment, NoteVersion, AppSettings). Componentes funcionales con tipado completo de props.

### IV. Licencias de Código Abierto
Todas las dependencias del proyecto deben tener licencias MIT, Apache-2.0, BSD, ISC o CC0-1.0. Está prohibido el uso de GPL, AGPL, SSPL o licencias comerciales que restrinjan el uso del proyecto. Cada dependencia agregada debe verificarse contra esta política.

### V. Calidad y Testing
Toda funcionalidad debe incluir tests. Usar Vitest para tests unitarios y Testing Library para tests de componentes. Los tests de integración deben cubrir el flujo IndexedDB + Zustand. La sanitización de entrada (especialmente Markdown para prevenir XSS) debe verificarse en tests de seguridad.

### VI. Accesibilidad (WCAG AA)
Toda la interfaz debe cumplir con estándares WCAG AA. ARIA labels en todos los componentes interactivos, navegación completa por teclado, contraste de color suficiente, y soporte para lectores de pantalla. El tema oscuro/claro/sistema no debe sacrificar accesibilidad.

### VII. Experiencia Offline (PWA)
La aplicación debe funcionar completamente offline una vez cargada. Debe configurarse como Progressive Web App con manifest.json y service worker. Las notas creadas sin conexión deben persistir localmente y estar disponibles al reconectarse.

## Stack Tecnológico

| Capa | Tecnología | Licencia |
|---|---|---|
| Framework UI | React 19 | MIT |
| Build tool | Vite 6 | MIT |
| Lenguaje | TypeScript 5.x (strict) | Apache-2.0 |
| Runtime | Bun 1.x | MIT |
| Estado global | Zustand | MIT |
| IndexedDB | idb | ISC |
| Markdown | react-markdown + remark-gfm | MIT |
| Drag & Drop | @dnd-kit/core | MIT |
| Testing | Vitest + Testing Library | MIT |
| PWA | vite-plugin-pwa | MIT |
| Sintaxis MD | rehype-highlight | MIT |
| Fechas | date-fns | MIT |

## Formato de Datos

Las notas se almacenan en IndexedDB y se exportan/importan como archivos `.md` con frontmatter YAML:

```yaml
---
title: "Mi Nota"
tags: [tag1, tag2]
color: "#FFE4B5"
emoji: "📝"
folder: "proyectos"
createdAt: "2026-06-12T10:00:00.000Z"
updatedAt: "2026-06-12T12:30:00.000Z"
---
Contenido de la nota en **Markdown**...
```

Este formato permite futura sincronización con Google Drive, Dropbox y otros servicios.

## Desarrollo Multi-Agente

Toda decisión importante debe pasar por consenso de estos roles:

1. **Arquitecto**: Decide estructura, flujo de datos, trade-offs técnicos
2. **Product Owner**: Prioriza features, valida cumplimiento de requisitos
3. **Developer**: Implementa, sugiere mejoras técnicas viables
4. **UI/UX**: Diseña interacción, asegura experiencia de usuario coherente
5. **Tester QA**: Valida calidad, propone casos de prueba
6. **Seguridad**: Revisa XSS, sanitización, almacenamiento seguro

Dinámica: Propuesta → Discusión (cada rol) → Consenso → Registro en ADRs/

## Governance

- La constitución prevalece sobre cualquier otra práctica no documentada.
- Las enmiendas requieren: documentación del cambio, aprobación de 3+ roles, y plan de migración.
- El versionado sigue semver: MAJOR (cambios retro-incompatibles), MINOR (nuevos principios), PATCH (aclaraciones).
- Todos los PRs deben verificar cumplimiento contra los principios de esta constitución.
- La complejidad debe justificarse: si una solución tiene más de 3 capas de abstracción, debe defenderse ante el equipo.

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
