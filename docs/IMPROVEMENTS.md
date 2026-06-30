# Plan de mejoras — Mapa de Estudio

## 🔴 Bugs

### 1. `ignoreBuildErrors: true` en producción
**Archivo:** `next.config.mjs:2`
Oculta errores de TypeScript y compilación. En un build de producción esto puede generar fallos silenciosos.
**Fix:** Eliminar `typescript: { ignoreBuildErrors: true }` y corregir los errores subyacentes.

### 2. Usuarios anónimos pierden todo al recargar
**Archivo:** `lib/store.tsx:138`
`loadState()` solo se ejecuta para usuarios autenticados. Un usuario anónimo que crea un mapa, estudia y recarga la página pierde todo el progreso sin advertencia.
**Fix:** Guardar `map` y `progress` en `localStorage` para anónimos, o al menos mostrar un aviso.

### 3. `rateLimitRemaining` inicial incorrecto para usuarios autenticados
**Archivo:** `lib/store.tsx:86`
El valor inicial es `3` (límite de anónimos). Para usuarios autenticados, el valor real (`10`) solo se actualiza tras la primera generación exitosa.
**Fix:** Inicializar según `user.isAnonymous` o consultar el límite real al cargar sesión.

### 4. Sin persistencia de progreso en `recordLesson`
**Archivo:** `lib/store.tsx:246`
Cuando un usuario completa una lección, el progreso se actualiza en memoria pero nunca se persiste a la API (salvo al cargar estado inicial). Si el usuario navega o recarga, pierde el progreso de la sesión actual.
**Fix:** Llamar a una API `PATCH` de progreso, o al menos guardar en `localStorage`.

### 5. `TextStepView` — `includes()` puede dar falsos positivos
**Archivo:** `lib/answer-check.ts:17`
`normalized.includes(normAccepted)` considera "no selectiva" como respuesta correcta porque contiene "selectiva". También "doble hélices" por "doble hélice".
**Fix:** Usar coincidencia exacta o por palabras (tokenize y comparar sets).

### 6. Sin `ErrorBoundary` en el árbol de componentes
Si un componente como `SkillTree`, `NodeDrawer` o `LessonMode` crashea, la app muestra pantalla en blanco.
**Fix:** Agregar `ErrorBoundary` en `app-shell` y otro envolviendo `LessonMode`.

### 7. Sin confirmación al salir de una lección
**Archivo:** `components/lesson-mode.tsx:88`
Si el usuario pulsa la X durante una lección, pierde todo el progreso del nodo sin confirmación.
**Fix:** Agregar un `confirm()` o un modal de "¿Salir? Se perderá el progreso".

---

## 🟡 UX / Diseño

### 8. Vista móvil sin acceso a "Nuevo mapa"
**Archivo:** `components/app-shell.tsx`
El botón "Nuevo mapa" es `hidden sm:flex` — invisible en móvil. Lo mismo para el contador de itinerarios restantes y "Empezar" en el header del landing.
**Fix:** Mostrar versión compacta en móvil (solo icono).

### 9. `NodeDrawer` no muestra qué prerrequisitos faltan para nodos bloqueados
Un nodo "locked" en el panel lateral solo se ve bloqueado, pero no dice qué nodos hay que completar para desbloquearlo.
**Fix:** En el NodeDrawer, si el nodo está locked, listar los `deps` con sus títulos y estados.

### 10. Animaciones sin respetar `prefers-reduced-motion`
**Archivo:** `components/landing.tsx`, `components/skill-tree.tsx`, múltiples
Solo `NodeField.tsx` respeta `prefers-reduced-motion`. El resto (hero, features, nodos del árbol) no lo hace.
**Fix:** Usar `useReducedMotion()` de Framer Motion en componentes principales.

### 11. SkillTree sin accesibilidad teclado
El grafo se maneja solo con puntero/ratón. No hay `tabIndex`, ni `aria-roles`, ni navegación por teclado.
**Fix:** Agregar `tabIndex`, `aria-label` y soporte de flechas/enter para nodos.

