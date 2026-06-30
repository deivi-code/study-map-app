# Manual del proyecto — Mapa de Estudio

Documentación de referencia para agentes y desarrolladores que trabajen en este repositorio.

## Qué es esta app

**Mapa de Estudio** es una aplicación web que convierte apuntes en un mapa interactivo de conocimiento. El usuario sube texto o un archivo, se genera un árbol de conceptos con dependencias, y avanza desbloqueando nodos mediante tests de opción múltiple.

- Idioma de la UI: **español** (`lang="es"` en el layout)
- Modo oscuro por defecto, con toggle claro/oscuro
- Backend con better-auth + Drizzle ORM + PostgreSQL para cuentas, sesiones y persistencia
- Los usuarios anónimos pueden usar la app sin registro; al vincular cuenta se migran datos
- La generación de mapas es con IA (Gemini) con fallback a plantillas locales

## Índice de documentos

| Documento | Contenido |
|-----------|-----------|
| [TECHNOLOGIES.md](./TECHNOLOGIES.md) | Stack, dependencias, scripts, configuración |
| [THEME.md](./THEME.md) | Sistema de diseño, colores, tipografía, patrones visuales |
| [COMPONENTS.md](./COMPONENTS.md) | Catálogo de componentes, props, responsabilidades |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Estructura de carpetas, flujo de datos, tipos, lógica de negocio |

## Flujo de la aplicación (resumen)

```
landing → upload → app (tree | dashboard)
                      ↓
              NodeDrawer + LessonMode (overlays)
```

1. **landing**: página de marketing con hero, features y CTAs
2. **upload**: formulario de subida + loader simulado
3. **app**: vista principal con pestañas Mapa / Progreso
4. **NodeDrawer**: panel lateral con detalle del concepto
5. **LessonMode**: pantalla completa de test por nodo (choice + text + theory)

## Convenciones al editar

- Usar alias `@/` para imports (`@/components`, `@/lib`)
- Componentes interactivos llevan `"use client"`
- Textos de UI en español
- Animaciones con **Framer Motion**; respetar `prefers-reduced-motion` donde exista (p. ej. `NodeField`)
- Estilos con **Tailwind CSS v4** y variables CSS de shadcn
- Excepciones en `catch` se devuelven como `{ error }` desde Server Actions, no se lanzan
- Mantener la lógica de dominio en `lib/study.ts` y el estado global en `lib/store.tsx`
- Lógica de autenticación en `lib/auth/`, esquemas DB en `lib/db/`

## Comandos

```bash
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción
pnpm start    # servir build
pnpm lint     # ESLint
```

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `app/page.tsx` | Punto de entrada: `StudyProvider` + `AppShell` |
| `lib/store.tsx` | Estado global (vistas, mapa, progreso, tema) |
| `lib/study.ts` | Lógica: generación, mastery, layout, estadísticas |
| `lib/templates.ts` | Plantillas de asignaturas (biología, historia, programación, mates, física) |
| `lib/types.ts` | Tipos TypeScript del dominio |
| `lib/db/index.ts` | Conexión a PostgreSQL con Drizzle ORM (lazy-init) |
| `lib/auth/index.ts` | Configuración de better-auth (anon, email, Google, magic link) |
| `lib/theme-context.tsx` | Toggle claro/oscuro con persistencia localStorage |
| `lib/answer-check.ts` | Validación de respuestas de texto (tokens) |
| `components/error-boundary.tsx` | Error boundary global con reintento |
| `components/loading-skeleton.tsx` | Esqueleto de carga compartido entre vistas |
| `app/globals.css` | Tokens de diseño y tema claro/oscuro |
