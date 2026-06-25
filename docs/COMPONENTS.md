# Componentes

## Árbol de composición

```
Page
└── StudyProvider (lib/store.tsx)
    └── AppShell
        ├── Landing          (view === "landing")
        ├── UploadScreen     (view === "upload")
        └── App layout       (view === "app")
            ├── Header (Logo, Nav, ThemeToggle)
            ├── SkillTree | Dashboard  (tab)
            ├── NodeDrawer   (overlay, si activeNodeId)
            └── LessonMode     (overlay, si lessonNodeId)
```

## Componentes de aplicación

### `AppShell` — `components/app-shell.tsx`

Orquestador principal de vistas y navegación.

| Responsabilidad | Detalle |
|-----------------|---------|
| Routing por vista | `view` del store: `landing` \| `upload` \| `app` |
| Tabs internas | `tree` \| `dashboard` (estado local) |
| Header | Logo, nav Mapa/Progreso, "Nuevo mapa", ThemeToggle |
| Overlays | Monta `NodeDrawer` y `LessonMode` |

Subcomponente interno: `NavButton` con indicador animado (`layoutId="nav-active"`).

**Hooks:** `useStudy()` → `view`, `setView`, `map`, `lessonNodeId`

---

### `Landing` — `components/landing.tsx`

Página de marketing / onboarding.

| Sección | Contenido |
|---------|-----------|
| Hero | Título, CTA "Subir apuntes", leyenda de colores mastery |
| MiniTree | SVG animado decorativo del árbol de conceptos |
| Features | 4 tarjetas con iconos Lucide |
| How it works | 3 pasos numerados |
| CTA final | Bloque con gradiente |

**Dependencias:** `NodeField`, `Logo`, `ThemeToggle`, `useStudy().setView`

---

### `UploadScreen` — `components/upload-screen.tsx`

Formulario de entrada de apuntes.

| Elemento | Comportamiento |
|----------|----------------|
| Drop zone | Drag & drop de archivos (solo guarda nombre, no parsea) |
| Textarea | Texto pegado manualmente |
| Generar | Requiere `text.length > 8` o archivo seleccionado |
| Loader | Simula 5 pasos (`loaderSteps`) cada 720ms, luego `generate()` |

**Hooks:** `useStudy()` → `setView`, `generate`

Subcomponente: `Loader` con animación de pasos.

---

### `SkillTree` — `components/skill-tree.tsx`

Visualización del mapa de conocimiento.

| Vista | Breakpoint | Descripción |
|-------|------------|-------------|
| `GraphView` | `lg+` | Grafo SVG con pan/zoom, nodos circulares |
| `ListView` | `< lg` | Lista vertical ordenada por `level` |

**Interacciones GraphView:**
- Arrastrar para pan
- Rueda para zoom (0.4–1.8)
- Botones +/- / centrar
- Click en nodo → `openNode(id)` si no está `locked`

Subcomponentes internos: `GraphNode`, `ZoomBtn`, `ListView`.

**Datos:** `layoutNodes()` de `lib/study.ts`, `getMastery()` por nodo.

---

### `NodeDrawer` — `components/node-drawer.tsx`

Panel lateral derecho con detalle del concepto activo.

| Sección | Contenido |
|---------|-----------|
| Header | Badge mastery, título, botón cerrar |
| Progreso | Barra de % e intentos |
| Explicación | `node.detail` |
| Ejemplos | Lista de `node.examples` |
| Footer | "Empezar lección" / "Repetir lección" → `startLesson(node.id)` |
| Resumen | `{n} pasos` con desglose teoría/preguntas (`lessonStepSummary`) |

**Estado:** `activeNodeId` del store. Overlay con click fuera cierra.

---

### `LessonMode` — `components/lesson-mode.tsx`

Pantalla completa de lección con pasos mixtos.

| Tipo de paso | UI | Evaluable |
|--------------|-----|-----------|
| `theory` | Tarjeta condensada + "Continuar" | No |
| `choice` | 4 opciones A-D | Sí |
| `text` | Input + hint + "Comprobar" | Sí |

**Flujo:**
1. Recorre `node.steps` secuencialmente
2. Solo `choice` y `text` cuentan para la nota
3. Texto: validación local (`checkTextAnswer`) + botón opcional "Pedir revisión con IA" (`/api/validate-answer`)
4. Al finalizar → `recordLesson(nodeId, score)` con `score = aciertos / pasosEvaluables * 100`

