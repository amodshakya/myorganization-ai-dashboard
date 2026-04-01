# Setup Guide

## Prerequisites

| Tool            | Minimum version | Notes                              |
|-----------------|-----------------|------------------------------------|
| Node.js         | 18.x            | LTS recommended                    |
| npm             | 9.x             | Bundled with Node.js 18            |
| Docker          | 24.x            | For containerised setup            |
| Docker Compose  | 2.x             | Included with Docker Desktop       |
| PostgreSQL      | 15.x            | Only for manual setup              |
| Redis           | 7.x             | Only for manual setup              |

---

## Quick Start with Docker Compose

This is the recommended path. Docker Compose wires up PostgreSQL, Redis, the
Node.js backend, and the React frontend in a single command.

```bash
# 1. Clone the repository
git clone https://github.com/myorganization/myorganization-ai-dashboard.git
cd myorganization-ai-dashboard

# 2. Create your environment file
cp .env.example .env
# Edit .env and set DB_PASSWORD and JWT_SECRET to strong values

# 3. Start all services (first run builds images – takes ~3 minutes)
docker compose up --build

# 4. Verify everything is running
docker compose ps
```

The dashboard is now accessible at:

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:3001/health |
| Postgres  | localhost:5432               |
| Redis     | localhost:6379               |

### Stopping the stack

```bash
docker compose down            # stop containers, keep volumes
docker compose down -v         # stop containers and delete volumes
```

---

## Manual Installation

Use this approach when you want to run services individually, for example
during active development.

### 1. Start infrastructure services

```bash
# PostgreSQL
docker run -d \
  --name re-postgres \
  -e POSTGRES_DB=renewable_energy \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d \
  --name re-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 2. Apply database schema

```bash
psql -h localhost -U postgres -d renewable_energy \
  -f database/schema/001_initial_schema.sql
```

### 3. Backend

```bash
cd backend
cp ../.env.example .env      # or copy and adjust manually
npm ci
npm run build
npm start
# Development hot-reload:
# npm run dev
```

The API server listens on `http://localhost:3001`.

### 4. Frontend

```bash
cd frontend
npm ci
REACT_APP_API_URL=http://localhost:3001/api \
REACT_APP_SSE_URL=http://localhost:3001/api/events \
npm start
```

The development server starts at `http://localhost:3000`.

---

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables before
starting any service.

### Required

| Variable       | Description                         | Example           |
|----------------|-------------------------------------|-------------------|
| `DB_HOST`      | PostgreSQL hostname                 | `localhost`       |
| `DB_PORT`      | PostgreSQL port                     | `5432`            |
| `DB_NAME`      | Database name                       | `renewable_energy`|
| `DB_USER`      | Database user                       | `postgres`        |
| `DB_PASSWORD`  | Database password                   | `s3cr3t`          |
| `REDIS_URL`    | Redis connection string             | `redis://localhost:6379` |
| `JWT_SECRET`   | Secret key for future JWT signing   | 32+ random chars  |

### Optional – API integration

| Variable                  | Description                                 |
|---------------------------|---------------------------------------------|
| `MNRE_API_KEY`            | API key for MNRE data feed                  |
| `MNRE_API_BASE_URL`       | Base URL for the MNRE API                   |
| `CEA_API_KEY`             | API key for CEA data feed                   |
| `CEA_API_BASE_URL`        | Base URL for the CEA API                    |
| `MINISTRY_POWER_API_KEY`  | API key for Ministry of Power data feed     |
| `MINISTRY_POWER_BASE_URL` | Base URL for the Ministry of Power API      |

### Scheduler intervals

| Variable                | Default | Description                             |
|-------------------------|---------|-----------------------------------------|
| `MNRE_FETCH_INTERVAL`   | `60`    | Minutes between MNRE sync jobs          |
| `CEA_FETCH_INTERVAL`    | `15`    | Minutes between CEA sync jobs           |
| `MINISTRY_FETCH_INTERVAL`| `1440` | Minutes between Ministry of Power syncs |

---

## Troubleshooting

### `docker compose up` fails on "port already in use"

A local Postgres or Redis instance is occupying the default ports.
Either stop the conflicting service or change the host-side port mapping in
`docker-compose.yml` (e.g. `"15432:5432"`).

### Backend exits with `ECONNREFUSED` to Postgres

The `depends_on` healthcheck ensures Postgres is ready before the backend
starts. If it still fails, increase the `retries` value in `docker-compose.yml`
or check that `DB_PASSWORD` in your `.env` matches `POSTGRES_PASSWORD`.

### Frontend shows a blank page

1. Confirm the backend is running: `curl http://localhost:3001/health`
2. Check the browser console for network errors.
3. Ensure `REACT_APP_API_URL` is reachable from the browser (not the Docker
   network hostname).

### Database schema not applied

If you started Postgres with an existing volume the init scripts are skipped.
Delete the volume first:

```bash
docker compose down -v
docker compose up --build
```

### Logs

```bash
# All services
docker compose logs -f

# Individual service
docker compose logs -f backend
docker compose logs -f frontend
```

For the manual setup, backend logs are written to `backend/logs/`.
