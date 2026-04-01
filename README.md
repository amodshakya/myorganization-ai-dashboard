# India Renewable Energy Dashboard

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
[![CI](https://github.com/myorganization/myorganization-ai-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/myorganization/myorganization-ai-dashboard/actions/workflows/ci.yml)

A real-time dashboard tracking India's renewable energy generation and installed capacity across all states and union territories. Data is sourced from the Ministry of New and Renewable Energy (MNRE), the Central Electricity Authority (CEA), and the Ministry of Power.

---

## Features

- **Live generation data** – Solar, wind, hydro, biomass, and geothermal output updated in real time via Server-Sent Events.
- **State-level breakdown** – Interactive map and table showing installed capacity for each Indian state / UT.
- **Historical trends** – Configurable time windows (24 h → 1 year) with multi-source overlay charts.
- **Data-source health** – At-a-glance status panel for every upstream API integration.
- **Responsive UI** – Works on desktop, tablet, and mobile browsers.
- **Docker-first setup** – Full stack running in one `docker compose up` command.

---

## Screenshots

> _Screenshots will be added after the initial deployment._

| Dashboard Overview | State Map | Historical Trends |
|--------------------|-----------|-------------------|
| _(coming soon)_    | _(coming soon)_ | _(coming soon)_ |

---

## Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Frontend     | React 18, TypeScript, Chart.js     |
| Backend      | Node.js 18, Express, TypeScript    |
| Database     | PostgreSQL 15                      |
| Cache / PubSub | Redis 7                          |
| Web server   | nginx (Alpine)                     |
| Containerisation | Docker, Docker Compose         |
| CI           | GitHub Actions                     |

---

## Quick Start with Docker

```bash
# 1. Clone
git clone https://github.com/myorganization/myorganization-ai-dashboard.git
cd myorganization-ai-dashboard

# 2. Configure environment
cp .env.example .env
# Open .env and set DB_PASSWORD and JWT_SECRET

# 3. Build and start
docker compose up --build

# 4. Open in browser
open http://localhost:3000
```

> First build takes ~3 minutes; subsequent starts are much faster.

For manual installation and advanced configuration see [docs/SETUP.md](docs/SETUP.md).

---

## API Endpoints

| Method | Endpoint             | Description                                 |
|--------|----------------------|---------------------------------------------|
| GET    | `/health`            | Service and dependency health check         |
| GET    | `/api/current`       | Latest real-time generation figures         |
| GET    | `/api/historical`    | Aggregated historical data (`?period=7d`)   |
| GET    | `/api/capacity`      | Installed capacity (`?state=&source_type=`) |
| GET    | `/api/states`        | Capacity summary for all states             |
| GET    | `/api/sources`       | Data-source sync status                     |
| GET    | `/api/events`        | SSE stream for real-time updates            |

Full request/response documentation: [docs/API.md](docs/API.md)

---

## Data Sources

| Organisation | Data Provided | Update Frequency |
|---|---|---|
| [Ministry of New & Renewable Energy (MNRE)](https://mnre.gov.in) | Generation by source, installed capacity | Hourly |
| [Central Electricity Authority (CEA)](https://cea.nic.in) | Grid-level generation, state totals | Every 15 min |
| [Ministry of Power](https://powermin.gov.in) | National energy mix, renewable percentage | Daily |

---

## Project Structure

```
myorganization-ai-dashboard/
├── backend/               # Node.js / Express API
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── services/      # Business logic
│   │   ├── schedulers/    # Background data-fetch jobs
│   │   └── server.ts      # Entry point
│   └── Dockerfile
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx
│   ├── nginx.conf
│   └── Dockerfile
├── database/
│   └── schema/            # SQL migration files
├── docs/
│   ├── API.md             # API reference
│   ├── SETUP.md           # Installation guide
│   └── ARCHITECTURE.md    # System design
├── .env.example
├── .github/workflows/ci.yml
└── docker-compose.yml
```

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Make your changes and ensure `npm run build` passes in both `backend/` and `frontend/`.
3. Open a pull request against `main` with a clear description of the change.

Please follow the existing code style (TypeScript strict mode, ESLint) and keep pull requests focused.

---

## License

This project is licensed under the [MIT License](LICENSE).
