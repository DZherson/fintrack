# FinTrack 💰

> **Toma el control de tus finanzas personales.** Registra, categoriza y visualiza tus gastos e ingresos en un dashboard limpio e intuitivo.

[![CI](https://github.com/DZherson/fintrack/actions/workflows/ci.yml/badge.svg)](https://github.com/DZherson/fintrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

---

## Capturas

| Dashboard principal | Página de transacciones | Metas de ahorro |
|---|---|---|
| [CAPTURA — Dashboard principal] | [CAPTURA — Página de transacciones] | [CAPTURA — Metas de ahorro] |

---

## Demo en vivo

[🔗 Ver demo](https://fintrack-demo.vercel.app) *(actualizar después del deploy)*

---

## Características

- 📊 **Dashboard visual** con gráficos de barras (ingresos vs. gastos, últimos 6 meses) y dona (distribución por categoría)
- 💸 **CRUD de transacciones** con filtros por mes, tipo y categoría, y búsqueda por descripción
- 🎯 **Metas de ahorro** con barra de progreso en tiempo real y días restantes
- 🔐 **Autenticación completa** — credenciales (email + contraseña) y Google OAuth
- 📱 **Diseño responsive** — funciona en móvil, tablet y escritorio
- ⚡ **Skeleton loaders** y estados vacíos con ilustraciones SVG
- 🗂️ **Categorías predeterminadas + personalizadas** (Alimentación, Transporte, Salud, Entretenimiento y más)
- 🔒 **Rutas protegidas** por middleware de autenticación

---

## Stack tecnológico

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5 (strict) |
| Estilos | TailwindCSS + shadcn/ui |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | NextAuth.js v5 |
| Gráficos | Recharts |
| Validación | Zod |
| Testing | Vitest + React Testing Library |
| Deploy | Vercel + Supabase |

---

## Instalación local

### Prerrequisitos

- Node.js 20+
- Una base de datos PostgreSQL (local o en [Neon](https://neon.tech) / [Supabase](https://supabase.com))

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/DZherson/fintrack.git
cd fintrack

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 4. Crear las tablas en la base de datos
npm run db:push

# 5. (Opcional) Cargar datos de demo
npm run db:seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Si corriste el seed, puedes acceder con:
- **Email:** `demo@fintrack.app`
- **Contraseña:** `demo1234`

---

## Estructura del proyecto

```
fintrack/
├── app/                        # Rutas de Next.js (App Router)
│   ├── (auth)/                 # Páginas públicas (login, register)
│   ├── (dashboard)/            # Páginas protegidas con layout de nav
│   └── api/                    # API Routes (backend)
├── components/
│   ├── ui/                     # Componentes de shadcn/ui
│   ├── dashboard/              # Gráficos y cards del dashboard
│   ├── transactions/           # Form, list y filtros de transacciones
│   ├── savings/                # Cards y form de metas de ahorro
│   └── shared/                 # Nav, EmptyState, ErrorDisplay
├── lib/
│   ├── auth.ts                 # Configuración de NextAuth
│   ├── db.ts                   # Singleton de Prisma Client
│   ├── calculations.ts         # Lógica de negocio pura (testeable)
│   ├── validations.ts          # Schemas de Zod
│   └── utils.ts                # Utilidades (cn)
├── hooks/                      # Custom hooks (useToast)
├── types/                      # Tipos TypeScript compartidos
├── prisma/
│   ├── schema.prisma           # Modelos de BD
│   └── seed.ts                 # Datos de demo
├── __tests__/
│   ├── lib/                    # Tests unitarios de calculations.ts
│   └── components/             # Tests de TransactionForm con RTL
└── .github/workflows/ci.yml    # Pipeline de CI (lint + test + build)
```

---

## Tests

```bash
# Correr todos los tests una vez
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch
```

Los tests cubren:
- **Cálculo de balance mensual** — suma correcta de ingresos y gastos, aislamiento por mes
- **Agrupación por categoría** — percentajes, ordenamiento, casos borde (sin transacciones, total 0)
- **Progreso de metas** — suma de abonos, cap al 100%, división por cero
- **TransactionForm** — errores de validación, estado de carga, botón de cancelar

---

## Despliegue

### 1. Base de datos en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan free).
2. Ve a **Project Settings → Database → Connection string → URI**.
3. Copia la `DATABASE_URL` y agrégala a tu `.env`.
4. Ejecuta `pnpm db:push` para crear las tablas.
5. *(Opcional)* Ejecuta `pnpm db:seed` para insertar datos de demo.

### 2. App en Vercel

1. Sube el repositorio a GitHub.
2. Entra a [vercel.com](https://vercel.com) → **New Project → Import Git Repository**.
3. Agrega todas las variables de entorno (ver `.env.example`).
4. Haz clic en **Deploy**. Vercel detecta Next.js automáticamente.

> **Nota:** Para Google OAuth, ve a [console.cloud.google.com](https://console.cloud.google.com), crea un proyecto, configura la pantalla de consentimiento y agrega el URI de redirección:
> `https://TU-DOMINIO.vercel.app/api/auth/callback/google`

---

## Roadmap

- [ ] Exportar transacciones a CSV
- [ ] Notificaciones por correo al superar el presupuesto mensual
- [ ] Modo oscuro
- [ ] Soporte multi-moneda (USD, EUR, MXN…)
- [ ] Gráfico de tendencias de ahorro neto
- [ ] Compartir dashboard en modo público (solo lectura)

---

## Licencia

Distribuido bajo la licencia [MIT](./LICENSE).

---

## Autor

**David Matu**

- GitHub: [@TU_USUARIO](https://github.com/TU_USUARIO)
- LinkedIn: [linkedin.com/in/TU_USUARIO](https://linkedin.com/in/TU_USUARIO)
