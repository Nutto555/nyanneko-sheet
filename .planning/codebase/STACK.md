# Technology Stack

**Analysis Date:** 2026-04-06

## Languages

**Primary:**
- TypeScript 5.9.3 - Application code, type-safe development
- JavaScript - Build configuration and utilities
- HTML5 - Document markup (`index.html`)

**Secondary:**
- SQL - Database schema definitions in Supabase migrations
- Python - Legacy data processing scripts (seed data generation, Excel parsing)

## Runtime

**Environment:**
- Node.js (version specified in `.nvmrc` or inferred from package.json tooling)

**Package Manager:**
- npm (npm/node package manager)
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- React 19.2.4 - UI framework and component library
- React Router 7.14.0 - Client-side routing
- React DOM 19.2.4 - React rendering to DOM

**Styling:**
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite integration for Tailwind

**Build/Dev:**
- Vite 8.0.1 - Frontend build tool and dev server
- @vitejs/plugin-react 6.0.1 - React plugin for Vite
- TypeScript Compiler (tsc) - Type checking and compilation

**Linting/Formatting:**
- ESLint 9.39.4 - JavaScript/TypeScript linting
- @eslint/js 9.39.4 - ESLint core
- typescript-eslint 8.57.0 - TypeScript support for ESLint
- eslint-plugin-react-hooks 7.0.1 - React hooks linting
- eslint-plugin-react-refresh 0.5.2 - React Fast Refresh linting

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.101.1 - Supabase client SDK for database, auth, and storage operations
- dotenv 17.4.0 - Environment variable loading for development and seeding

**Development:**
- @types/react 19.2.14 - TypeScript types for React
- @types/react-dom 19.2.3 - TypeScript types for React DOM
- @types/node 24.12.0 - TypeScript types for Node.js APIs (for seeding scripts)
- globals 17.4.0 - Global object type definitions for ESLint

## Configuration

**Environment:**
- `.env.local` - Local development configuration (not committed)
- `.env.example` - Template showing required environment variables
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Build:**
- `tsconfig.json` - Root TypeScript configuration with references
- `tsconfig.app.json` - Application-specific TypeScript settings (ES2023, strict mode, React JSX)
- `tsconfig.node.json` - Build tool TypeScript settings
- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint configuration
- `.gitignore` - Git exclusion patterns

**Development:**
- `Makefile` - Build automation commands (install, dev, build, lint, seed, clean)

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5.9+
- Browser with ES2023+ support

**Production:**
- Vercel (deployed on Vercel platform, configured by `vercel.json`)
- Supabase PostgreSQL database
- Supabase Storage for images (character-images bucket)
- Modern browser with ES2023+ support

**Security Headers (Vercel):**
- Content-Security-Policy configured to allow Supabase and Google Fonts
- HSTS (Strict-Transport-Security) enabled
- X-Frame-Options set to DENY
- X-Content-Type-Options set to nosniff
- Cache control for immutable assets (images with 1-year expiry)

---

*Stack analysis: 2026-04-06*
