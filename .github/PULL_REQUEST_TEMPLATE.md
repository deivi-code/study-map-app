## Resumen

Implementación completa del plan de mejoras en 5 fases, cubriendo los 41 items del plan.

### Fase 1 — Config y bugs críticos
- Eliminado `ignoreBuildErrors`, build valida TypeScript correctamente
- `generateMapAction` devuelve errores como objeto (`{ error }`) en lugar de lanzar excepciones
- Streak respeta `lastActiveDate` (se reinicia si hay días sin actividad)
- `checkTextAnswer`: matching por tokens de palabras, sin falsos positivos
- Eliminado módulo `counter` reemplazado por hash de input (funciona en serverless)
- `computeStats` protegido contra arrays vacíos
- Reinicio de lección resetea `persistedRef` para re-persistir progreso
- Store persiste a localStorage cada 30s y en cada cambio
- Diálogo de confirmación al salir de lección
- 0/0 aciertos → muestra "Lección sin preguntas"
- ARIA en barra de progreso; `<label>` en input de texto

### Fase 2 — Resiliencia UX
- `ErrorBoundary` global con botón de reintento
- Botón "Nuevo mapa" visible en mobile (icono siempre, label en `sm:`)
- `NodeDrawer`: focus trap, ESC para cerrar, `aria-modal`, lista de dependencias
- `SkillTree`: navegación por teclado, `LoadingSkeleton`, vista lista con dependencias
- `Dashboard`: estado vacío con CTA
- `NodeField`: bucle rAF cancelado si `prefers-reduced-motion: reduce`
- Botones de zoom: `min-w-[44px] min-h-[44px] touch-manipulation`
- `GraphView`: búsqueda O(1) de padres con Map

### Fase 3 — Nuevas funcionalidades
- `LoadingSkeleton` compartido + `loading.tsx` para rutas de mapa
- Feedback háptico (`navigator.vibrate(20)`) en respuestas incorrectas
- Nuevas plantillas: `matematicas` (álgebra) y `fisica` (mecánica clásica)

### Fase 4 — Deuda técnica
- Eliminado alias `QuizMode` (no usado)
- Tema oscuro/claro: lee `localStorage` y `prefers-color-scheme` al iniciar
- Conexión lazy a DB (`getDb()`) para no fallar si falta `DATABASE_URL`
- ESLint flat config con `eslint-plugin-jsx-a11y` (reglas warn)
- Documentación actualizada (`docs/`: README, ARCHITECTURE, COMPONENTS, TECHNOLOGIES)

### Fase 5 — Features grandes
- Tutorial de onboarding para nuevos usuarios (overlay con pasos)
- Búsqueda/filtro de conceptos en el árbol
- PWA: manifest.json, service worker con cache-first
- Exportar/importar mapas como JSON
- Suite de tests con Vitest + React Testing Library (13 tests de lógica core)

## Verificación
- Build de producción exitoso con TypeScript validation
- ESLint pasa limpio
- 13 tests unitarios pasan
- Branch: `improvements/overhaul`

Closes: #1
