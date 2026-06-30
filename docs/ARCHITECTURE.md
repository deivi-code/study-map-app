# Arquitectura y estructura

## Estructura de carpetas

```
study-map-app/
├── app/                    # Next.js App Router
│   ├── (main)/             # Layout protegido (ErrorBoundary)
│   │   ├── app/[mapId]/   # Vista de mapa individual
│   │   ├── dashboard/     # Dashboard de progreso global
│   │   └── layout.tsx     # Layout con ItineraryList
│   ├── api/                # API routes
│   │   ├── auth/[...all]/ # better-auth endpoints
│   │   ├── delete-map/    # DELETE /api/delete-map
│   │   ├── generate-map/  # POST /api/generate-map
│   │   ├── list-maps/     # GET /api/list-maps
│   │   ├── load-state/    # GET /api/load-state
│   │   └── validate-answer/ # POST /api/validate-answer
│   ├── upload/            # Página de subida
│   ├── globals.css        # Tema, tokens Tailwind, estilos base
│   ├── layout.tsx         # Root layout, fuentes, metadata, ThemeProvider
│   └── page.tsx           # Entry: StudyProvider + AppShell
├── components/
│   ├── ui/                # Componentes shadcn (Button, …)
│   ├── app-shell.tsx      # Shell y navegación principal
│   ├── brand.tsx          # Logo, ThemeToggle
│   ├── dashboard.tsx      # Vista de progreso
│   ├── error-boundary.tsx # Error boundary global
│   ├── landing.tsx        # Landing page
│   ├── lesson-mode.tsx    # Modo lección fullscreen (choice + text + theory)
│   ├── loading-skeleton.tsx # Esqueleto de carga
│   ├── node-drawer.tsx    # Panel lateral de concepto
│   ├── node-field.tsx     # Fondo animado (canvas)
│   ├── skill-tree.tsx     # Grafo / lista de nodos
│   └── upload-screen.tsx  # Subida de apuntes
├── lib/
│   ├── actions/           # Server Actions (generate-map, record-lesson, delete-map)
│   ├── auth/              # better-auth config + plugins (anon, migration, rate-limit)
│   ├── db/                # Drizzle ORM (conexión lazy, schema, migrations)
│   ├── store.tsx          # Context + estado global + localStorage persist
│   ├── study.ts           # Lógica de dominio (mastery, stats, layout, generación)
│   ├── templates.ts       # Plantillas de asignaturas
│   ├── types.ts           # Tipos TypeScript
│   ├── utils.ts           # cn() helper
│   ├── answer-check.ts    # Validación de respuestas de texto (word tokens)
│   ├── lesson.ts          # Helpers de lección (step counting)
│   └── migrate-lesson.ts  # Migración de preguntas legacy a steps
├── public/                # Assets estáticos (iconos, placeholders)
├── docs/                  # Esta documentación
├── components.json        # Config shadcn
├── eslint.config.mjs      # ESLint flat config + a11y plugin
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Diagrama de flujo de datos

```mermaid
flowchart TD
    subgraph input [Entrada]
        Upload[UploadScreen]
        Text[Texto / nombre archivo]
    end

    subgraph generation [Generación]
        Gen[generateStudyMap]
        Templates[templates.ts]
    end

    subgraph state [Estado global - store.tsx]
        Map[StudyMap]
        Progress[ProgressMap]
        View[view]
        UI[activeNodeId / quizNodeId]
    end

    subgraph views [Vistas]
        Landing[Landing]
        App[AppShell]
        Tree[SkillTree]
        Dash[Dashboard]
        Drawer[NodeDrawer]
        Quiz[QuizMode]
    end

    Upload --> Text --> Gen
    Templates --> Gen
    Gen --> Map
    Map --> Tree
    Map --> Dash
    Map --> Drawer
    Progress --> Tree
    Progress --> Dash
    Progress --> Drawer
    View --> Landing
    View --> Upload
    View --> App
    App --> Tree
    App --> Dash
    UI --> Drawer
    UI --> Quiz
    Quiz -->|recordQuiz| Progress