Subcomponentes: `TheoryStepView`, `ChoiceStepView`, `TextStepView`, `Results`.

**Estado:** `lessonNodeId` del store.

---

## Modelo de lección — `lib/types.ts`

```ts
type LessonStep =
  | { type: "theory"; id; content }
  | { type: "choice"; id; question; options; correctIndex; explanation }
  | { type: "text"; id; question; hint; acceptedAnswers; explanation }
```

Helpers en `lib/lesson.ts` (`countAssessableSteps`, `lessonStepSummary`).
Migración legacy en `lib/migrate-lesson.ts` (`questionsToSteps`, enriquecimiento biología).

---

### ~~`QuizMode`~~ (eliminado)

Reemplazado por `LessonMode`.

---

### `Dashboard` — `components/dashboard.tsx`

Panel de progreso y estadísticas.

| Bloque | Contenido |
|--------|-----------|
| Coach message | Según `stats.overall` (80+/40+/resto) |
| Anillo central | % dominio total |
| StatCards | Dominados, débiles, racha, por explorar |
| Distribución | Barra apilada por mastery |
| Por concepto | Lista con barras de progreso (click → `openNode`) |
| Repaso | Chips de nodos débiles (amber + red) |

Subcomponente: `StatCard`.

**Datos:** `computeStats()`, `getMastery()`, `masteryMeta` de `lib/study.ts`.

---

### `Brand` — `components/brand.tsx`

| Export | Descripción |
|--------|-------------|
| `Logo` | Icono SVG de árbol + texto "Mapa de Estudio" |
| `ThemeToggle` | Botón sol/luna, usa `toggleTheme()` del store |

---

### `NodeField` — `components/node-field.tsx`

Fondo decorativo animado (canvas).

- Partículas conectadas por distancia < 130px
- Lee `--primary` del tema en runtime
- Respeta `prefers-reduced-motion: reduce`
- `aria-hidden="true"` — puramente decorativo

---

## Componentes UI (shadcn)

### `Button` — `components/ui/button.tsx`

Basado en `@base-ui/react/button` + CVA.

| Variante | Uso |
|----------|-----|
| `default` | Acción primaria |
| `outline` | Secundaria con borde |
| `secondary` | Fondo secondary |
| `ghost` | Sin fondo, hover muted |
| `destructive` | Acciones peligrosas |
| `link` | Estilo enlace |

| Tamaño | Uso |
|--------|-----|
| `default`, `sm`, `lg`, `xs` | Botones con texto |
| `icon`, `icon-sm`, `icon-lg` | Solo icono |

**Nota:** La mayoría de botones de la app usan clases Tailwind inline en lugar de este componente. Usar `Button` para nuevas UI que siga shadcn.

---

## Estado global — `lib/store.tsx`

No es un componente visual, pero todos los componentes interactivos dependen de él.

### `StudyProvider`

Envuelve la app en `app/page.tsx`.

### `useStudy()` — API

| Campo / Método | Tipo | Descripción |
|----------------|------|-------------|
| `view` | `View` | Vista actual |
| `setView` | fn | Cambiar vista |
| `map` | `StudyMap \| null` | Mapa generado |
| `generate` | fn | Crear mapa desde input |
| `reset` | fn | Limpiar todo, volver a landing |
| `progress` | `ProgressMap` | Progreso por nodeId |
| `recordLesson` | fn | Guardar mejor score de una lección |
| `streak` | number | Contador de lecciones completadas |
| `activeNodeId` | `string \| null` | Nodo abierto en drawer |
| `openNode` / `closeNode` | fn | Controlar drawer |
| `lessonNodeId` | `string \| null` | Nodo en modo lección |
| `startLesson` / `endLesson` | fn | Controlar lección |
| `theme` | `"dark" \| "light"` | Tema actual |
| `toggleTheme` | fn | Alternar tema |

---

## Guía rápida: añadir un componente nuevo

1. Crear en `components/` con `"use client"` si usa hooks o eventos
2. Importar `cn` de `@/lib/utils` para clases condicionales
3. Consumir estado con `useStudy()` si necesita datos globales
4. Seguir patrones de tarjeta, spacing y colores de [THEME.md](./THEME.md)
5. Textos en español
6. Iconos de `lucide-react`
7. Animaciones con `framer-motion` si hay transiciones de entrada/salida
