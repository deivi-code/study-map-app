# 1. OBJECTIVE

Implementar una vista que permita listar todos los itinerarios (mapas de estudio) creados por un usuario, tanto para usuarios anónimos como autenticados. La lista debe integrarse con la navegación existente y mantener la estética visual de la app.

# 2. CONTEXT SUMMARY

### Sistema actual:
- **Usuarios anónimos**: Se identifican mediante Better Auth (`anonymousClient`) y tienen un ID guardado en `localStorage` (`studymap:anonymousId`)
- **Usuarios autenticados**: Pueden iniciar sesión con Google o magic link
- **Persistencia**: Los mapas se guardan en la tabla `studyMap` con `userId`
- **Migración**: Al autenticarse, los datos del usuario anónimo migran a su cuenta (ya implementado en `lib/auth/migration.ts`)
- **Rate limiting**: Anónimos tienen 3 itinerarios, autenticados 10

### Tabla `studyMap` relevante:
```
id, userId, title, sourceType, nodes, createdAt, updatedAt
```

### Flujo actual:
1. Landing → Upload → App (mapa/progreso)
2. Solo se carga el mapa más reciente en `/api/load-state`

# 3. APPROACH OVERVIEW

**Estrategia**: Crear un panel desplegable desde el menú de usuario que muestre la lista de itinerarios, permitiendo seleccionar uno para cargarlo.

### Justificación:
- Evita crear una vista nueva completa, integrándose naturalmente con la navegación existente
- Mantiene al usuario en contexto sin cambiar de página
- Accesible tanto para anónimos (botón "Usuario") como autenticados
- Consistente con el patrón de menús desplegables ya usado en `AuthButton`

### Alternativas consideradas:
- **Nueva pestaña "Mis mapas"**: Más visible pero más invasivo en la navegación
- **Página completa "/maps"**: Requiere más cambios en routing y layout

# 4. IMPLEMENTATION STEPS

## Paso 1: Crear API `/api/list-maps`
**Goal**: Endpoint para obtener todos los mapas de un usuario con metadatos resumidos.

**Method**: Crear `app/api/list-maps/route.ts` que:
- Obtenga el `userId` de la sesión (anónima o autenticada)
- Query todos los `studyMap` del usuario ordenados por `createdAt` DESC
- Devuelva: `{ id, title, sourceType, nodeCount, createdAt, updatedAt }`

**Reference**: `app/api/load-state/route.ts` (patrón similar)

---

## Paso 2: Crear componente `ItineraryList`
**Goal**: Componente visual para mostrar la lista de itinerarios.

**Method**: Crear `components/itinerary-list.tsx`:
- Grid responsive de tarjetas
- Cada tarjeta muestra: título, fecha, número de nodos, barra de progreso general
- Estados: loading skeleton, empty state, error state
- Animaciones de entrada con Framer Motion
- Diseño consistente con tema oscuro de la app

**Reference**: `components/dashboard.tsx` (patrón de tarjetas), `docs/THEME.md`

---

## Paso 3: Integrar `ItineraryList` en el menú de usuario
**Goal**: Mostrar la lista de itinerarios accesible desde el header.

**Method**: Modificar `components/brand.tsx`:
- Extender `AuthButton` para incluir un submenú "Mis itinerarios"
- Para usuarios anónimos: mostrar el botón que abre el panel
- Para usuarios autenticados:integrar en el menú desplegable existente
- Implementar panel lateral (slide-in desde derecha) con la lista

**Reference**: `components/brand.tsx`, `components/node-drawer.tsx` (patrón de panel lateral)

---

## Paso 4: Modificar API `/api/load-state` para aceptar mapId
**Goal**: Poder cargar cualquier mapa, no solo el más reciente.

**Method**: Modificar `app/api/load-state/route.ts`:
- Aceptar query param `mapId` opcional
- Si se proporciona `mapId`, cargar ese mapa específico
- Si no, mantener comportamiento actual (último mapa)

**Reference**: `app/api/load-state/route.ts`

---

## Paso 5: Conectar con store y funcionalidad de carga
**Goal**: Permitir seleccionar un itinerario y cargarlo en la app.

**Method**: En `components/itinerary-list.tsx` y `lib/store.tsx`:
- Agregar función `loadMapById(mapId)` en el store
- Llamar al endpoint modificado con el mapId seleccionado
- Actualizar el store con el mapa seleccionado
- Gestionar estados de carga y error

**Reference**: `lib/store.tsx`, `components/itinerary-list.tsx`

---

## Paso 6: Añadir funcionalidad de eliminar itinerario
**Goal**: Permitir al usuario borrar itinerarios no deseados.

**Method**: 
- Crear `app/api/delete-map/route.ts` para eliminar un mapa
- Agregar botón de eliminar en cada tarjeta (con confirmación)
- Actualizar lista tras eliminar

---

## Paso 7: Refinamiento visual y UX
**Goal**: Asegurar coherencia estética y buena experiencia.

**Method**:
- Verificar que el panel lateral se vea bien en móvil
- Añadir empty state descriptivo ("Aún no has creado ningún itinerario")
- Tooltips para acciones
- Keyboard navigation (accesibilidad)

# 5. TESTING AND VALIDATION

### Validación visual:
1. Abrir la app y verificar que el menú de usuario muestra la opción "Mis itinerarios"
2. Crear 2-3 itinerarios y verificar que aparecen en la lista
3. Hacer click en un itinerario y verificar que se carga correctamente
4. Verificar que el empty state se muestra cuando no hay itinerarios
5. Probar en modo claro/oscuro

### Validación funcional:
1. **Usuario anónimo**: Crear itinerarios, verificar que aparecen en la lista
2. **Usuario autenticado**: Crear itinerarios, recargar página, verificar que persisten
3. **Migración**: Crear itinerarios como anónimo, iniciar sesión, verificar que los datos migran
4. **Eliminar**: Crear itinerario, eliminarlo, verificar que desaparece de la lista
5. **Cargar mapa específico**: Seleccionar un mapa antiguo y verificar que muestra los nodos correctos

### Criterios de éxito:
- ✅ La lista muestra todos los itinerarios del usuario
- ✅ Funciona tanto para anónimos como autenticados
- ✅ Seleccionar un itinerario lo carga en la vista
- ✅ El diseño es consistente con la estética de la app
- ✅ No hay errores en consola
- ✅ El empty state es amigable
