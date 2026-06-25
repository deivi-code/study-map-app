# Tecnologías

## Stack principal

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16.2.6 | Framework React con App Router |
| **React** | 19 | UI declarativa |
| **TypeScript** | 5.7.3 | Tipado estático |
| **Tailwind CSS** | 4.2.0 | Utilidades CSS |
| **pnpm** | — | Gestor de paquetes |

## Dependencias de UI y estilo

| Paquete | Uso en el proyecto |
|---------|-------------------|
| **shadcn** (`^4.8.0`) | Sistema de componentes; estilo `base-nova` |
| **@base-ui/react** | Primitivos accesibles (p. ej. `Button`) |
| **class-variance-authority** | Variantes de componentes (`buttonVariants`) |
| **clsx** + **tailwind-merge** | Utilidad `cn()` en `lib/utils.ts` |
| **tw-animate-css** | Animaciones CSS importadas en `globals.css` |
| **lucide-react** | Iconografía |
| **framer-motion** | Animaciones de entrada/salida, transiciones, microinteracciones |

## Analytics

- **@vercel/analytics**: solo en producción (`NODE_ENV === 'production'`) en `app/layout.tsx`

## Configuración relevante

### `components.json` (shadcn)

```json
{
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": { "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

### `tsconfig.json`

- Path alias: `@/*` → raíz del proyecto
- `strict: true`, `jsx: "react-jsx"`
- Plugin de Next.js para tipos de rutas

### `next.config.mjs`

- `typescript.ignoreBuildErrors: true` — el build no falla por errores TS
- `images.unoptimized: true` — imágenes sin optimización de Next

### PostCSS

- `@tailwindcss/postcss` en `postcss.config.mjs` para Tailwind v4

## Fuentes

Definidas en `app/layout.tsx` con `next/font/google`:

- **Geist** → variable `--font-geist-sans`
- **Geist Mono** → variable `--font-geist-mono`

Mapeadas en `globals.css` como `--font-sans` y `--font-mono`.

## Patrones de código

### Server vs Client Components

- `app/layout.tsx` y `app/page.tsx`: Server Components
- Todo en `components/` y `lib/store.tsx`: Client Components (`"use client"`)

### Imports

```tsx
import { useStudy } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

### Estilos

- Tailwind v4 con `@import 'tailwindcss'` en `globals.css`
- Variables CSS para tema (no colores hardcodeados salvo en SVG/canvas)
- Formato de color: **OKLCH** en variables CSS
- Clase `dark` en `<html>` controla el tema oscuro

## Lo que NO usa el proyecto

- Base de datos
- API routes / Server Actions para datos
- Autenticación
- Librerías de gráficos (charts son SVG manual)
- React Query, Zustand, Redux (estado con React Context)
- Tests automatizados (no hay suite configurada)

## Añadir componentes shadcn

El proyecto está configurado para shadcn v4. Para añadir componentes:

```bash
pnpm dlx shadcn@latest add <componente>
```

Los componentes van a `components/ui/`.
