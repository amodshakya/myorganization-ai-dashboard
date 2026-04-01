# API Reference

## Base URL

```
http://localhost:3001/api
```

All responses are JSON unless noted otherwise.

## Authentication

No authentication is required in the current version. JWT-based user authentication is planned for a future release.

---

## Endpoints

### Health

#### `GET /health`

Returns service health status.

**Response `200 OK`**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

### Current Generation

#### `GET /api/current`

Returns the latest real-time generation figures for all renewable sources.

**Response `200 OK`**

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "solar":      { "value_mw": 42150.5, "unit": "MW", "source": "MNRE" },
    "wind":       { "value_mw": 18320.0, "unit": "MW", "source": "MNRE" },
    "hydro":      { "value_mw": 46800.0, "unit": "MW", "source": "CEA"  },
    "biomass":    { "value_mw":  8450.0, "unit": "MW", "source": "MNRE" },
    "geothermal": { "value_mw":     0.0, "unit": "MW", "source": "MNRE" },
    "total_mw":   115720.5,
    "renewable_percentage": 43.2
  }
}
```

---

### Historical Data

#### `GET /api/historical`

Returns aggregated historical generation data for trend analysis.

**Query Parameters**

| Parameter | Type   | Default | Description                                  |
|-----------|--------|---------|----------------------------------------------|
| `period`  | string | `7d`    | Time window: `24h`, `7d`, `30d`, `90d`, `1y` |
| `source`  | string | all     | Filter by source: `solar`, `wind`, `hydro`, `biomass` |

**Example**

```
GET /api/historical?period=7d&source=solar
```

**Response `200 OK`**

```json
{
  "period": "7d",
  "source": "solar",
  "data": [
    {
      "timestamp": "2024-01-09T00:00:00.000Z",
      "solar_mw": 38200.0,
      "wind_mw":  17500.0,
      "hydro_mw": 45600.0,
      "biomass_mw": 8100.0,
      "geothermal_mw": 0.0,
      "total_mw": 109400.0,
      "renewable_percentage": 41.8
    }
  ],
  "meta": {
    "count": 168,
    "from": "2024-01-09T00:00:00.000Z",
    "to":   "2024-01-15T23:59:59.000Z"
  }
}
```

---

### Capacity by State

#### `GET /api/capacity`

Returns installed renewable capacity figures, optionally filtered by state or source type.

**Query Parameters**

| Parameter     | Type    | Default | Description                              |
|---------------|---------|---------|------------------------------------------|
| `state`       | string  | all     | Indian state/UT name (URL-encoded)       |
| `source_type` | string  | all     | `solar`, `wind`, `hydro`, `biomass`      |
| `year`        | integer | latest  | Reporting year (e.g. `2023`)             |

**Example**

```
GET /api/capacity?state=Rajasthan&source_type=solar&year=2023
```

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "state": "Rajasthan",
      "source_type": "solar",
      "capacity_mw": 18725.4,
      "year": 2023,
      "data_source": "MNRE",
      "percentage_of_total": 16.2
    }
  ],
  "meta": { "count": 1 }
}
```

---

### State Breakdown

#### `GET /api/states`

Returns a summary of renewable capacity for every Indian state/UT.

**Response `200 OK`**

```json
{
  "data": [
    {
      "state": "Rajasthan",
      "total_capacity_mw": 24500.0,
      "solar_mw": 18725.0,
      "wind_mw":   5200.0,
      "hydro_mw":    575.0,
      "biomass_mw":    0.0
    }
  ],
  "meta": { "count": 36 }
}
```

---

### Data Sources

#### `GET /api/sources`

Returns sync status for all registered upstream data sources.

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "...",
      "name": "MNRE",
      "status": "active",
      "last_updated": "2024-01-15T10:00:00.000Z",
      "next_update": "2024-01-15T11:00:00.000Z",
      "records_count": 14820,
      "error_message": null
    },
    {
      "id": "...",
      "name": "CEA",
      "status": "active",
      "last_updated": "2024-01-15T10:15:00.000Z",
      "next_update": "2024-01-15T10:30:00.000Z",
      "records_count": 8640,
      "error_message": null
    }
  ]
}
```

---

### Server-Sent Events (Real-Time Stream)

#### `GET /api/events`

Opens an SSE stream that pushes live generation updates to the client.

**Headers**

```
Accept: text/event-stream
```

**Event Types**

| Event           | Payload                                         |
|-----------------|-------------------------------------------------|
| `current_data`  | Same shape as `GET /api/current` `.data`        |
| `source_update` | Updated `data_sources` record                   |
| `heartbeat`     | `{ "ts": "<ISO timestamp>" }` (every 30 s)     |

**Example stream**

```
event: current_data
data: {"solar":{"value_mw":42300.0},"wind":{"value_mw":18400.0},...}

event: heartbeat
data: {"ts":"2024-01-15T10:30:30.000Z"}
```

---

## Error Codes

| HTTP Status | Code                  | Meaning                                      |
|-------------|-----------------------|----------------------------------------------|
| 400         | `BAD_REQUEST`         | Missing or invalid query parameter           |
| 404         | `NOT_FOUND`           | Resource does not exist                      |
| 429         | `RATE_LIMIT_EXCEEDED` | Too many requests; retry after window resets |
| 500         | `INTERNAL_ERROR`      | Unexpected server-side error                 |
| 503         | `SERVICE_UNAVAILABLE` | Database or upstream dependency unreachable  |

**Error response shape**

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid period value. Allowed: 24h, 7d, 30d, 90d, 1y",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```
