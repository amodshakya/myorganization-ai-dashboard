-- Migration: 001_initial_schema.sql
-- Indian Renewable Energy Dashboard – initial database schema

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM types ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE energy_source AS ENUM ('solar', 'wind', 'hydro', 'biomass', 'geothermal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE datasource_status AS ENUM ('active', 'inactive', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── renewable_energy_generation ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewable_energy_generation (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  source         energy_source NOT NULL,
  value_mw       FLOAT         NOT NULL,
  timestamp      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  state          VARCHAR(100),
  data_source    VARCHAR(100)  NOT NULL,
  raw_data       JSONB,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gen_source    ON renewable_energy_generation (source);
CREATE INDEX IF NOT EXISTS idx_gen_timestamp ON renewable_energy_generation (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gen_state     ON renewable_energy_generation (state);
CREATE INDEX IF NOT EXISTS idx_gen_datasrc   ON renewable_energy_generation (data_source);

-- ─── renewable_capacity ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewable_capacity (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  state               VARCHAR(100)  NOT NULL,
  source_type         energy_source NOT NULL,
  capacity_mw         FLOAT         NOT NULL,
  year                INTEGER       NOT NULL,
  data_source         VARCHAR(100)  NOT NULL,
  percentage_of_total FLOAT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cap_state      ON renewable_capacity (state);
CREATE INDEX IF NOT EXISTS idx_cap_sourcetype ON renewable_capacity (source_type);
CREATE INDEX IF NOT EXISTS idx_cap_year       ON renewable_capacity (year);

-- ─── historical_data ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historical_data (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp            TIMESTAMPTZ NOT NULL,
  solar_mw             FLOAT       NOT NULL DEFAULT 0,
  wind_mw              FLOAT       NOT NULL DEFAULT 0,
  hydro_mw             FLOAT       NOT NULL DEFAULT 0,
  biomass_mw           FLOAT       NOT NULL DEFAULT 0,
  geothermal_mw        FLOAT       NOT NULL DEFAULT 0,
  total_mw             FLOAT       NOT NULL,
  renewable_percentage FLOAT       NOT NULL,
  data_source          VARCHAR(100) NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hist_timestamp  ON historical_data (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hist_datasource ON historical_data (data_source);

-- ─── data_sources ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_sources (
  id            UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)      NOT NULL UNIQUE,
  last_updated  TIMESTAMPTZ,
  status        datasource_status NOT NULL DEFAULT 'inactive',
  next_update   TIMESTAMPTZ,
  records_count INTEGER           NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ds_name   ON data_sources (name);
CREATE INDEX IF NOT EXISTS idx_ds_status ON data_sources (status);

-- ─── Seed data_sources rows ──────────────────────────────────────────────────
INSERT INTO data_sources (name, status) VALUES
  ('mnre',             'inactive'),
  ('cea',              'inactive'),
  ('ministry_of_power','inactive')
ON CONFLICT (name) DO NOTHING;