```

## Modelo de datos — `lib/types.ts`

### `Mastery`

```ts
"locked" | "red" | "amber" | "green"
```

### `QuizQuestion`

```ts
{ id, question, options[], correctIndex, explanation }
```

### `KnowledgeNode`

```ts
{
  id: string
  title: string
  summary: string      // resumen corto (poco usado en UI actual)
  detail: string       // explicación en drawer
  examples: string[]
  level: number        // profundidad en el árbol (0 = raíz)
  deps: string[]       // IDs de prerrequisitos
  questions: QuizQuestion[]
}
```

### `StudyMap`

```ts
{
  id: string
  subject: string
  source: string
  createdAt: number
  nodes: KnowledgeNode[]
}
```

### `NodeProgress` / `ProgressMap`

```ts
NodeProgress = { score: 0-100, mastery: Mastery, attempts: number }
ProgressMap = Record<nodeId, NodeProgress>
```

## Lógica de dominio — `lib/study.ts`

### Generación de mapas

`generateStudyMap({ text, source })`:

1. Concatena `text + source` en minúsculas
2. Puntúa cada plantilla de `templates.ts` por keywords coincidentes (`match[]`)
3. Elige la plantilla con más coincidencias; si ninguna, rota entre plantillas
4. Devuelve un `StudyMap` con nodos de la plantilla elegida

**No hay parsing real de PDF ni llamada a IA.**

### Sistema de mastery

| Función | Regla |
|---------|-------|
| `masteryFromScore(score)` | ≥80 → green, ≥40 → amber, else red |
| `isUnlocked(node, progress)` | Sin deps → true; con deps → todos amber o green |
| `getMastery(nodeId, node, progress)` | Si hay progreso → su mastery; si no → red si unlocked, else locked |

### Desbloqueo

Un nodo se desbloquea cuando **todos** sus prerrequisitos (`deps`) tienen mastery `amber` o `green` (score ≥ 40).

### Estadísticas

`computeStats(map, progress)` devuelve:

- Conteos por mastery (`green`, `amber`, `red`, `locked`)
- `overall`: media de scores (green cuenta como 100)
- `weak`: nodos amber + red (para repaso)

### Layout del grafo

`layoutNodes(nodes)`:

- Agrupa nodos por `level` (filas)
- Espaciado: `colGap=260`, `rowGap=200`, padding `140/120`
- Centra cada fila horizontalmente
- Devuelve `{ positioned, width, height }`

## Plantillas — `lib/templates.ts`

Cinco asignaturas predefinidas:

| Key | Subject | Keywords ejemplo |
|-----|---------|------------------|
| `biologia` | Biología celular | celula, adn, mitocondria… |
| `historia` | Revolución Industrial | historia, revoluc, industrial… |
| `programacion` | Fundamentos de Programación | program, javascript, algoritmo… |
| `matematicas` | Álgebra básica | algebra, ecuación, x, función… |
| `fisica` | Mecánica clásica | fisic, fuerza, velocidad, newton… |

Cada plantilla tiene 7–9 nodos en árbol con `level` y `deps`, y 3 preguntas por nodo.

**Para añadir una asignatura:** crear un `SubjectTemplate` y añadirlo al array `templates`.

## Vistas y navegación

| `view` | Pantalla | Cómo llegar |
|--------|----------|-------------|
| `landing` | Landing | Inicio, reset, click en Logo |
| `upload` | UploadScreen | CTAs "Subir apuntes", "Empezar", "Nuevo mapa" |
| `app` | App principal | Tras generar mapa en upload |

Dentro de `app`, tabs locales en `AppShell`:

| Tab | Componente |
|-----|------------|
| `tree` | SkillTree |
| `dashboard` | Dashboard |

## Capas de la aplicación

```
┌─────────────────────────────────────┐
│  Presentación (components/)         │
│  Landing, SkillTree, Quiz, etc.     │
├─────────────────────────────────────┤
│  Estado (lib/store.tsx)             │
│  React Context + localStorage cada 30s │
├─────────────────────────────────────┤
│  Dominio (lib/study.ts)             │
│  Mastery, stats, layout, generación │
├─────────────────────────────────────┤
│  Datos (lib/templates.ts)           │
│  Plantillas estáticas en memoria    │
└─────────────────────────────────────┘
```

## Metadata y SEO — `app/layout.tsx`

- Título: "Mapa de Estudio — Convierte tus apuntes en conocimiento"
- `lang="es"`
- Iconos adaptativos claro/oscuro
- `colorScheme: light dark`

## Generación con IA

```mermaid
flowchart TD
    Upload[UploadScreen] -->|FormData| API["POST /api/generate-map"]
    API --> Extract[lib/extract-text.ts]
    Extract --> AI[lib/generate-map-ai.ts]
    AI -->|GOOGLE_GENERATIVE_AI_API_KEY| LLM[Gemini gemini-2.0-flash]
    AI -->|sin clave o error| Fallback[generateStudyMap templates]
    LLM --> Validate[lib/schemas.ts Zod + grafo]
    Validate --> Map[StudyMap JSON]
    Map --> Store[store.generate]
```

| Archivo | Rol |
|---------|-----|
| `app/api/generate-map/route.ts` | Endpoint POST (FormData: text, source, file) |
| `lib/extract-text.ts` | Extrae texto de PDF/TXT/MD |
| `lib/generate-map-ai.ts` | Llama Gemini (AI Studio); fallback a plantillas |
| `lib/schemas.ts` | Esquema Zod + validación de grafo acíclico |
| `lib/prompts.ts` | System/user prompts en español |

Variables de entorno: ver `.env.local.example` (`GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL` opcional).

## Autenticación — `lib/auth/index.ts`

| Plugin | Estado | Detalle |
|--------|--------|---------|
| anonymous | ✅ | Usuarios sin registro, datos migrables al vincular |
| emailAndPassword | 🔴 disabled | Podría activarse si se desea |
| emailVerification | ✅ | Via Resend |
| socialProviders (Google) | ✅ | Habilitado si GOOGLE_CLIENT_ID está definido |
| magicLink | ✅ | Enlace mágico por email via Resend |

## Base de datos — `lib/db/`

- **Drizzle ORM** con PostgreSQL
- Conexión lazy (`getDb()`), no falla al importar si falta DATABASE_URL
- Proxy `db` para compatibilidad hacia atrás (lanza error en tiempo de uso)
- Tablas: `user`, `session`, `account`, `verification`, `rateLimit`

## API Routes

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/auth/[...all]` | All | better-auth handler |
| `/api/generate-map` | POST | Generar mapa desde texto/archivo |
| `/api/delete-map` | DELETE | Eliminar mapa por ID |
| `/api/list-maps` | GET | Listar mapas del usuario |
| `/api/load-state` | GET | Cargar estado (con/sin mapId) |
| `/api/validate-answer` | POST | Validación por IA de respuestas de texto |

Los endpoints también tienen versiones Server Action en `lib/actions/` para uso client-side.

## Extensiones futuras

| Feature | Dónde tocar |
|---------|-------------|
| DOCX | `lib/extract-text.ts` + mammoth |
| Más asignaturas | `lib/templates.ts` |
| Tests | Nueva carpeta `tests/` o `e2e/` |

## Alias de imports

```ts
@/components → ./components
@/lib        → ./lib
@/components/ui → ./components/ui
```

Definido en `tsconfig.json` paths y `components.json` aliases.
