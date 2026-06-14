# Research: Geolocalización en Notas

## Technology Decisions

### Geolocation API (nativa del navegador)
- **Decision**: Usar `navigator.geolocation.getCurrentPosition()` sin librerías externas
- **Rationale**: API nativa, soportada en todos los navegadores modernos (Chrome, Edge, Firefox, Safari). No requiere dependencias ni licencias. La probabilidad de éxito es alta en dispositivos con GPS (móviles) y aceptable en desktop (basada en IP/WiFi).
- **Alternatives considered**: `leaflet` + `OpenStreetMap` (demasiado pesado para solo coordenadas), `geo-lib` (innecesario para lat/lng simples)

### Estrategia de captura
- **Decision**: Capturar posición en el momento exacto de la acción (crear, guardar, versionar, fork), no usar posición cacheada
- **Rationale**: La posición cacheada podría ser de horas antes y no reflejar dónde realmente se hizo el cambio
- **Alternatives considered**: `watchPosition` (consumo de batería innecesario), IP geolocation (menos precisa)

### Manejo de errores
- **Decision**: Timeout de 5s para `getCurrentPosition`. Si falla o deniega, continuar sin coordenadas
- **Rationale**: No bloquear la UX. El usuario puede denegar permiso o estar en un área sin señal.
- **Alternatives considered**: Reintentar, pedir permiso explícito — agregaría fricción innecesaria

### Privacidad
- **Decision**: Las coordenadas se almacenan exclusivamente en IndexedDB local. No hay sincronización cloud en v1
- **Rationale**: Consistente con el principio de privacidad de la constitución del proyecto.

## Geolocation API Details

- Método: `navigator.geolocation.getCurrentPosition(success, error, options)`
- Opciones: `{ enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }`
- `enableHighAccuracy: false` para evitar delays largos en desktop
- `maximumAge: 0` para forzar posición fresca en cada captura
- Error `PERMISSION_DENIED`: continuar sin coordenadas
- Error `POSITION_UNAVAILABLE` / `TIMEOUT`: continuar sin coordenadas

## License Check

| Dependencia | Licencia |
|---|---|
| Geolocation API | Nativa del navegador (no aplica) |

✅ Sin nuevas dependencias externas.

## Browser Support

| Browser | Geolocation API |
|---|---|
| Chrome 5+ | ✅ |
| Edge 12+ | ✅ |
| Firefox 3.5+ | ✅ |
| Safari 5+ | ✅ |
| Opera 10.6+ | ✅ |
| iOS Safari 3.2+ | ✅ |
| Android Chrome 2.1+ | ✅ |

Soporte universal desde 2026.
