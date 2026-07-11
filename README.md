# Maria José Duarte Barrio · Psicología Sanitaria — Proyecto Astro

Web migrada de React + Vite a **Astro** para mejorar el rendimiento y el SEO.

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura

```
src/
├── layouts/
│   └── BaseLayout.astro       # Layout base con SEO, nav y footer
├── pages/
│   ├── index.astro             # Página principal (todas las secciones)
│   └── blog/
│       ├── index.astro         # Listado de artículos
│       └── [slug].astro        # Artículo dinámico
├── styles/
│   └── global.css              # Estilos globales + Tailwind
public/
└── favicon.svg
```

## 🔍 SEO implementado

- **`<title>` y `<meta description>`** únicos por página
- **Open Graph** completo (título, descripción, imagen, tipo)
- **Twitter Card** `summary_large_image`
- **`<link rel="canonical">`** en cada página
- **Schema.org JSON-LD**:
  - `MedicalBusiness` en la home (nombre, dirección, teléfono, horarios)
  - `BlogPosting` en cada artículo (autor, fecha, imagen, publisher)
  - `FAQPage` con markup semántico `<details>` en la sección de preguntas
- **`lang="es"`** en el `<html>`
- **`<time datetime="">`** en fechas de blog
- **`loading="lazy"` / `loading="eager"`** en imágenes según prioridad
- **`width` y `height`** en todas las imágenes (evita CLS)
- **`alt` descriptivo** en todas las imágenes
- **`rel="canonical"`** automático desde `Astro.url.href`
- **Sitemap**: instalar `@astrojs/sitemap` y añadir a `astro.config.mjs`

## ➕ Añadir nuevo artículo de blog

1. Añade el objeto del post al array `POSTS` en `src/pages/blog/index.astro`
2. Añade el mismo objeto (con `content`) al array `POSTS` en `src/pages/blog/[slug].astro`
3. ¡Listo! Astro generará la ruta estática automáticamente.

## 📦 Dependencias

| Paquete | Uso |
|---|---|
| `astro` | Framework |
| `@astrojs/tailwind` | Integración Tailwind |
| `tailwindcss` | Utilidades CSS |

> Sin React, sin Motion, sin Radix, sin MUI. Todo HTML semántico + CSS + JS vanilla mínimo.

## 🌐 Deploy

Funciona en **Vercel**, **Netlify**, **Cloudflare Pages** y cualquier hosting estático.
Exporta HTML/CSS/JS estático por defecto — ideal para SEO y rendimiento.
