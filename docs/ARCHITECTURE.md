# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser Client                              │
│                    React 18 · TypeScript · Chart.js                     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP / SSE  (port 3000 → nginx)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          nginx (Alpine)                                  │
│  • Serves React SPA static assets                                        │
│  • Reverse-proxies /api/* → backend:3001                                 │
│  • Gzip compression · long-lived asset caching                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP (Docker network)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Node.js Backend (Express)                           │
│                                                                          │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐    │
│  │  REST Router │  │  SSE Emitter   │  │  Background Schedulers   │    │
│  │  /api/*      │  │  /api/events   │  │  MNRE · CEA · Min.Power  │    │
│  └──────┬───────┘  └───────┬────────┘  └───────────┬──────────────┘    │
│         │                  │                        │                    │
│  ┌──────▼──────────────────▼────────────────────────▼──────────────┐   │
│  │                      Service Layer                                │   │
│  │  CurrentGenerationService · HistoricalService · CapacityService  │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│  PostgreSQL 15  │  │     Redis 7          │  │  External APIs       │
│                 │  │                      │  │                      │
│ • generation    │  │ • current data cache │  │ • MNRE API           │
│ • capacity      │  │   (TTL 60 s)         │  │ • CEA API            │
│ • historical    │  │ • rate-limit buckets │  │ • Ministry of Power  │
│ • data_sources  │  │ • SSE pub/sub        │  │   API                │
└─────────────────┘  └─────────────────────┘  └──────────────────────┘
```

---

## Technology Decisions

### Backend – Node.js + Express + TypeScript

Node.js was chosen for its non-blocking I/O model, which is well-suited to the
dashboard's workload: many concurrent SSE clients, periodic HTTP calls to
external government APIs, and lightweight JSON transformation. TypeScript adds
compile-time safety across the service and data layers.

### Frontend – React 18 + TypeScript

React's component model and ecosystem (Chart.js, React-Query) accelerate
development of interactive data-heavy UIs. React 18's concurrent features
(Suspense, streaming) future-proof the rendering pipeline.

### PostgreSQL 15

Relational integrity is important for capacity and historical data. PostgreSQL's
native `JSONB` column type is used for storing raw upstream payloads without
forcing an upfront schema on volatile API responses. The `uuid-ossp` extension
provides RFC 4122 primary keys.

### Redis 7

Redis serves two purposes:
1. **Cache** – `GET /api/current` responses are cached with a 60-second TTL to
   avoid hitting PostgreSQL on every poll from hundreds of dashboard clients.
2. **Pub/Sub** – backend schedulers publish new data events that the SSE
   emitter subscribes to, decoupling data ingestion from client delivery.

### nginx

A thin nginx reverse-proxy in front of the React SPA provides:
- Single-origin for the browser (no CORS complexity)
- Static-asset caching with immutable `Cache-Control` headers
- Gzip compression for JS/CSS bundles

---

## Data Flow

### Real-Time Path

```
External API poll (scheduler)
       │
       ▼
  Fetch & validate
       │
       ▼
  Persist to PostgreSQL
       │
       ├──► Publish to Redis channel "current_update"
       │
       ▼
  SSE Emitter (subscribes to Redis)
       │
       ▼
  Push event to all connected browsers
```

### Historical / Capacity Path

```
Scheduled job (cron)
       │
       ▼
  Bulk fetch from external API
       │
       ▼
  Upsert rows into PostgreSQL
       │
       ▼
  Update data_sources.last_updated + records_count
```

### Request Path (REST)

```
Browser  →  nginx  →  Express Router  →  Service Layer
                                               │
                              ┌────────────────┴──────────────┐
                              │  Redis cache hit?              │
                              │  YES → return cached JSON      │
                              │  NO  → query PostgreSQL        │
                              │         → write to cache       │
                              │         → return JSON          │
                              └────────────────────────────────┘
```

---

## Database Schema

### `renewable_energy_generation`

Stores individual generation readings per source and optionally per state.
High-frequency inserts from real-time scheduler jobs.

| Column        | Type          | Notes                         |
|---------------|---------------|-------------------------------|
| `id`          | UUID PK       | `uuid_generate_v4()`          |
| `source`      | VARCHAR(64)   | solar / wind / hydro / …      |
| `value_mw`    | FLOAT         | Generation in megawatts       |
| `timestamp`   | TIMESTAMPTZ   | Observation time (UTC)        |
| `state`       | VARCHAR(64)   | NULL = national aggregate     |
| `data_source` | VARCHAR(128)  | MNRE / CEA / Ministry_Power   |
| `raw_data`    | JSONB         | Original upstream payload     |
| `created_at`  | TIMESTAMPTZ   | Row insert time               |

### `renewable_capacity`

Installed capacity, updated monthly / quarterly from MNRE reports.

| Column                | Type         | Notes                      |
|-----------------------|--------------|----------------------------|
| `id`                  | UUID PK      |                            |
| `state`               | VARCHAR(64)  | Indian state / UT          |
| `source_type`         | VARCHAR(64)  | solar / wind / hydro / …   |
| `capacity_mw`         | FLOAT        | Nameplate capacity (MW)    |
| `year`                | INTEGER      | Reporting year             |
| `data_source`         | VARCHAR(128) |                            |
| `percentage_of_total` | FLOAT        | Share of national capacity |
| `created_at`          | TIMESTAMPTZ  |                            |

### `historical_data`

Pre-aggregated hourly / daily national totals for the dashboard trend charts.

| Column                 | Type         | Notes            |
|------------------------|--------------|------------------|
| `id`                   | UUID PK      |                  |
| `timestamp`            | TIMESTAMPTZ  | Bucket start     |
| `solar_mw`             | FLOAT        |                  |
| `wind_mw`              | FLOAT        |                  |
| `hydro_mw`             | FLOAT        |                  |
| `biomass_mw`           | FLOAT        |                  |
| `geothermal_mw`        | FLOAT        |                  |
| `total_mw`             | FLOAT        | Sum of all above |
| `renewable_percentage` | FLOAT        | % of total grid  |
| `data_source`          | VARCHAR(128) |                  |
| `created_at`           | TIMESTAMPTZ  |                  |

### `data_sources`

Sync-health registry. One row per upstream system.

| Column          | Type         | Notes                            |
|-----------------|--------------|----------------------------------|
| `id`            | UUID PK      |                                  |
| `name`          | VARCHAR(128) | UNIQUE                           |
| `last_updated`  | TIMESTAMPTZ  | Last successful sync             |
| `status`        | VARCHAR(32)  | active / inactive / error        |
| `next_update`   | TIMESTAMPTZ  | Scheduled next sync              |
| `records_count` | INTEGER      | Total rows ingested from source  |
| `error_message` | TEXT         | Last error (if status = error)   |
| `created_at`    | TIMESTAMPTZ  |                                  |
| `updated_at`    | TIMESTAMPTZ  |                                  |

---

## Caching Strategy

| Data                    | Cache key pattern         | TTL      | Invalidation           |
|-------------------------|---------------------------|----------|------------------------|
| Current generation      | `current:all`             | 60 s     | On scheduler write     |
| Historical (7d)         | `historical:7d`           | 5 min    | TTL expiry             |
| Historical (30d+)       | `historical:30d`          | 30 min   | TTL expiry             |
| Capacity by state       | `capacity:state:<name>`   | 1 h      | TTL expiry             |
| State summary list      | `states:summary`          | 1 h      | TTL expiry             |
| Data-sources status     | `sources:all`             | 30 s     | On scheduler run       |

---

## Deployment Architecture

### Docker Compose (development / staging)

All four services run in a single Compose stack on one host. Suitable for
development, demos, and small deployments.

```
Host machine
  └─ Docker engine
       ├─ postgres   (port 5432)
       ├─ redis      (port 6379)
       ├─ backend    (port 3001)
       └─ frontend   (port 3000 → nginx :80)
```

### Production Recommendations

For production deployments consider:

- **Managed PostgreSQL** (AWS RDS / Azure Database / GCP Cloud SQL) instead of
  the containerised Postgres, for automated backups, PITR, and HA failover.
- **Managed Redis** (ElastiCache / Redis Cloud) for persistence and replication.
- **Container orchestration** (Kubernetes / ECS) to enable horizontal scaling
  of the backend and rolling deployments with zero downtime.
- **CDN** (CloudFront / Cloudflare) in front of the nginx static assets for
  global low-latency delivery.
- **Secrets management** (AWS Secrets Manager / Vault) instead of `.env` files.
