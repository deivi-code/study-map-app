# Manual del proyecto — Mapa de Estudio

Documentación de referencia para agentes y desarrolladores que trabajen en este repositorio.

## Qué es esta app

**Mapa de Estudio** es una aplicación web que convierte apuntes en un mapa interactivo de conocimiento. El usuario sube texto o un archivo, se genera un árbol de conceptos con dependencias, y avanza desbloqueando nodos mediante tests de opción múltiple.

- Idioma de la UI: **español** (`lang="es"` en el layout)
- Modo oscuro por defecto, con toggle claro/oscuro
- Sin backend ni autenticación: todo el estado vive en memoria del cliente
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
              NodeDrawer + QuizMode (overlays)
```

1. **landing**: página de marketing con hero, features y CTAs
2. **upload**: formulario de subida + loader simulado
3. **app**: vista principal con pestañas Mapa / Progreso
4. **NodeDrawer**: panel lateral con detalle del concepto
5. **QuizMode**: pantalla completa de test por nodo

## Convenciones al editar

- Usar alias `@/` para imports (`@/components`, `@/lib`)
- Componentes interactivos llevan `"use client"`
- Textos de UI en español
- Animaciones con **Framer Motion**; respetar `prefers-reduced-motion` donde exista (p. ej. `NodeField`)
- Estilos con **Tailwind CSS v4** y variables CSS de shadcn
- No añadir backend ni persistencia salvo que se pida explícitamente
- Mantener la lógica de dominio en `lib/study.ts` y el estado global en `lib/store.tsx`

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
| `lib/templates.ts` | Plantillas de asignaturas (biología, historia, programación) |
| `lib/types.ts` | Tipos TypeScript del dominio |
| `app/globals.css` | Tokens de diseño y tema claro/oscuro |
