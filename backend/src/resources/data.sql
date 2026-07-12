-- ============================================================
--  AssetFlow Enterprise — Mock Data
--  Execute AFTER schema.sql on database: assetflow
--
--  Embedded test scenarios:
--    [T-1] Double-Allocation Block  → Asset AF-0003 (ALLOCATED)
--    [T-2] Greedy Interval Overlap  → Conference Room A (AF-0005)
--                                     has an UPCOMING booking 10:00–11:00 today.
--                                     Any overlapping request must return 409.
--    [T-3] Maintenance State Machine → Projector (AF-0006) in PENDING state.
-- ============================================================

-- ----------------------------------------------------------------
-- 1.  USERS  (one of each Role)
-- ----------------------------------------------------------------
INSERT INTO users (id, name, email, password, role) VALUES
    (1, 'Aisha Patel',   'aisha.patel@assetflow.io',   '{noop}password', 'ADMIN'),
    (2, 'Marcus Webb',   'marcus.webb@assetflow.io',   '{noop}password', 'ASSET_MANAGER'),
    (3, 'Divya Menon',   'divya.menon@assetflow.io',   '{noop}password', 'DEPARTMENT_HEAD'),
    (4, 'James Okafor',  'james.okafor@assetflow.io',  '{noop}password', 'EMPLOYEE'),
    (5, 'Sarah Chen',    'sarah.chen@assetflow.io',    '{noop}password', 'EMPLOYEE'),
    (6, 'Arjun Mehta',   'arjun.mehta@assetflow.io',   '{noop}password', 'EMPLOYEE'),
    (7, 'Priya Nair',    'priya.nair@assetflow.io',    '{noop}password', 'DEPARTMENT_HEAD');

-- Keep sequence in sync
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------------
-- 2.  ASSETS
--     is_shared_bookable = TRUE  → calendar booking via /bookings
--     is_shared_bookable = FALSE → direct allocation via /assets/{id}/allocate
-- ----------------------------------------------------------------
INSERT INTO assets (id, name, asset_tag, is_shared_bookable, status, category, location, assigned_user_id) VALUES

    -- Allocatable hardware (is_shared_bookable = FALSE)
    (1,  'MacBook Pro 16"',        'AF-0001', FALSE, 'AVAILABLE', 'Laptop', 'HQ Floor 3', NULL),
    (2,  'ThinkPad X1 Carbon',     'AF-0002', FALSE, 'AVAILABLE', 'Laptop', 'HQ Floor 2', NULL),

    -- [T-1] CONFLICT TEST — ALLOCATED asset for double-allocation block
    (3,  'Dell XPS Workstation',   'AF-0003', FALSE, 'ALLOCATED', 'Desktop', 'HQ Floor 2', 4),

    (4,  'iPad Pro 12.9"',         'AF-0004', FALSE, 'AVAILABLE', 'Tablet', 'HQ Floor 1', NULL),

    -- Bookable shared resources (is_shared_bookable = TRUE)
    (5,  'Conference Room A',      'AF-0005', TRUE,  'AVAILABLE', 'Room', 'HQ Floor 5', NULL),
    (6,  'Epson Projector X500',   'AF-0006', TRUE,  'AVAILABLE', 'AV Equip', 'Conf Room A', NULL),
    (7,  'Training Lab',           'AF-0007', TRUE,  'AVAILABLE', 'Room', 'HQ Floor 4', NULL);

SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets));

-- ----------------------------------------------------------------
-- 3.  BOOKINGS
--     All times stored as TIMESTAMP (no time zone), matching Java
--     LocalDateTime serialised by Spring Boot without zone offset.
--
--     [T-2] OVERLAP seed row — asset_id=5 (Conference Room A)
--           status = UPCOMING so the JPQL overlap query counts it.
--           Any new booking request for asset 5 that overlaps
--           10:00–11:00 today MUST be rejected with HTTP 409.
-- ----------------------------------------------------------------

-- Completed booking from yesterday (should NOT block new slots)
INSERT INTO bookings (id, asset_id, user_id, start_time, end_time, status) VALUES
    (1, 5, 3,
     (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP + TIME '14:00:00',
     (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP + TIME '15:30:00',
     'COMPLETED');

-- [T-2] ★ LIVE OVERLAP SEED — blocks any new request overlapping 10:00–11:00 TODAY
INSERT INTO bookings (id, asset_id, user_id, start_time, end_time, status) VALUES
    (2, 5, 4,
     CURRENT_DATE::TIMESTAMP + TIME '10:00:00',
     CURRENT_DATE::TIMESTAMP + TIME '11:00:00',
     'UPCOMING');

-- A second active booking for the same room (afternoon), demonstrates multi-slot tracking
INSERT INTO bookings (id, asset_id, user_id, start_time, end_time, status) VALUES
    (3, 5, 7,
     CURRENT_DATE::TIMESTAMP + TIME '14:00:00',
     CURRENT_DATE::TIMESTAMP + TIME '16:00:00',
     'UPCOMING');

-- Booking on a different bookable asset (Training Lab) — should not conflict with Room A
INSERT INTO bookings (id, asset_id, user_id, start_time, end_time, status) VALUES
    (4, 7, 5,
     CURRENT_DATE::TIMESTAMP + TIME '09:00:00',
     CURRENT_DATE::TIMESTAMP + TIME '12:00:00',
     'ONGOING');

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- ----------------------------------------------------------------
-- 4.  MAINTENANCE REQUESTS
--     [T-3] PENDING request on Projector (AF-0006) — Kanban start state.
--           Drag to APPROVED → PATCH /api/v1/maintenance/1/status
--           Drag PENDING → IN_PROGRESS (illegal jump) → must return HTTP 400.
-- ----------------------------------------------------------------
INSERT INTO maintenance_requests (id, asset_id, description, priority, status, assigned_technician) VALUES

    -- [T-3] ★ PENDING — baseline for Kanban drag test
    (1, 6,
     'Projector lamp at end-of-life; flickering during presentations.',
     'HIGH', 'PENDING', NULL),

    -- Already-approved request (Kanban column: APPROVED)
    (2, 2,
     'ThinkPad keyboard key (R) physically broken; keys sticking.',
     'MEDIUM', 'APPROVED', NULL),

    -- In-progress repair with assigned technician
    (3, 3,
     'Dell XPS GPU overheating under sustained compute load (>85°C).',
     'CRITICAL', 'TECHNICIAN_ASSIGNED', 'Rahul Sharma'),

    -- Resolved maintenance — asset returned to pool
    (4, 1,
     'MacBook Pro battery swelling; replaced under warranty.',
     'HIGH', 'RESOLVED', 'Kevin O''Brien');

SELECT setval('maintenance_requests_id_seq', (SELECT MAX(id) FROM maintenance_requests));

-- ============================================================
--  Verification queries — run these after loading data:
--
--  SELECT * FROM users;
--  SELECT * FROM assets;
--  SELECT * FROM bookings WHERE status IN ('UPCOMING','ONGOING') ORDER BY start_time;
--  SELECT * FROM maintenance_requests;
--
--  Overlap probe (simulates JPQL countOverlappingBookings for asset 5, 10:30–11:30):
--  SELECT COUNT(*) FROM bookings
--   WHERE asset_id = 5
--     AND status IN ('UPCOMING', 'ONGOING')
--     AND start_time < (CURRENT_DATE::TIMESTAMP + TIME '11:30:00')
--     AND end_time   > (CURRENT_DATE::TIMESTAMP + TIME '10:30:00');
--  Expected result: 1  (proves overlap block is live)
-- ============================================================
