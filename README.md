# Maria José Duarte Barrio · Health Psychology — Astro Project

Website migrated from React + Vite to **Astro** for enhanced performance and SEO.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Local development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
api/
└── contact.js                 # Vercel serverless function (email dispatch via Resend)
src/
├── layouts/
│   └── BaseLayout.astro       # Base layout with SEO, navigation, and footer
├── pages/
│   ├── index.astro            # Homepage (all main sections & contact form)
│   ├── sobre-mi.astro         # About me page
│   ├── terapias.astro         # Therapy details page
│   └── blog/
│       ├── index.astro        # Blog post listing
│       └── [slug].astro       # Dynamic blog post route
├── styles/
│   └── global.css             # Global styles + Tailwind CSS
public/
└── favicon.svg
```

## 🔍 SEO Implementation

- **Unique `<title>` and `<meta description>`** per page
- Complete **Open Graph** tags (title, description, image, type)
- **Twitter Card** `summary_large_image`
- **`<link rel="canonical">`** on every page
- **Schema.org JSON-LD**:
  - `MedicalBusiness` on homepage (name, address, telephone, hours)
  - `Service` on therapy pages
  - `BlogPosting` on each article (author, date, image, publisher)
  - `FAQPage` with semantic `<details>` markup in the FAQ section
- **`lang="es"`** on `<html>`
- **`<time datetime="">`** for blog publication dates
- **`loading="lazy"` / `loading="eager"`** image loading based on priority
- **`width` and `height`** attributes on images to prevent Layout Shifts (CLS)
- **Descriptive `alt`** tags on all images
- Automatic **`rel="canonical"`** from `Astro.url.href`
- **Sitemap**: Install `@astrojs/sitemap` and enable in `astro.config.mjs`

## ➕ Adding a New Blog Post

1. Add the post object to the `POSTS` array in `src/pages/blog/index.astro`
2. Add the corresponding object (including `content`) to the `POSTS` array in `src/pages/blog/[slug].astro`
3. That's it! Astro will generate the static route automatically during build.

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `astro` | Static site framework |
| `@astrojs/tailwind` | Tailwind CSS integration |
| `tailwindcss` | Utility-first CSS |
| `resend` | Transactional email delivery API |

> Zero React, zero Motion, zero Radix, zero heavy UI frameworks. Pure semantic HTML + CSS + minimal vanilla JS.

## ✉️ Contact Form (Resend + Cloudflare Pages / Vercel Functions)

The form automatically sends two emails using the serverless function in `functions/api/contact.js` (for Cloudflare Pages) or `api/contact.js` (for Vercel):
1. Notification to the psychologist containing all patient details and direct links to reply by email or WhatsApp.
2. Automated confirmation email to the patient acknowledging receipt.

### Required Environment Variables in Cloudflare Pages / Vercel:

Configure in **Cloudflare Pages → Project Settings → Environment Variables** (or Vercel):

| Variable | Description | Example |
|---|---|---|
| `RESEND_API_KEY` | Resend API Key (free tier includes up to 3,000 emails/month) | `re_123456789...` |
| `CONTACT_EMAIL_TO` | Email address where the psychologist receives inquiries | `contacto@mariajoseduartepsicologa.site` |
| `CONTACT_EMAIL_FROM` | Verified sender email address in Resend | `Maria José Duarte <contacto@mariajoseduartepsicologa.site>` |

*Note: During local development (`npm run dev`), if `RESEND_API_KEY` is not set, the form runs in simulation mode to allow testing the UI and interactions without errors.*

## 🌐 Deployment

Ready for deployment on **Vercel**, **Netlify**, **Cloudflare Pages**, or any static hosting service.
Builds static HTML/CSS/JS by default for optimal performance and SEO.
