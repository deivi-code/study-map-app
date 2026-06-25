# Instrucciones para agentes — Mapa de Estudio

Antes de modificar este proyecto, lee la documentación en [`docs/`](./docs/README.md).

## Resumen ejecutivo

App Next.js 16 + React 19 que transforma apuntes en un **árbol de conocimiento interactivo** con tests y progreso por nodos. Todo es client-side; la generación usa plantillas locales, no IA real.

## Documentación

| Archivo | Cuándo consultarlo |
|---------|-------------------|
| [docs/README.md](./docs/README.md) | Visión general y convenciones |
| [docs/TECHNOLOGIES.md](./docs/TECHNOLOGIES.md) | Stack, dependencias, config |
| [docs/THEME.md](./docs/THEME.md) | Colores, tipografía, patrones UI |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | Componentes y API del store |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Estructura, tipos, flujo de datos |

## Reglas críticas

1. **UI en español** — todos los textos visibles al usuario
2. **Estado en `lib/store.tsx`** — no introducir Redux/Zustand sin pedirlo
3. **Lógica de negocio en `lib/study.ts`** — mastery, stats, layout, generación
4. **Tema oscuro por defecto** — usar variables CSS (`--primary`, `--mastery-*`), no colores arbitrarios
5. **Client components** — `"use client"` en componentes con hooks/eventos
6. **Imports con `@/`** — `@/components`, `@/lib`
7. **No añadir backend** salvo solicitud explícita
8. **Minimizar scope** — cambios focalizados, sin over-engineering

## Archivos que más se tocan

```
app/page.tsx          → Entry point
lib/store.tsx         → Estado global (view, map, progress, theme)
lib/study.ts          → Reglas de mastery y generación
lib/templates.ts      → Contenido de asignaturas
components/app-shell.tsx → Navegación entre vistas
components/skill-tree.tsx → Grafo principal
```

## Comandos

```bash
pnpm dev    # desarrollo
pnpm build  # producción
pnpm lint   # linting
```
