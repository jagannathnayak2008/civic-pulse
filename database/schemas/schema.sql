-- ============================================================================
-- CivicPulse PostgreSQL + PostGIS Production Database Schema
-- Compatible with Neon PostgreSQL, Supabase, and Amazon RDS PostGIS
-- ============================================================================

-- Enable PostGIS extension for spatial queries (DBSCAN & Polygons)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) PRIMARY KEY DEFAULT ('USR-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6))),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);

-- 2. MUNICIPAL ZONES TABLE (Spatial Boundaries)
CREATE TABLE IF NOT EXISTS municipal_zones (
    zone_id INT PRIMARY KEY,
    zone_code VARCHAR(50) UNIQUE NOT NULL,
    zone_name VARCHAR(150) NOT NULL,
    boundary_geom GEOMETRY(Polygon, 4326),
    responsible_department VARCHAR(150) NOT NULL,
    ward_officer VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_zones_geom ON municipal_zones USING GIST(boundary_geom);

-- 3. MASTER INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS master_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'CP102'
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'POTHOLE_ROAD_DAMAGE',
        'GARBAGE_OVERFLOW',
        'PUBLIC_TOILET_ISSUES',
        'WATERLOGGING',
        'DRAINAGE_WATER_LEAKAGE',
        'BROKEN_STREETLIGHT',
        'OPEN_MANHOLE_HAZARDS',
        'OTHERS'
    )),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW')),
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'AWAITING_CITIZEN_CONFIRMATION',
        'RESOLVED',
        'DISPUTED',
        'CLOSED'
    )),
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address_display TEXT NOT NULL,
    zone_id INT REFERENCES municipal_zones(zone_id),
    zone_name VARCHAR(150) NOT NULL,
    assigned_department VARCHAR(150) NOT NULL,
    
    -- SLA Management
    sla_hours INT NOT NULL,
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    sla_breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Community Aggregations
    report_count INT DEFAULT 1,
    community_upvotes INT DEFAULT 0,
    duplicate_match_confidence DOUBLE PRECISION DEFAULT 0.0,

    -- Explainable AI (JSONB Point Breakdown)
    xai JSONB NOT NULL,
    
    -- Closed-loop Verification (JSONB)
    repair_verification JSONB
);

CREATE INDEX IF NOT EXISTS idx_incidents_geom ON master_incidents USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_incidents_tracking ON master_incidents(tracking_number);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON master_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_zone ON master_incidents(zone_id);

-- 4. CITIZEN INDIVIDUAL COMPLAINTS / REPORTS
CREATE TABLE IF NOT EXISTS citizen_reports (
    id VARCHAR(32) PRIMARY KEY DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
    incident_id UUID REFERENCES master_incidents(id) ON DELETE CASCADE,
    reporter_alias VARCHAR(100) DEFAULT 'Citizen User',
    phone_masked VARCHAR(20),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) DEFAULT 'VIDEO',
    
    -- Audio & NLP
    original_audio_script TEXT,
    detected_language VARCHAR(10),
    translated_english_text TEXT,
    urgency_keywords JSONB,
    
    -- Evidence & pHash
    phash VARCHAR(64),
    evidence_confidence DOUBLE PRECISION,
    evidence_tier VARCHAR(20),
    location_consistency VARCHAR(20),
    image_quality VARCHAR(20),
    flagged_for_human_review BOOLEAN DEFAULT FALSE,
    review_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_geom ON citizen_reports USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_incident ON citizen_reports(incident_id);

-- 5. CRYPTOGRAPHIC AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(32) PRIMARY KEY DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
    incident_id UUID REFERENCES master_incidents(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    cryptographic_hash VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_incident ON audit_logs(incident_id);