### 12. Sin estado vacío en `SkillTree` mientras se carga el mapa
Al llegar a "app" no hay feedback visual de carga. El mapa aparece de golpe con animaciones.
**Fix:** Mostrar un skeleton o un mensaje "Construyendo mapa..." durante el mounting.

### 13. Modal de "Mis itinerarios" sin indicador de carga global
**Archivo:** `components/itinerary-list.tsx`
Al abrir un mapa, se muestra un spinner en el botón de ese mapa, pero no hay feedback global.
**Fix:** Agregar overlay de carga en el panel cuando `loadingId` está activo.

### 14. Sin feedback táctil en zoom del grafo
**Archivo:** `components/skill-tree.tsx`
Los botones de zoom +/−/centrar son pequeños (size-8).
**Fix:** Agregar `touch-action: manipulation` y mayor área de toque.

### 15. El loader de generación puede parecer congelado
**Archivo:** `components/upload-screen.tsx`
Los pasos cambian cada 2.5s fijos. Si la IA tarda más, el loader se queda en el paso 5 sin indicación.
**Fix:** Agregar un mensaje después del último paso ("Todavía procesando...").

### 16. Sin feedback cuando la IA no puede revisar respuesta
**Archivo:** `components/lesson-mode.tsx`
El botón "Pedir revisión con IA" no deja claro si falló por límite de API, error de red, etc.
**Fix:** Mostrar feedback visual con el error.

### 17. `ListView` en móvil no permite saber de qué dependen los nodos
La vista de lista ordena por nivel pero no muestra conexiones entre nodos.
**Fix:** Agregar badges tipo "Requiere: [nodo padre]".

---

## 🟢 Mejoras de funcionalidad

### 18. Persistencia de streak con fechas reales
Guardar fechas de estudio para calcular racha basada en días consecutivos (en lugar de por lección).

### 19. Más plantillas de asignaturas
**Archivo:** `lib/templates.ts` — solo 3 plantillas (biología, historia, programación).
Agregar: matemáticas, física, química, literatura, inglés, geografía.

### 20. Búsqueda/anclaje manual en el grafo
Campo de búsqueda para encontrar nodos por nombre, o botón para centrar en un nodo específico.

### 21. Feedback háptico en respuestas incorrectas
En dispositivos táctiles vibrar ligeramente al fallar (`navigator.vibrate`).

### 22. Exportar progreso como imagen/resumen
Botón "Compartir progreso" que genere una imagen del anillo de dominio + racha.

### 23. Guardado automático periódico
Auto-guardar progreso cada 30s para usuarios autenticados.

### 24. Tutorial onboarding en primer uso
Tooltip/overlay explicando: "Arrastra para mover · Rueda para zoom · Haz clic para estudiar".

### 25. PWA / instalable
Agregar manifest.json, service worker y soporte offline básico.

---

## 🔵 Técnicas / Mantenimiento

### 26. Dependencias no usadas
Varias librerías en `package.json` no tienen imports en el código:
- `@base-ui/react`
- `shadcn` (runtime)
- `resend`
- `ai` (solo server-side)
- `drizzle-orm` y `pg` — solo si hay DB configurada

### 27. ESLint sin reglas de accesibilidad
No hay `eslint-plugin-jsx-a11y`. Se pueden detectar problemas de ARIA y roles.

### 28. Sin tests
No hay tests unitarios ni de integración. `lib/study.ts`, `lib/answer-check.ts`, `lib/lesson.ts` son fácilmente testeables.

### 29. Layout con `dark` forzado en HTML
**Archivo:** `app/layout.tsx:19`
`className="dark"` hardcodeado. Si el usuario cambia a modo claro y recarga, vuelve a oscuro.
**Fix:** Leer preferencia del sistema o cookie/localStorage al cargar.
