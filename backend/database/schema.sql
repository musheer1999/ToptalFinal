-- ═══════════════════════════════════════════════════════════════
-- FOOD DELIVERY DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════
-- Run this file ONCE to create all tables in your PostgreSQL database
-- In pgAdmin: Right-click database → Query Tool → paste this → Execute
-- ═══════════════════════════════════════════════════════════════


-- ─── TABLE 1: USERS ─────────────────────────────────────────────
-- Stores all users: both customers and restaurant owners
-- Role field decides what they can do in the app

CREATE TABLE users (
    id           SERIAL PRIMARY KEY,           -- Auto-incrementing unique ID
    email        VARCHAR(255) UNIQUE NOT NULL, -- Email must be unique
    password     VARCHAR(255) NOT NULL,        -- Stored as hashed (bcrypt), never plain text
    role         VARCHAR(20) NOT NULL          -- Either 'customer' or 'owner'
                 CHECK (role IN ('customer', 'owner')),
    is_blocked   BOOLEAN DEFAULT FALSE,        -- True if any restaurant owner blocked them
    created_at   TIMESTAMP DEFAULT NOW()       -- When account was created
);


-- ─── TABLE 2: RESTAURANTS ───────────────────────────────────────
-- Each restaurant is owned by ONE user (with role='owner')

CREATE TABLE restaurants (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,                         -- TEXT = long text, no length limit
    cuisine      VARCHAR(100),                 -- e.g., 'Italian', 'Japanese'
    latitude     DECIMAL(10, 8),               -- For location (optional)
    longitude    DECIMAL(11, 8),
    owner_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW()
);
-- ON DELETE CASCADE = if user is deleted, their restaurants are also deleted


-- ─── TABLE 3: MEALS ─────────────────────────────────────────────
-- Each meal belongs to ONE restaurant

CREATE TABLE meals (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(10, 2) NOT NULL,   -- e.g., 12.99 (2 decimal places for money)
    type            VARCHAR(100),              -- e.g., 'Main', 'Dessert', 'Drink'
    restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW()
);


-- ─── TABLE 4: COUPONS ───────────────────────────────────────────
-- Each coupon belongs to a restaurant and gives % discount

CREATE TABLE coupons (
    id                    SERIAL PRIMARY KEY,
    code                  VARCHAR(50) NOT NULL,      -- e.g., 'FAMILY20'
    discount_percentage   INTEGER NOT NULL           -- e.g., 20 means 20% off
                          CHECK (discount_percentage BETWEEN 1 AND 100),
    restaurant_id         INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at            TIMESTAMP DEFAULT NOW(),

    UNIQUE(restaurant_id, code)   -- Same code can exist in different restaurants
);


-- ─── TABLE 5: ORDERS ────────────────────────────────────────────
-- Main order table - stores summary info

CREATE TABLE orders (
    id             SERIAL PRIMARY KEY,
    customer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    coupon_id      INTEGER REFERENCES coupons(id) ON DELETE SET NULL,  -- Optional coupon

    subtotal       DECIMAL(10, 2) NOT NULL,     -- Sum of all meal prices
    discount       DECIMAL(10, 2) DEFAULT 0,    -- Amount saved from coupon
    tip            DECIMAL(10, 2) DEFAULT 0,    -- Custom tip amount
    total          DECIMAL(10, 2) NOT NULL,     -- Final total = subtotal - discount + tip

    status         VARCHAR(20) NOT NULL DEFAULT 'Placed'
                   CHECK (status IN ('Placed', 'Processing', 'In Route',
                                     'Delivered', 'Received', 'Canceled')),

    created_at     TIMESTAMP DEFAULT NOW()
);


-- ─── TABLE 6: ORDER_ITEMS ───────────────────────────────────────
-- Each row = one meal in an order (with quantity)
-- This is a "junction table" connecting orders and meals

CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    meal_id     INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    price       DECIMAL(10, 2) NOT NULL   -- Price AT THE TIME of order
                                          -- We save this because meal price might change later
);
-- WHY save price here? Example:
-- If meal was $10 when ordered, but owner changes to $15 later,
-- the order history should still show $10. Hence we snapshot the price.


-- ─── TABLE 7: ORDER_STATUS_HISTORY ──────────────────────────────
-- Tracks every status change with timestamp
-- Required by: "Orders should have a history of the date and time of the status change"

CREATE TABLE order_status_history (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL,
    changed_at  TIMESTAMP DEFAULT NOW()
);


-- ─── TABLE 8: BLOCKED_USERS ─────────────────────────────────────
-- Tracks which users are blocked by which restaurant owner
-- Required by: "Restaurant owners can block a user"

CREATE TABLE blocked_users (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    blocked_at     TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, restaurant_id)   -- Can't block the same user twice in same restaurant
);


-- ─── INDEXES (for faster queries) ───────────────────────────────
-- Indexes make queries faster when searching by these columns

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_meals_restaurant ON meals(restaurant_id);
CREATE INDEX idx_coupons_restaurant ON coupons(restaurant_id);


-- ═══════════════════════════════════════════════════════════════
-- Done! You should now have 8 tables in your database.
-- Check in pgAdmin: Expand database → Schemas → public → Tables
-- ═══════════════════════════════════════════════════════════════
