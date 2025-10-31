# Mafia (Clean‑Room) Starter — Next.js + NestJS + Postgres + Redis

A clean-room, legally safe starter kit for a Mafia‑like social RPG. This includes a Next.js frontend, a NestJS API, Postgres schema, Redis cache, and Docker Compose for local dev and staged deployment.

> **Note:** No original Zynga code/assets/trademarks used. All mechanics & names are generic placeholders. Replace any sample text/theme before launch.

---

## What’s inside

- **web/** — Next.js (App Router) with Tailwind, auth stub, dashboard, and client calls.
- **api/** — NestJS with minimal modules: `auth`, `users`, `stats`, `jobs`, `pvp`, `store`, `properties`, `clans`.
- **db** — Postgres schema (`schema.sql`) and seed data (`seed.sql`).
- **docker-compose.yml** — Spins up Postgres, Redis, API, and Web in one command.
- **.github/workflows/ci.yml** — Basic CI (install, build, lint) for both workspaces.
- **.env.example** — Copy to `.env` and `.env.api` as needed.

---

## Quick start (Docker)

```bash
# 1) copy envs
cp .env.example .env
cp .env.example .env.api
# 2) boot everything
docker compose up --build
# API on http://localhost:4000
# Web on http://localhost:3000
```

Initialize DB once containers are up:

```bash
# in a new shell, seed DB
docker compose exec db psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-mafia} -f /docker-entrypoint-initdb.d/seed.sql
```

If `seed.sql` already ran (init scripts), you can skip the manual step.

---

## Environment variables

Top‑level `.env` is read by `docker-compose.yml`.

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mafia
POSTGRES_PORT=5432

REDIS_PORT=6379

# JWT for API
JWT_SECRET=change-me-please-32chars

# Public/Dev
NEXT_PUBLIC_API_URL=http://localhost:4000
```

API also reads `.env.api` (mounted to API container) to keep secrets separate.

```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@db:5432/mafia
REDIS_URL=redis://cache:6379
JWT_SECRET=change-me-please-32chars
```

---

## Basic API surface

- `GET /health` — liveness
- `POST /auth/dev-login` — development login (email only) → `{token}`
- `GET /me` — current user profile
- `GET /me/stats` — derived stats (energy, stamina regen)
- `POST /jobs/:id/run` — execute a job
- `POST /properties/:id/claim` — claim idle income
- `POST /pvp/fight/:opponentId` — naive PVP simulation (server authoritative)
- `GET /store` / `POST /store/purchase` — mock store endpoints
- `POST /clans/:id/join` — join a clan

These are intentionally minimal—extend as you build.

---

## Local dev without Docker (optional)

- Install and run **api**:
  ```bash
  cd api
  cp ../.env.example .env.api
  npm i
  npm run start:dev
  ```

- Install and run **web**:
  ```bash
  cd web
  npm i
  npm run dev
  ```

You’ll need Postgres & Redis locally and correct envs.

---

## License and IP

This starter is provided as a clean-room template. You are responsible for replacing sample names/art and ensuring you don’t use any third‑party assets or trademarks without permission.


---

## Add-ons in this build

### Admin / Live-Ops (YAML)
- Drop YAML files in `config/events/`.
- Endpoints: `GET /admin/liveops/events`, `GET /admin/liveops/active`, `POST /admin/liveops/reload`.
- Web admin at `/admin` to preview current + active events.

### Stripe
- `POST /stripe/create-checkout-session` to start checkout.
- Webhook at `POST /stripe/webhook` (requires raw body). Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.

### Email Magic Links
- `POST /auth/request-magic` → sends link via **Resend** or **SendGrid** (configure env).
- `POST /auth/consume-magic` → returns JWT; web page at `/login/magic` consumes and stores it.
- Dev-only `POST /auth/dev-login` remains for convenience.

### Rate limits, Anti-bot, Telemetry
- Simple Redis-backed rate limiting middleware (env: `RATE_LIMIT`, `RATE_LIMIT_WINDOW`).
- Turnstile verification endpoint: `POST /antibot/turnstile-verify` (set `TURNSTILE_SECRET`).
- Prometheus metrics at `GET /metrics`.
- OpenTelemetry auto-instrumentation bootstrap (set `OTEL_DEBUG=1` to troubleshoot).

### Deployment Presets
- **Fly.io**: `fly.toml` (API).
- **Vercel**: `vercel.json` (Web).
- **Render**: `render.yaml` (API + Postgres/Redis notes).
- **Railway**: `railway.json` (API + plugins).
- **Supabase**: see `docs/SUPABASE.md` to use their Postgres.

---

## Minimal configuration to test
Set in `.env` and `.env.api`:
```
PUBLIC_WEB_URL=http://localhost:3000
JWT_SECRET=change-me-please-32chars
DATABASE_URL=postgresql://postgres:postgres@db:5432/mafia
REDIS_URL=redis://cache:6379
# Optional: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY or SENDGRID_API_KEY
```
