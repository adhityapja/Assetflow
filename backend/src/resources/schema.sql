-- ============================================================
--  AssetFlow Enterprise — PostgreSQL Schema
--  Target DB : assetflow
--  Compatible : PostgreSQL 14+ / Spring Data JPA (EnumType.STRING)
--  Hibernate ddl-auto : validate (recommended for production)
-- ============================================================

-- ----------------------------------------------------------------
-- 0.  Safety: Drop tables in dependency order (dev convenience)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS bookings             CASCADE;
DROP TABLE IF EXISTS assets              CASCADE;
DROP TABLE IF EXISTS users               CASCADE;

-- ----------------------------------------------------------------
-- 1.  users
--     Mirrors: com.odoo.assetflow.model.User
--     Enum   : Role (ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE)
-- ----------------------------------------------------------------
CREATE TABLE users (
    id    BIGSERIAL    PRIMARY KEY,
    name  VARCHAR(150) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(30)  NOT NULL
        CONSTRAINT chk_user_role
            CHECK (role IN ('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'))
);

COMMENT ON TABLE  users       IS 'Platform users across all organizational roles.';
COMMENT ON COLUMN users.role  IS 'Maps to Java enum Role via @Enumerated(EnumType.STRING).';

-- ----------------------------------------------------------------
-- 2.  assets
--     Mirrors: com.odoo.assetflow.model.Asset
--     Enum   : AssetStatus
--     Note   : Hibernate maps camelCase field assetTag → asset_tag,
--              isSharedBookable → is_shared_bookable (Spring naming strategy)
-- ----------------------------------------------------------------
CREATE TABLE assets (
    id                 BIGSERIAL    PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    asset_tag          VARCHAR(50)  NOT NULL UNIQUE,   -- e.g. AF-0001
    is_shared_bookable BOOLEAN      NOT NULL DEFAULT FALSE,
    category           VARCHAR(100) NOT NULL DEFAULT 'Hardware',
    location           VARCHAR(100) NOT NULL DEFAULT 'HQ',
    assigned_user_id   BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    status             VARCHAR(30)  NOT NULL DEFAULT 'AVAILABLE'
        CONSTRAINT chk_asset_status
            CHECK (status IN (
                'AVAILABLE', 'ALLOCATED', 'RESERVED',
                'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'
            ))
);

COMMENT ON TABLE  assets                  IS 'Physical and virtual assets tracked by AssetFlow.';
COMMENT ON COLUMN assets.asset_tag        IS 'Unique human-readable identifier (e.g. AF-0042).';
COMMENT ON COLUMN assets.is_shared_bookable IS 'TRUE = calendar-bookable (rooms, projectors). FALSE = allocate-only.';
COMMENT ON COLUMN assets.status           IS 'Maps to Java enum AssetStatus via @Enumerated(EnumType.STRING).';

-- ----------------------------------------------------------------
-- 3.  bookings
--     Mirrors: com.odoo.assetflow.model.Booking
--     Enum   : BookingStatus
--     FKs    : asset_id → assets(id), user_id → users(id)
--     Index  : Covering index on (asset_id, status, start_time, end_time)
--              to accelerate the greedy overlap JPQL query.
-- ----------------------------------------------------------------
CREATE TABLE bookings (
    id         BIGSERIAL    PRIMARY KEY,
    asset_id   BIGINT       NOT NULL
        REFERENCES assets(id) ON DELETE CASCADE,
    user_id    BIGINT       NOT NULL
        REFERENCES users(id)  ON DELETE CASCADE,
    start_time TIMESTAMP    NOT NULL,
    end_time   TIMESTAMP    NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING'
        CONSTRAINT chk_booking_status
            CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_booking_interval CHECK (end_time > start_time)
);

-- Critical performance index for the greedy interval scheduler JPQL:
-- SELECT COUNT(b) FROM Booking b WHERE b.asset.id = :assetId
--   AND b.status IN ('UPCOMING','ONGOING')
--   AND b.startTime < :requestedEndTime
--   AND b.endTime   > :requestedStartTime
CREATE INDEX idx_bookings_overlap
    ON bookings (asset_id, status, start_time, end_time);

COMMENT ON TABLE  bookings            IS 'Time-slot reservations for shared bookable assets.';
COMMENT ON COLUMN bookings.start_time IS 'Maps to Java LocalDateTime; stored as TIMESTAMP (no tz).';
COMMENT ON COLUMN bookings.end_time   IS 'Maps to Java LocalDateTime; stored as TIMESTAMP (no tz).';
COMMENT ON INDEX  idx_bookings_overlap IS 'Covering index to accelerate the greedy interval overlap check.';

-- ----------------------------------------------------------------
-- 4.  maintenance_requests
--     Mirrors: com.odoo.assetflow.model.MaintenanceRequest
--     Enum   : MaintenanceStatus
--     FK     : asset_id → assets(id)
-- ----------------------------------------------------------------
CREATE TABLE maintenance_requests (
    id                  BIGSERIAL    PRIMARY KEY,
    asset_id            BIGINT       NOT NULL
        REFERENCES assets(id) ON DELETE CASCADE,
    description         TEXT         NOT NULL,
    priority            VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM'
        CONSTRAINT chk_maintenance_priority
            CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status              VARCHAR(30)  NOT NULL DEFAULT 'PENDING'
        CONSTRAINT chk_maintenance_status
            CHECK (status IN (
                'PENDING', 'APPROVED', 'REJECTED',
                'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'
            )),
    assigned_technician VARCHAR(150)          -- NULL until TECHNICIAN_ASSIGNED
);

COMMENT ON TABLE  maintenance_requests                    IS 'Tracks repair/service requests through the Kanban state machine.';
COMMENT ON COLUMN maintenance_requests.assigned_technician IS 'Populated when status transitions to TECHNICIAN_ASSIGNED.';

-- ============================================================
--  Schema complete.  Row counts after data.sql:
--    users                : 4
--    assets               : 7
--    bookings             : 4  (2 active for overlap test)
--    maintenance_requests : 3
-- ============================================================
