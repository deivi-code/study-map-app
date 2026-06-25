# Tema y sistema de diseño

## Filosofía visual

- Estética **premium oscura** por defecto; modo claro disponible
- Superficies con transparencia y `backdrop-blur`
- Bordes sutiles (`border-border/60`)
- Gradientes radiales con `color-mix(in oklch, var(--primary) X%, transparent)`
- Esquinas redondeadas generosas (`rounded-2xl`, `rounded-3xl`)
- Sombras suaves en CTAs: `shadow-lg shadow-primary/25`
- Microinteracciones: `hover:scale-[1.01]` o `hover:scale-[1.03]`

## Modo claro / oscuro

| Aspecto | Detalle |
|---------|---------|
| Default | Oscuro (`className="dark"` en `<html>`) |
| Toggle | `ThemeToggle` en `components/brand.tsx` |
| Estado | `theme` en `lib/store.tsx` (`"dark"` \| `"light"`) |
| Mecanismo | Añade/quita clase `dark` en `document.documentElement` |

Variables definidas en `app/globals.css`:
- `:root` → tema claro
- `.dark` → tema oscuro

## Tokens de color (shadcn)

Variables semánticas estándar:

| Token | Uso típico |
|-------|-----------|
| `--background` / `--foreground` | Fondo y texto base |
| `--card` / `--card-foreground` | Tarjetas y paneles |
| `--primary` / `--primary-foreground` | CTAs, acentos, enlaces activos |
| `--secondary` | Fondos de navegación activa |
| `--muted` / `--muted-foreground` | Texto secundario, barras de fondo |
| `--accent` | Hover en botones ghost |
| `--border` / `--input` / `--ring` | Bordes, inputs, focus ring |
| `--destructive` | Errores (poco usado) |
| `--popover` | Popovers (reservado) |
| `--chart-1` … `--chart-5` | Gráficos (reservado) |

En Tailwind se usan como `bg-background`, `text-primary`, `border-border`, etc.

## Colores de dominio (mastery)

Específicos de la app para el progreso de aprendizaje:

| Token | Tailwind | Significado |
|-------|----------|-------------|
| `--mastery-locked` | `mastery-locked` | Nodo bloqueado |
| `--mastery-red` | `mastery-red` | Por aprender (0–39%) |
| `--mastery-amber` | `mastery-amber` | En progreso (40–79%) |
| `--mastery-green` | `mastery-green` | Dominado (≥80%) |

Metadatos en `lib/study.ts` → `masteryMeta`:

```ts
locked → "Bloqueado"
red    → "Por aprender"
amber  → "En progreso"
green  → "Dominado"
```

Cada entrada incluye `label`, `color` (var CSS) y `coach` (mensaje motivacional).

## Tipografía

| Rol | Fuente | Clases habituales |
|-----|--------|-------------------|
| Cuerpo | Geist Sans | `font-sans`, `text-sm`, `leading-relaxed` |
| Mono | Geist Mono | `font-mono` (pasos numerados en landing) |
| Títulos | Geist Sans | `font-semibold`, `tracking-tight` |
| Hero | — | `text-4xl` → `text-6xl`, `text-balance` |

Utilidad custom: `.text-balance` en `globals.css`.

## Radios

```css
--radius: 0.85rem;
--radius-sm … --radius-3xl  /* derivados en @theme */
```

## Patrones de layout

| Patrón | Clases |
|--------|--------|
| Contenedor | `mx-auto max-w-6xl px-4 sm:px-6` o `max-w-5xl`, `max-w-3xl` |
| Header sticky | `sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl` |
| Tarjeta | `rounded-2xl border border-border bg-card/60 p-5` |
| CTA primario | `rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground` |
| CTA secundario | `rounded-xl border border-border bg-card` |
| Badge de estado | `rounded-full px-2.5 py-1 text-xs` + `color-mix` con color mastery |

## Animaciones

| Librería | Uso |
|----------|-----|
| Framer Motion | `motion.div`, `AnimatePresence`, `layoutId`, springs |
| CSS | `tw-animate-css`, `animate-spin` en loaders |
| Canvas | `NodeField` — partículas conectadas (decorativo) |

Transiciones típicas:
- Entrada de vistas: `opacity` + `y` (12–24px)
- Drawer: spring `stiffness: 320, damping: 34`
- Nav activo: `layoutId="nav-active"`

## Iconografía

- **Lucide React** en todo el proyecto
- Tamaños: `size-4` (16px), `size-5` (20px) en botones; `h-4 w-4` equivalente
- En botones icon-only: `aria-label` obligatorio

## Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| `sm:` | Mostrar labels de nav, botón "Empezar" |
| `lg:` | `SkillTree` muestra grafo; debajo lista vertical |
| `md:` | Grids de 2–3 columnas en dashboard y features |

## Z-index

| Capa | z-index |
|------|---------|
| Header | `z-30` |
| NodeDrawer overlay | `z-40` |
| NodeDrawer panel | `z-50` |
| QuizMode | `z-[60]` |

## Ejemplo: aplicar color mastery

```tsx
style={{
  background: `color-mix(in oklch, ${meta.color} 16%, transparent)`,
  color: meta.color,
}}
```

Preferir tokens Tailwind (`bg-mastery-green/15`) cuando el porcentaje es fijo.
