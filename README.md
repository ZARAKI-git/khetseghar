# KhetSeGhar — Farm Fresh to Your Doorstep

> A direct-to-consumer marketplace connecting Indian farmers with buyers — set your own prices, chat with farmers, and get farm-fresh produce delivered home.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
</p>

## Overview

KhetSeGhar (*"from the farm to the home"*) is a two-sided marketplace that removes the
middleman between farmers and buyers. Farmers list their crops and manage orders from a
dedicated dashboard; buyers browse listings, negotiate via chat, and check out for
doorstep delivery. The app is multilingual and role-aware — farmers and buyers each get a
tailored experience.

## Features

- **Two-sided roles** — distinct farmer and buyer experiences from a shared codebase.
- **Listings & browse** — farmers create listings; buyers search and explore produce.
- **Farmer dashboard** — manage listings and incoming orders.
- **Messaging** — buyers and farmers chat directly to agree on price and details.
- **Checkout & orders** — order placement with Razorpay payment integration.
- **Internationalization** — multi-language UI via `next-intl`.
- **Polished UI** — accessible component system built on Radix UI + shadcn-style primitives.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, `class-variance-authority`, `tailwind-merge` |
| UI primitives | Radix UI, Lucide icons, Sonner, Vaul, Embla Carousel |
| Backend | Supabase (Postgres, Auth) via `@supabase/ssr` |
| Forms & validation | React Hook Form, Zod |
| Payments | Razorpay |
| i18n | next-intl |
| Data fetching | SWR |
| Analytics | Vercel Analytics |

## Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended for Next.js 16)
- A Supabase project
- Razorpay account/keys for checkout

### Installation

```bash
git clone https://github.com/ZARAKI-git/khetseghar.git
cd khetseghar
npm install
```

### Environment

Create `.env.local` with at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Run

```bash
npm run dev      # start the dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # lint
```

## Project Structure

```
app/          App Router routes (browse, listing, farmers, dashboard,
              checkout, orders, auth, api, …)
components/   Reusable UI components
hooks/        Custom React hooks
lib/          Supabase clients and helpers
messages/     i18n translation files
middleware.ts Auth/session + locale middleware
```

## Deployment

Configured for [Netlify](https://www.netlify.com) (see `netlify.toml` and
`@netlify/plugin-nextjs`). Set the environment variables above in your Netlify site
settings before deploying.

## License

Proprietary — all rights reserved.
