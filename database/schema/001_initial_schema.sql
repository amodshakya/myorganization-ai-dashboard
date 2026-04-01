-- India Renewable Energy Dashboard - Initial Database Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Table: renewable_energy_generation
-- Stores real-time and near-real-time generation readings per source.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS renewable_energy_generation (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    source      VARCHAR(64) NOT NULL,          -- e.g. solar, wind, hydro, biomass
    value_mw    FLOAT       NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL,
    state       VARCHAR(64),                   -- Indian state/UT, NULL = national
    data_source VARCHAR(128) NOT NULL,         -- originating API / system
    raw_data    JSONB,                         -- full original payload
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_source     ON renewable_energy_generation (source);
CREATE INDEX IF NOT EXISTS idx_reg_timestamp  ON renewable_energy_generation (timestamp);
CREATE INDEX IF NOT EXISTS idx_reg_state      ON renewable_energy_generation (state);
CREATE INDEX IF NOT EXISTS idx_reg_datasource ON renewable_energy_generation (data_source);

-- ---------------------------------------------------------------------------
-- Table: renewable_capacity
-- Installed capacity figures, updated periodically (monthly / quarterly).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS renewable_capacity (
    id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    state               VARCHAR(64)  NOT NULL,
    source_type         VARCHAR(64)  NOT NULL,  -- solar, wind, hydro, biomass, geothermal
    capacity_mw         FLOAT        NOT NULL,
    year                INTEGER      NOT NULL,
    data_source         VARCHAR(128) NOT NULL,
    percentage_of_total FLOAT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rc_state       ON renewable_capacity (state);
CREATE INDEX IF NOT EXISTS idx_rc_source_type ON renewable_capacity (source_type);
CREATE INDEX IF NOT EXISTS idx_rc_year        ON renewable_capacity (year);

-- ---------------------------------------------------------------------------
-- Table: historical_data
-- Hourly / daily aggregated national totals used for trend charts.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historical_data (
    id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp            TIMESTAMPTZ  NOT NULL,
    solar_mw             FLOAT        NOT NULL DEFAULT 0,
    wind_mw              FLOAT        NOT NULL DEFAULT 0,
    hydro_mw             FLOAT        NOT NULL DEFAULT 0,
    biomass_mw           FLOAT        NOT NULL DEFAULT 0,
    geothermal_mw        FLOAT        NOT NULL DEFAULT 0,
    total_mw             FLOAT        NOT NULL,
    renewable_percentage FLOAT,
    data_source          VARCHAR(128) NOT NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hd_timestamp   ON historical_data (timestamp);
CREATE INDEX IF NOT EXISTS idx_hd_datasource  ON historical_data (data_source);

-- ---------------------------------------------------------------------------
-- Table: data_sources
-- Registry of upstream data sources and their sync health.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(128) UNIQUE NOT NULL,
    last_updated  TIMESTAMPTZ,
    status        VARCHAR(32)  NOT NULL DEFAULT 'inactive',  -- active | inactive | error
    next_update   TIMESTAMPTZ,
    records_count INTEGER      NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ds_name   ON data_sources (name);
CREATE INDEX IF NOT EXISTS idx_ds_status ON data_sources (status);

-- ---------------------------------------------------------------------------
-- Seed: register known upstream data sources
-- ---------------------------------------------------------------------------
INSERT INTO data_sources (name, status) VALUES
    ('MNRE',            'inactive'),
    ('CEA',             'inactive'),
    ('Ministry_Power',  'inactive')
ON CONFLICT (name) DO NOTHING;
